# Chess

Small real-time multiplayer chess with a TypeScript Node backend (WebSocket) and a React + Vite frontend.

## Structure

- Backend: `backend1/` — server entry and game logic
- Frontend: `frontend/` — Vite + React client

## Quick start

Run backend (from this folder):

```powershell
cd ./backend1
npm install
npm run dev
```

Run frontend (relative path):

```powershell
cd ../frontend
npm install
npm run dev
```

> If the README is moved to the repo root, use `cd frontend` instead of `cd ../frontend`.

Open the Vite URL shown in the terminal (commonly `http://localhost:5173`).

## For contributors

- Backend is authoritative: validate moves and maintain game state on the server.
- Keep message types in `backend1/messages.ts` and the client `frontend/src/hooks/useSocket.ts` in sync.
- When changing rules, add/update tests for `Game.ts` / `GameManager.ts`.

## Contributing

1. Branch: `git checkout -b feat/your-change`
2. Commit changes with clear messages.
3. Open a PR with testing steps and any protocol notes.
