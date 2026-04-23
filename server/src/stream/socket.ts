import { WebSocket } from "ws";
import { StreamEvent } from "../../../shared/types";

export const clients = new Set<WebSocket>();

export function broadcast(event: StreamEvent) {
  const msg = JSON.stringify(event);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}
