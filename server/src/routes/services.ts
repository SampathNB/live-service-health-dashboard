import { Router } from "express";
import { METRICS_HISTORY, SERVICES } from "../data/registry";

const router = Router();

function getTimeRangeMs(timeRange: string): number {
  const ranges: Record<string, number> = {
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000
  };
  return ranges[timeRange] || 15 * 60 * 1000; // Default to 15 minutes
}

router.get("/", (req, res) => {
  // Include latest metrics for each service
  const servicesWithMetrics = SERVICES.map(service => {
    const history = METRICS_HISTORY.get(service.id) || [];
    const latestMetric = history.length > 0 ? history[history.length - 1] : undefined;
    return {
      ...service,
      metrics: latestMetric
    };
  });
  res.json(servicesWithMetrics);
});

router.get("/:id/metrics", (req, res) => {
  const history = METRICS_HISTORY.get(req.params.id) || [];
  const timeRange = req.query.timeRange as string | undefined;

  if (!timeRange) {
    res.json(history);
    return;
  }

  const rangeMs = getTimeRangeMs(timeRange);
  const now = Date.now();
  const cutoffTime = now - rangeMs;

  const filtered = history.filter(metric => {
    const metricTime = new Date(metric.timestamp).getTime();
    return metricTime >= cutoffTime;
  });

  res.json(filtered);
});

export default router;
