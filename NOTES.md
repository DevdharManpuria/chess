# DevChess — Project Notes

Working notes for continuing development. Paste this into a new AI chat to give it full context.

## Links

- **Live site:** https://devchess-f8qw.onrender.com
- **Backend:** https://devchess-server.onrender.com (shows "DevChess server is running")
- **Repo:** https://github.com/DevdharManpuria/chess

## Running locally

```bash
npm run setup   # first time: installs root + backend + frontend
npm run dev     # runs both: [server] on :8080, [web] on :5173
npm run build   # builds both, a good check before pushing
```

Always run git commands from the repo root (`C:\Coding\chess`). `git add .` inside a subfolder only stages that subfolder.

## Architecture

Server-authoritative real-time chess. The backend validates every move with chess.js and is the single source of truth. The frontend also runs chess.js, but only for legal-move hints and local display.

### Message protocol (JSON over WebSocket)

| Type | Direction | Payload |
|---|---|---|
| `init_game` | client → server | none (joins the queue) |
| `init_game` | server → client | `{ color: "white" \| "black" }` |
| `move` | both | `{ from, to, promotion? }`, e.g. `{ from: "e2", to: "e4" }` |
| `game_over` | server → client | `{ winner: "white" \| "black" \| null, reason }` |

Reasons: `checkmate`, `stalemate`, `repetition`, `insufficient_material`, `fifty_moves`, `opponent_left`. The client adds `connection_lost` locally.

### Backend (`backend/src/`)

- **index.ts**: HTTP server (plain-text health response) with the WebSocket server attached. Reads `PORT` (fallback 8080). `maxPayload: 1024`. Heartbeat every 30s: ping all clients, terminate any that didn't pong since the last round (tracked in a `WeakMap`). Terminating fires `close`, which runs `removeUser`.
- **GameManager.ts**: one `pendingUser` queue slot plus a `games` array. `findGame(socket)` helper. `JSON.parse` in try/catch, then zod `safeParse`. `INIT_GAME` is ignored if the player is already queued or in a game. `removeUser`: clears the queue slot, or forfeits the game (opponent gets `opponent_left`) and removes it. Finished games are removed after each move.
- **Game.ts**: `player1` = white, `player2` = black. Turn checked with `board.turn()`, not a counter. Builds the chess.js move without `promotion` when it's absent (needed for `exactOptionalPropertyTypes`). Relays the move to the opponent *before* checking game over, so the final move is always seen. `getResult()` maps chess.js state to a winner and reason.
- **messages.ts**: zod schemas. Squares validated by regex `^[a-h][1-8]$`; `promotion` optional `q|r|b|n`. Exports the `Move` type (`z.infer`) and the `GameOverReason` union.

### Frontend (`frontend/src/`)

- **App.tsx**: data router (`createBrowserRouter`, required for view transitions). Routes: `/` → Landing, `/game` → Game.
- **screens/Landing.tsx**: hero with the "Your move." headline (Bodoni), Play now button (navigates with `{ viewTransition: true }`), and HeroBoard replaying the 1956 game with a caption.
- **screens/Game.tsx**: owns socket, chess instance, color, started/waiting/result state. `onmessage` handles `INIT_GAME`, `MOVE`, and `GAME_OVER`. An effect resets the UI when the socket drops (waiting → idle; mid-game → `connection_lost`). Derives `status`, `isMyTurn`, and `moveNumber` on each render and passes them to GamePanel. The layout always renders, even before the socket connects, so the board exists for the morph transition.
- **components/ChessBoard.tsx**: the game board. Percentage sizing (`w-full max-w-[512px]`; squares `w-[12.5%] aspect-square relative`). The click handler uses guard clauses: disabled/no socket → not my turn → select/switch/deselect own piece → cancel if not a legal destination → auto-queen promotion → apply locally first, then send. Highlights: selected (`yellow-300/70`), last move (`yellow-300/40`, from `chess.history({verbose:true}).at(-1)`), check (`CHECK_GLOW` radial gradient set via `style` on the *outer* square). `[view-transition-name:board]`.
- **components/HeroBoard.tsx**: landing board. Two layers: a 64-square grid, plus pieces as absolutely positioned images moved with `translate(col*100%, row*100%)`. `transition-[transform,opacity] duration-500`; captured pieces fade (`opacity-0 z-0`). Last-move highlight. Same `view-transition-name: board`, which is what makes it morph into the game board.
- **components/GamePanel.tsx**: glass card. One `status` prop: `connecting | idle | searching | playing | over`. `SearchTimer` (counts up, resets because it remounts each search). Turn headlines "Your move." / "Their move." are both always rendered in the same grid cell (`[grid-area:1/1]`) and crossfaded with opacity/translate transitions. `resultText()` produces the title and subtitle.
- **components/Button.tsx**: shared button. `bg-emerald-400 text-emerald-950`, inset top highlight plus emerald glow shadow, stronger glow on hover, `active:scale-[0.98]`, `focus-visible` ring.
- **components/SiteNav.tsx**: wraps PillNav. `NAV_ITEMS` is defined *outside* the component (a new array each render made PillNav replay its intro animation). `activeHref = useLocation().pathname`.
- **components/PillNav.tsx, DotField.tsx**: from React Bits. PillNav's `<Link>`s have `viewTransition`.
- **hooks/useSocket.ts**: `VITE_WS_URL || "ws://localhost:8080"`. Reconnects with exponential backoff (1s, 2s, 4s, 8s, then 10s cap). `stopped` flag prevents reconnecting after unmount.
- **hooks/useReplay.ts**: plays `FAMOUS_GAME` with chess.js. Pieces get permanent ids (their starting square). `applyMove` handles captures, en passant (flag `e`), castling (flags `k`/`q`), and promotion. Timing: 1000ms start, 1100ms per move, 4000ms end pause, then restart. Pauses on `visibilitychange`. Reduced motion: shows a still position after `keyMoment` (34 half-moves, just after 17...Be6).
- **data/famousGame.ts**: Byrne vs. Fischer, New York 1956, as SAN moves.
- **index.css**: body background `#0a0a0a`; view-transition timings (board group 550ms `cubic-bezier(0.22,1,0.36,1)`, root crossfade 350ms); all view transitions disabled under reduced motion.

