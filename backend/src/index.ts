import { createServer } from "node:http";
//ws in nodejs
import { WebSocketServer, type WebSocket } from 'ws';
import { GameManager } from './GameManager.js';

const PORT = Number(process.env.PORT) || 8080;
const HEARTBEAT_INTERVAL_MS = 30_000;

const server = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("DevChess server is running");
});

const wss = new WebSocketServer({ server, maxPayload: 1024 });
const gameManager = new GameManager();

const isAlive = new WeakMap<WebSocket, boolean>();

wss.on("connection", (ws) => {
  isAlive.set(ws, true);
  ws.on("pong", () => isAlive.set(ws, true));

  gameManager.addUser(ws);
  ws.on("close", () => gameManager.removeUser(ws));
});

// Every interval: drop clients that never answered the previous ping, then ping the rest.
const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (isAlive.get(ws) === false) {
      ws.terminate(); // fires "close", so removeUser runs and the opponent is notified
      continue;
    }
    isAlive.set(ws, false);
    ws.ping();
  }
}, HEARTBEAT_INTERVAL_MS);

wss.on("close", () => clearInterval(heartbeat));

server.listen(PORT, () => {
  console.log(`DevChess server listening on port ${PORT}`);
});
