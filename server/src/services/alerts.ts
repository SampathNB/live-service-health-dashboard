import { Service, MetricDataPoint, Alert, AlertMetric, AlertSeverity } from "../../../shared/types";
import { nanoid } from "nanoid";
import { ALERTS } from "../data/registry";

export function checkAlerts(service: Service, metric: MetricDataPoint, onAlert: (alert: Alert) => void) {
  const thresholdConfigs = [
    { metric: 'errorRate' as AlertMetric, threshold: 1, severity: 'info' as AlertSeverity, msg: 'Minor errors detected' },
    { metric: 'errorRate' as AlertMetric, threshold: 5, severity: 'warning' as AlertSeverity, msg: 'Elevated error rate' },
    { metric: 'errorRate' as AlertMetric, threshold: 15, severity: 'critical' as AlertSeverity, msg: 'High error rate detected' },
    { metric: 'p95' as AlertMetric, threshold: 500, severity: 'info' as AlertSeverity, msg: 'Latency trending high' },
    { metric: 'p99' as AlertMetric, threshold: 2000, severity: 'critical' as AlertSeverity, msg: 'Critical P99 latency spike' },
    { metric: 'memory' as AlertMetric, threshold: 70, severity: 'info' as AlertSeverity, msg: 'Memory utilization rising' },
    { metric: 'cpu' as AlertMetric, threshold: 90, severity: 'warning' as AlertSeverity, msg: 'High CPU utilization' }
  ] as const;

  const getMetricValue = (configMetric: AlertMetric): number => {
    switch (configMetric) {
      case 'errorRate':
        return metric.errorRate;
      case 'p50':
        return metric.responseTime.p50;
      case 'p95':
        return metric.responseTime.p95;
      case 'p99':
        return metric.responseTime.p99;
      case 'memory':
        return metric.memory;
      case 'cpu':
        return metric.cpu;
    }
  };

  thresholdConfigs.forEach(config => {
    const val = getMetricValue(config.metric);
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
