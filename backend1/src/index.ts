import { createServer } from "node:http";
//ws in nodejs
import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager.js';

const PORT = Number(process.env.PORT) || 8080;

const server = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("DevChess server is running");
});

const wss = new WebSocketServer({ server, maxPayload: 1024 });
const gameManager = new GameManager();

wss.on("connection", (ws) => {
  gameManager.addUser(ws);
  ws.on("close", () => gameManager.removeUser(ws));
});

server.listen(PORT, () => {
  console.log(`DevChess server listening on port ${PORT}`);
});
