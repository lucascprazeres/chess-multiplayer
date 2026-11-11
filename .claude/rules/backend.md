---
paths:
  - "apps/server/**"
---

# Backend rules (apps/server)

- The server is the single source of truth for game state. Every move is validated with `chess.js` before it's applied. Never trust a FEN, a turn or a result sent by a client.
- `chess.move()` **throws** on illegal moves. Keep it in `try/catch`, and on failure emit `game:error` to the sender only, then re-send the current `game:state` so the client's board rolls back.
- Broadcast state changes to the room with `io.to(gameId).emit(...)`. Use `socket.emit` only for replies meant for the sender alone (errors, initial join state).
- Type the server as `new Server<ClientToServerEvents, ServerToClientEvents>`. New events are added to `packages/shared/src/events.ts` first (see the `add-socket-event` skill), never as untyped string events.
- Imports use explicit `.ts` extensions and `import type` for type-only imports (`verbatimModuleSyntax`). The server runs via `tsx`, not compiled `tsc` output, because `@chess/shared` is raw TS.
- Keep the event loop free: no CPU-heavy work (engine search, bulk analysis) inside socket handlers. That would need a worker thread or a separate service.
- Game storage is currently an in-memory `Map` (lost on restart, and on every `tsx watch` reload). Keep storage access behind small functions so it can move to a database later.
