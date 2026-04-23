import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { SERVICES, METRICS_HISTORY, seedServices, MAX_HISTORY } from "./data/registry";
import { generateMetric } from "./services/metrics";
import { checkAlerts } from "./services/alerts";
import { clients, broadcast } from "./stream/socket";
import servicesRouter from "./routes/services";
import alertsRouter from "./routes/alerts";
import summaryRouter from "./routes/summary";
import { ServiceStatus } from "../../shared/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.use(express.json());

// Seeding
seedServices();

// Simulation Loop
let tick = 0;
setInterval(() => {
  tick++;
  SERVICES.forEach(service => {
    const metric = generateMetric(service.id, tick);
    
    // Update history
    const history = METRICS_HISTORY.get(service.id) || [];
    history.push(metric);
    if (history.length > MAX_HISTORY) history.shift();
    METRICS_HISTORY.set(service.id, history);

    // Alert Generation
    checkAlerts(service, metric, (alert) => {
      broadcast({ type: 'alert_created', data: alert });
    });

    // Update Status
    const prevStatus = service.status;
    let newStatus: ServiceStatus = "healthy";
    if (metric.errorRate > 10 || metric.responseTime.p99 > 2000) {
      newStatus = "down";
    } else if (metric.errorRate > 2 || metric.responseTime.p95 > 1000) {
      newStatus = "degraded";
    }

    if (newStatus !== prevStatus) {
      service.status = newStatus;
      service.lastCheckedAt = new Date().toISOString();
      broadcast({
        type: 'status_change',
        serviceId: service.id,
        from: prevStatus,
        to: newStatus
      });
    }

    // Broadcast metric update
    broadcast({
      type: 'metric_update',
      serviceId: service.id,
      data: metric
    });
  });
}, 3000);

// WS Handling
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  const pathname = url.pathname;
  
  if (pathname === '/api/stream') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    // Vite handles HMR etc
    console.log(`Bypassing upgrade request for ${pathname}`);
  }
});

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// API Routes
app.use("/api/services", servicesRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/dashboard/summary", summaryRouter);

// Vite Integration
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: dist path might need adjustment based on final build config
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log("--------------------------------------------------");
    console.log(`🚀 PULSE DASHBOARD STARTING`);
    console.log(`📡 API & WS Server: http://localhost:${PORT}/api`);
    console.log(`💻 Client Dashboard: http://localhost:${PORT}`);
    console.log("--------------------------------------------------");
  });
}

startServer();
