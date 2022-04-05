// lib
import { WebSocketServer } from "ws";

interface WebSocketOptions {
  port: number;
}

export function websocket(options: WebSocketOptions) {
  const wss = new WebSocketServer({
    port: options.port
  });

  return {
    refresh() {
      for (const client of wss.clients)
        client.send(JSON.stringify({ type: "refresh" }));
    },
    close() {
      wss.close();
    }
  };
}
