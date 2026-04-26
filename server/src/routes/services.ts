import { Router } from "express";
import { SERVICES, METRICS_HISTORY } from "../data/registry";

const router = Router();

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
  res.json(history);
});

export default router;
