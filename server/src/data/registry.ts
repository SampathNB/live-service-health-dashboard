import { nanoid } from "nanoid";
import { Alert, MetricDataPoint, Service } from "../../../shared/types";
import { generateMetric, getLocalISOString } from "../services/metrics";

// --- State ---
export const SERVICES: Service[] = [];
export const METRICS_HISTORY: Map<string, MetricDataPoint[]> = new Map();
export const ALERTS: Alert[] = [];
export const MAX_HISTORY = 1000;

const SERVICE_NAMES = [
  "api-gateway", "auth-service", "payment-service", "order-service",
  "inventory-db", "shipping-worker", "search-engine", "user-profile",
  "recommendation-engine", "email-server", "logging-pipeline", "billing-batch",
  "analytics-dashboard", "legacy-crm-proxy", "notification-hub", "cdn-orchestrator",
  "dns-manager", "secrets-vault", "load-balancer-main", "image-processor"
];

function generateHistoricalMetrics(serviceId: string, count: number = 100): MetricDataPoint[] {
  const metrics: MetricDataPoint[] = [];
  const now = Date.now();

  // Generate metrics going back in time (roughly 1 per 3 seconds for 100 metrics = ~5 minutes)
  for (let i = count; i > 0; i--) {
    const timeOffsetMs = i * 3000; // Each metric is ~3 seconds apart
    const timestamp = getLocalISOString(new Date(now - timeOffsetMs));
    const metric = generateMetric(serviceId, i);
    metrics.push({ ...metric, timestamp });
  }

  return metrics;
}

export function seedServices() {
  SERVICE_NAMES.forEach(name => {
    const service: Service = {
      id: nanoid(),
      name,
      status: "healthy",
      group: name.includes("service") || name.includes("api") ? "core" :
        name.includes("db") || name.includes("vault") ? "infra" : "app",
      lastCheckedAt: new Date().toISOString(),
      metadata: {
        owner: "platform-team@example.com",
        tier: name.includes("gateway") || name.includes("auth") || name.includes("payment") ? "critical" : "standard",
        dependencies: []
      }
    };
    SERVICES.push(service);
    // Populate with historical metrics
    METRICS_HISTORY.set(service.id, generateHistoricalMetrics(service.id, MAX_HISTORY));
  });

  // Add some dependencies
  SERVICES.forEach(s => {
    if (s.name === "order-service") {
      const auth = SERVICES.find(x => x.name === "auth-service");
      const payment = SERVICES.find(x => x.name === "payment-service");
      if (auth) s.metadata.dependencies.push(auth.id);
      if (payment) s.metadata.dependencies.push(payment.id);
    }
  });
}
