---
paths:
  - "apps/web/**"
---

# Frontend rules (apps/web)

- The client renders server state; it doesn't decide it. Moves are sent as `game:move` intents, and the board position always comes from the latest `game:state` in the Zustand store. Don't apply moves to a local `Chess` instance as the source of truth (using `chess.js` locally for UI hints like legal-move highlights is fine).
- `react-chessboard` is **v5**: everything goes in one `options` prop (`<Chessboard options={{ position, onPieceDrop, ... }} />`), and `onPieceDrop` receives `{ piece, sourceSquare, targetSquare }`, where `targetSquare` can be `null`. Most examples online use the old v4 props API; don't copy them.
- Keep the board library isolated. New board features should go through a `<Board>` wrapper component (create it when first needed) rather than spreading `react-chessboard` usage across the app, so it can be swapped for a custom board later.
- Use the singleton socket from `src/socket.ts`; don't call `io()` elsewhere. Register listeners in `useEffect` and always remove them in the cleanup (StrictMode mounts effects twice in dev).
- Socket events update the Zustand store (`src/store.ts`). Components read from the store, not from socket callbacks directly.
- The client connects same-origin (`io()`). Vite proxies `/socket.io` to the server in dev; don't hard-code server URLs.
- Imports use explicit `.ts`/`.tsx` extensions and `import type` for type-only imports.
