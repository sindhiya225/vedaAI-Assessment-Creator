import type { Server } from "node:http";
import { WebSocketServer } from "ws";
import type { WsEvent } from "@vedaai/shared";

let wss: WebSocketServer | null = null;

export function attachRealtime(server: Server) {
  wss = new WebSocketServer({ server });
  wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "connected", message: "Realtime channel ready" }));
  });
}

export function broadcast(event: WsEvent) {
  if (!wss) return;
  const payload = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) client.send(payload);
  }
}
