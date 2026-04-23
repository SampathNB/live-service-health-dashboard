import { Router } from "express";
import { ALERTS } from "../data/registry";
import { Alert } from "../../../shared/types";

const router = Router();

router.get("/", (req, res) => {
  const { status, severity, serviceId, page = 1, pageSize = 25, search } = req.query;
  let filtered = ALERTS;
  
  if (status) filtered = filtered.filter(a => a.status === status);
  if (severity) filtered = filtered.filter(a => a.severity === severity);
  if (serviceId) filtered = filtered.filter(a => a.serviceId === serviceId);
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter(a => a.message.toLowerCase().includes(s) || a.serviceName.toLowerCase().includes(s));
  }

  const start = (Number(page) - 1) * Number(pageSize);
  const paginated = filtered.slice(start, start + Number(pageSize));

  res.json({
    data: paginated,
    total: filtered.length,
    page: Number(page),
    pageSize: Number(pageSize)
  });
});

router.patch("/:id", (req, res) => {
  const { status } = req.body;
  const alert = ALERTS.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });

  alert.status = status;
  if (status === 'acknowledged') alert.acknowledgedAt = new Date().toISOString();
  if (status === 'resolved') alert.resolvedAt = new Date().toISOString();
  
  res.json(alert);
});

export default router;
