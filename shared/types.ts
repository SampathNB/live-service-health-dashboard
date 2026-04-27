/**
 * Shared types for Pulse: Real-Time Service Health Dashboard
 */

export type ServiceStatus = 'healthy' | 'degraded' | 'down';
export type ServiceTier = 'critical' | 'standard' | 'best-effort';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  group: string; // e.g., "core", "payments", "infra"
  lastCheckedAt: string; // ISO 8601
  metadata: {
    owner: string;
    tier: ServiceTier;
    dependencies: string[]; // service IDs this depends on
  };
  metrics?: MetricDataPoint; // Latest metrics snapshot
}

export interface MetricDataPoint {
  timestamp: string; // ISO 8601
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  requestRate: number; // requests per second
  errorRate: number; // percentage (0-100)
  cpu: number; // percentage (0-100)
  memory: number; // percentage (0-100)
}

export interface Alert {
  id: string;
  serviceId: string;
  serviceName: string;
  severity: AlertSeverity;
  message: string;
  metric: string; // which metric triggered it
  threshold: number;
  currentValue: number;
  status: AlertStatus;
  triggeredAt: string; // ISO 8601
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface DashboardSummary {
  totalServices: number;
  healthyCount: number;
  degradedCount: number;
  downCount: number;
  activeAlerts: {
    critical: number;
    warning: number;
    info: number;
  };
  avgResponseTime: number;
}

export type StreamEvent =
  | { type: 'metric_update'; serviceId: string; data: MetricDataPoint }
  | { type: 'alert_created'; data: Alert }
  | { type: 'status_change'; serviceId: string; from: ServiceStatus; to: ServiceStatus };

export interface FeatureFlags {
  'enable-metrics-panel': boolean;
  'enable-alert-actions': boolean;
}