## Design system

- **Background:** `#0a0a0a`, with the DotField (emerald `#10b981` → slate `#1e293b`)
- **Accent:** emerald. `emerald-400` for buttons and spinners, `emerald-500` in the dot field and logo. One green family only; avoid Tailwind's plain `green`.
- **Board:** light `#ebecd0`, dark `#739552`. h1 is light ("light on the right").
- **Type:** Bodoni Moda (`font-display`) for headlines only; Jost (default `sans`) for everything else. A Didone with a geometric sans is the classic editorial pairing. Both load from Google Fonts in `index.html`.
- **Text colors:** `white` headlines, `slate-200`/`300` emphasis, `slate-400` body, `slate-500` secondary.
- **Panel:** `bg-white/[0.04] backdrop-blur-xl border-white/10`, inset top highlight, large soft shadow.
- **Motion rules:** one memorable motion per page (the hero replay; the board morph). Motion responds to user actions. Always provide `motion-safe:` / `motion-reduce:` handling.

## Deployment (Render)

**Backend: Web Service `devchess-server`**
- Region Singapore, branch `main`, root directory `backend`
- Build: `npm install && npm run build`; start: `npm start`; instance type Free
- No env vars (Render sets `PORT`, usually 10000)
- Free tier sleeps after ~15 min idle; the first visitor waits up to ~1 min (the frontend shows "Connecting to the server" and retries)

**Frontend: Static Site `devchess`** (URL got a `-f8qw` suffix because `devchess` was taken)
- Branch `main`, root directory `frontend`, build `npm install && npm run build`, publish directory `dist`
- Env var: `VITE_WS_URL = wss://devchess-server.onrender.com`. It's baked in at build time, so changing it requires a redeploy.
- Rewrite rule: `/*` → `/index.html` (Rewrite). Without it, refreshing `/game` gives a 404.

Every push to `main` redeploys both services. Server `console.log` output appears in the backend's Logs tab.

## Known limitations

- Games live in server memory: a restart or redeploy ends every game in progress. Only one server instance can run (no shared state).
- A reconnect is treated as a new player; the old game is lost (shown as "Connection lost").
- Promotion always picks a queen.
- "Play again" reloads the page.
- Matchmaking is first come, first served, with one queue slot.
- View transitions work in Chrome, Edge, and Safari 18+; other browsers just switch pages instantly.

## Tech debt / cleanup

- Message constants (`init_game`, etc.) are duplicated in `frontend/src/screens/Game.tsx` and `backend/src/messages.ts`; they must be kept in sync by hand.
- `GameResult.reason` is typed as `string` on the frontend; it could be a union like the backend's.
- Backend: the `users` array in GameManager is never read; `startTime` in Game is unused (keep it if clocks get added).
- Stale comments: "see note below" (Game.ts), "a placeholder until step 3" (Landing.tsx), "RESTORED"/"NEW" (ChessBoard.tsx), "Stop the game here" (GameManager.ts).
- `App.css` is empty but still imported.
- `npm audit` warnings are in dev tooling only; try `npm audit fix` (never `--force`).
- `npm run lint` hasn't been run recently.
- README: add the source of the piece SVGs to Acknowledgements.
- Decide on the frontend address: keep `-f8qw`, re-create the site under an available name, or add a custom domain (Render → Settings → Custom Domains; free HTTPS).

## Roadmap ideas

1. Rating system (needs a database and some notion of player identity)
2. Move list / game history
3. Promotion piece picker
4. Game clocks
5. Rematch without reloading
6. Spectating ("Watch") and puzzles, which the old nav hinted at

## Concepts learned while building this

- **Reference equality:** React compares dependencies with `===`, so inline arrays and objects are "new" every render (the SiteNav bug).
- **Lazy initialization:** `useState(() => new Chess())` builds the value only once.
- **Derived state:** calculate values like `status` from existing state instead of storing them separately.
- **Guard clauses:** flat early returns instead of nested ifs.
- **Keys:** a stable key keeps the same element, so a CSS transition animates the change; a changing key remounts it, so a CSS animation replays.
- **Effects:** every timer or listener added in an effect must be removed in its cleanup.
- **Functional state updates:** `setX(prev => ...)` inside timers and callbacks.
- **Tailwind:** mobile-first prefixes (`lg:`), arbitrary values (`w-[12.5%]`, `[view-transition-name:board]`), `motion-safe:`.
- **Positioning:** `absolute` positions against the nearest positioned ancestor, so the parent needs `relative`.
- **Server hardening:** validate everything, never trust the client, handle disconnects, heartbeats for half-open connections.
- **Deployment:** web service vs. static site, build-time env vars, SPA rewrites, `ws://` vs. `wss://`.

## How I like to work with an AI assistant

- One small step at a time; wait for me to confirm before the next.
- Targeted edits: the file path on top, what to find, what to replace it with. Full files only for new files.
- Explain *why* each change works, not just what to type.
- When fixing a bug, show how to reproduce it first, then fix it.
- Give test steps after every change, then a commit command (run from the repo root).