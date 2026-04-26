import { MetricDataPoint } from "../../../shared/types";

export function getLocalISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}`;
}

export function generateMetric(serviceId: string, time: number): MetricDataPoint {
  const seed = parseInt(serviceId.slice(0, 8), 36) % 100;

  const p50Base = 50 + (seed % 100);
  const p50 = Math.max(1, p50Base + Math.sin(time / 10) * 20 + Math.random() * 5);
  const p95 = Math.max(p50, p50 * (1.5 + Math.random() * 0.5));
  const p99 = Math.max(p95, p95 * (2 + Math.random() * 1.5));

  const requestRate = 100 + Math.sin(time / 5) * 50 + Math.random() * 10;

  let errorRate = 0.1 + Math.random() * 0.5;
  if (Math.random() > 0.92) errorRate += 15 + Math.random() * 20;

  let cpu = 20 + Math.sin(time / 8) * 15 + Math.random() * 5;
  if (Math.random() > 0.95) cpu += 60;
  const memory = 40 + Math.cos(time / 12) * 20 + Math.random() * 2;

  return {
    timestamp: getLocalISOString(new Date()),
    responseTime: { p50, p95, p99 },
    requestRate,
    errorRate,
    cpu,
    memory
  };
}
