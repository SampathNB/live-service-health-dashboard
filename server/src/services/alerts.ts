import { Service, MetricDataPoint, Alert, AlertSeverity } from "../../../shared/types";
import { nanoid } from "nanoid";
import { ALERTS } from "../data/registry";

export function checkAlerts(service: Service, metric: MetricDataPoint, onAlert: (alert: Alert) => void) {
  const thresholdConfigs = [
    { metric: 'errorRate', threshold: 1, severity: 'info' as AlertSeverity, msg: 'Minor errors detected' },
    { metric: 'errorRate', threshold: 5, severity: 'warning' as AlertSeverity, msg: 'Elevated error rate' },
    { metric: 'errorRate', threshold: 15, severity: 'critical' as AlertSeverity, msg: 'High error rate detected' },
    { metric: 'p95', threshold: 500, severity: 'info' as AlertSeverity, msg: 'Latency trending high' },
    { metric: 'p99', threshold: 2000, severity: 'critical' as AlertSeverity, msg: 'Critical P99 latency spike' },
    { metric: 'memory', threshold: 70, severity: 'info' as AlertSeverity, msg: 'Memory utilization rising' },
    { metric: 'cpu', threshold: 90, severity: 'warning' as AlertSeverity, msg: 'High CPU utilization' }
  ];

  thresholdConfigs.forEach(config => {
    const val = config.metric === 'p99' ? metric.responseTime.p99
              : config.metric === 'p95' ? metric.responseTime.p95
              : config.metric === 'p50' ? metric.responseTime.p50
              : (metric as any)[config.metric];
    if (val > config.threshold) {
      const activeAlert = ALERTS.find(a => a.serviceId === service.id && a.metric === config.metric && a.severity === config.severity && a.status === 'open');
      if (!activeAlert) {
        const alert: Alert = {
          id: nanoid(),
          serviceId: service.id,
          serviceName: service.name,
          severity: config.severity,
          message: config.msg,
          metric: config.metric,
          threshold: config.threshold,
          currentValue: val,
          status: 'open',
          triggeredAt: new Date().toISOString()
        };
        ALERTS.unshift(alert);
        if (ALERTS.length > 2000) ALERTS.pop();
        onAlert(alert);
      }
    }
  });
}
