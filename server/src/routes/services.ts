import { Router } from "express";
import { SERVICES, METRICS_HISTORY } from "../data/registry";

const router = Router();

router.get("/", (req, res) => {
  res.json(SERVICES);
});

router.get("/:id/metrics", (req, res) => {
  const history = METRICS_HISTORY.get(req.params.id) || [];
  res.json(history);
});

export default router;
