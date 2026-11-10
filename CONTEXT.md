# Project Context: Multiplayer Chess

A real-time multiplayer chess game. This file records the decisions made so far and why.

## Decisions

### Backend: Node.js + TypeScript (over Go)
- **Why:** chess is turn-based and light on traffic, so Go's performance and concurrency benefits don't matter at our scale. Using TypeScript on both ends lets us **share types and chess logic** between client and server (move validation, game state, socket event contracts).
- **Trade-offs accepted:** higher memory use per connection than Go; CPU-heavy work (engine analysis, cheat detection) would block the event loop and would need worker threads or a separate service later.
- **Revisit if:** we need very large scale or CPU-heavy server-side features.

### Real-time transport: Socket.IO
- Handles rooms, reconnection and fallbacks out of the box.
- Events are typed with the `ClientToServerEvents` / `ServerToClientEvents` interfaces in `@chess/shared`, so a contract change is a compile error on both sides.

### Server is the source of truth
- Clients send move *intents* (`game:move`). The server validates them with `chess.js` and broadcasts the resulting `game:state` to the room. Clients render whatever state the server sends.

### Frontend: React + Vite + TypeScript
- Vite for a fast dev loop. We don't need SSR/SEO, and Next.js doesn't fit long-lived WebSockets.
- **State:** Zustand (lightweight store fed by socket events).

### Board: `react-chessboard` (for now)
- Gives us drag-and-drop, move animation, custom square styles, custom pieces and arrows immediately.
- Uses the **v5 API**: all props go in a single `options` object. Many tutorials online show the old v4 style.
- **Future option:** build a custom board (CSS grid + Framer Motion + pointer events/`dnd-kit`) for full visual control. To keep that swap cheap, wrap the board in our own `<Board>` component as the UI grows, so the rest of the app doesn't depend on react-chessboard directly. `chessground` (Lichess's board) is the other alternative.

### Chess rules: `chess.js`
- Used on the server for validation. It can also be used on the client (e.g. legal-move highlights) via `@chess/shared`.

### Monorepo: pnpm workspaces + Turborepo
- **pnpm** links workspace packages (`workspace:*`) and gives strict, fast installs.
- **Turborepo** runs tasks across packages in dependency order, with caching. One `pnpm dev` starts everything.
- Nx was considered and rejected for the MVP as too heavy; it's available later if needed.
- **`@chess/shared` exports TypeScript source directly** (no build step). Vite and `tsx` both consume `.ts` from the workspace package, which avoids watch-mode and build-order headaches.

## Structure

```
chess/
├─ apps/
│  ├─ web/          # React + Vite + react-chessboard + Zustand (port 5173)
│  └─ server/       # Node + Socket.IO, run with tsx (port 3001)
├─ packages/
│  └─ shared/       # Socket event contract, shared types/constants
├─ tsconfig.base.json
├─ pnpm-workspace.yaml
└─ turbo.json
```

## Tooling and versions
- Node 24 (`.nvmrc`), pnpm 12 (pinned via `packageManager`, run through corepack), TypeScript 7, Vite 8, React 19, react-chessboard 5, Socket.IO 4.
- `tsc` is used only for type-checking (`noEmit`). Vite bundles the web app; the server runs TS directly with `tsx`.
- pnpm blocks dependency install scripts by default. `esbuild` (needed by `tsx`) is explicitly allowed under `allowBuilds` in `pnpm-workspace.yaml`.
- In dev, Vite proxies `/socket.io` to the server, so the client connects same-origin and the server needs no CORS config.

## Commands
```sh
pnpm install
pnpm dev         # web on http://localhost:5173, server on :3001
pnpm typecheck
pnpm build
```

## Current state (MVP scaffold)
- One hard-coded room (`"dev"`). Anyone who opens the page plays both colors in the same game.
- Games are stored **in memory** and lost on server restart.
- Promotion always picks a queen.

## Next steps / open questions
- Lobby and game creation/joining by ID or link.
- Seat assignment (white/black/spectator) and enforcing that players can only move their own color.
- Clocks / time control.
- Reconnection handling (restore seat after disconnect).
- Persistence (DB choice still open) and accounts/auth.
- Promotion picker UI.
- Deployment target (still open). The server currently runs via `tsx`; we may add a bundling step (e.g. tsup) for production.
