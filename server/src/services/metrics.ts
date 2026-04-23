import { MetricDataPoint } from "../../../shared/types";

export function generateMetric(serviceId: string, time: number): MetricDataPoint {
  const seed = parseInt(serviceId.slice(0, 8), 36) % 100;
  
  const p50Base = 50 + (seed % 100);
  const p50 = p50Base + Math.sin(time / 10) * 20 + Math.random() * 5;
  const p95 = p50 * (1.5 + Math.random() * 0.5);
  const p99 = p95 * (2 + Math.random() * 1.5);

  const requestRate = 100 + Math.sin(time / 5) * 50 + Math.random() * 10;
  
  let errorRate = 0.1 + Math.random() * 0.5;
  if (Math.random() > 0.92) errorRate += 15 + Math.random() * 20;

  let cpu = 20 + Math.sin(time / 8) * 15 + Math.random() * 5;
  if (Math.random() > 0.95) cpu += 60;
  const memory = 40 + Math.cos(time / 12) * 20 + Math.random() * 2;

  return {
    timestamp: new Date().toISOString(),
    responseTime: { p50, p95, p99 },
    requestRate,
    errorRate,
    cpu,
    memory
  };
}
