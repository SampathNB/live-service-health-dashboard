import { Router } from "express";
import { SERVICES, METRICS_HISTORY, ALERTS } from "../data/registry";
import { DashboardSummary } from "../../../shared/types";

const router = Router();

router.get("/", (req, res) => {
  const summary: DashboardSummary = {
    totalServices: SERVICES.length,
    healthyCount: SERVICES.filter(s => s.status === 'healthy').length,
    degradedCount: SERVICES.filter(s => s.status === 'degraded').length,
    downCount: SERVICES.filter(s => s.status === 'down').length,
    activeAlerts: {
      critical: ALERTS.filter(a => a.status === 'open' && a.severity === 'critical').length,
      warning: ALERTS.filter(a => a.status === 'open' && a.severity === 'warning').length,
      info: ALERTS.filter(a => a.status === 'open' && a.severity === 'info').length,
    },
    avgResponseTime: SERVICES.reduce((acc, s) => {
      const history = METRICS_HISTORY.get(s.id) || [];
      const latest = history[history.length - 1];
      return acc + (latest?.responseTime.p50 || 0);
    }, 0) / SERVICES.length
  };
  res.json(summary);
});

export default router;
