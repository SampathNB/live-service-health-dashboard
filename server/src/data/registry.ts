import { nanoid } from "nanoid";
import { Service, Alert, MetricDataPoint } from "../../../shared/types";

// --- State ---
export const SERVICES: Service[] = [];
export const METRICS_HISTORY: Map<string, MetricDataPoint[]> = new Map();
export const ALERTS: Alert[] = [];
export const MAX_HISTORY = 100;

const SERVICE_NAMES = [
  "api-gateway", "auth-service", "payment-service", "order-service", 
  "inventory-db", "shipping-worker", "search-engine", "user-profile",
  "recommendation-engine", "email-server", "logging-pipeline", "billing-batch",
  "analytics-dashboard", "legacy-crm-proxy", "notification-hub", "cdn-orchestrator",
  "dns-manager", "secrets-vault", "load-balancer-main", "image-processor"
];

export function seedServices() {
  SERVICE_NAMES.forEach(name => {
    const service: Service = {
      id: nanoid(),
      name,
      status: "healthy",
      group: name.includes("service") || name.includes("api") ? "core" : 
             name.includes("db") || name.includes("vault") ? "infra" : "app",
      lastCheckedAt: new Date().toISOString(),
      metadata: {
        owner: "platform-team@example.com",
        tier: name.includes("gateway") || name.includes("auth") || name.includes("payment") ? "critical" : "standard",
        dependencies: []
      }
    };
    SERVICES.push(service);
    METRICS_HISTORY.set(service.id, []);
  });

  // Add some dependencies
  SERVICES.forEach(s => {
    if (s.name === "order-service") {
      const auth = SERVICES.find(x => x.name === "auth-service");
      const payment = SERVICES.find(x => x.name === "payment-service");
      if (auth) s.metadata.dependencies.push(auth.id);
      if (payment) s.metadata.dependencies.push(payment.id);
    }
  });
}
