# DevChess

Real-time multiplayer chess in the browser. Click play, get matched with another player, and start a game. No account needed.

**Live:** _coming soon_

## Features

- **Live matchmaking** that pairs you with the next player looking for a game
- **Server-side move validation**, so the server is the referee and a modified client can't make illegal moves
- **Full chess rules**, including castling, en passant, promotion, and every draw condition (stalemate, threefold repetition, insufficient material, 50-move rule)
- **Resilient connections**, with automatic reconnection with backoff and server heartbeats that detect dropped players
- **An animated landing page** that replays Byrne vs. Fischer, New York 1956, "The Game of the Century"
- **Smooth page transitions**, where the board morphs between pages using the View Transitions API
- **Mobile-friendly**: the board scales to any screen

## How it works

The backend is a Node.js WebSocket server and the single source of truth for every game. Clients send moves; the server validates each one with chess.js, updates the game, and relays it to the opponent. Clients also run chess.js locally, but only to show legal-move hints. The server never trusts them.

Messages are small JSON objects:

| Message | Direction | Purpose |
|---|---|---|
| `init_game` | client → server | Join the matchmaking queue |
| `init_game` | server → client | Match found; includes your color |
| `move` | both ways | A move, e.g. `{ "from": "e2", "to": "e4" }` |
| `game_over` | server → client | The winner (or `null` for a draw) and the reason |

Every incoming message is validated with zod before the server acts on it.

## Tech stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, chess.js
**Backend:** Node.js, TypeScript, ws, chess.js, zod

## Running locally

Requires Node.js 20 or newer.

```bash
git clone https://github.com/DevdharManpuria/chess.git
cd chess
npm run setup   # installs dependencies for both apps
npm run dev     # starts the server (port 8080) and the frontend (port 5173)
```

Then open http://localhost:5173. To play against yourself, open a second browser window and click **Find a match** in both.

## Configuration

| Variable | App | Description |
|---|---|---|
| `VITE_WS_URL` | frontend | WebSocket URL of the backend. Defaults to `ws://localhost:8080`. Must use `wss://` in production. |
| `PORT` | backend | Port to listen on. Defaults to `8080`; hosting platforms set it automatically. |

See `frontend/.env.example`.

## Project structure

```
chess/
├── backend/            WebSocket server
│   └── src/
│       ├── index.ts        HTTP + WebSocket server, heartbeat
│       ├── GameManager.ts  Matchmaking, routing messages to games
│       ├── Game.ts         A single game: move validation, results
│       └── messages.ts     Message types and zod schemas
└── frontend/           React app
    └── src/
        ├── screens/        Landing and Game pages
        ├── components/     Boards, panel, nav, button
        ├── hooks/          useSocket (connection), useReplay (landing animation)
        └── data/           The 1956 game's moves
```

## Roadmap

- Rating system that goes up and down with results
- Move list and game history
- Promotion piece picker (currently auto-promotes to a queen)
- Game clocks
- Rematch without reloading

## Acknowledgements

- The dot-field background and pill navigation are adapted from [React Bits](https://reactbits.dev).
- Chess logic by [chess.js](https://github.com/jhlywa/chess.js).
