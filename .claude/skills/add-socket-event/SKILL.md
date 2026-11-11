---
name: add-socket-event
description: Add or change a Socket.IO event between apps/web and apps/server. Use when adding a new real-time message, changing an event payload, or renaming an event.
---

# Add a socket event

The contract lives in `packages/shared/src/events.ts`. Always change it first; the type errors then show every place on both sides that must be updated.

1. **Contract:** in `packages/shared/src/events.ts`, add any payload types and the event to `ClientToServerEvents` (client → server) or `ServerToClientEvents` (server → client). Event names use the `domain:action` form (`game:move`, `game:state`).
2. **Server** (`apps/server/src/index.ts`): handle client events inside `io.on("connection")`. Validate every payload as untrusted input. Reply to the sender with `socket.emit`; broadcast to a game with `io.to(gameId).emit`.
3. **Client:** emit through the singleton in `apps/web/src/socket.ts`. For server → client events, add a listener in a `useEffect` with matching `socket.off` cleanup, and write the data into the Zustand store (`apps/web/src/store.ts`) instead of component state.
4. **Verify:** run `corepack pnpm typecheck` (both apps must pass), then use the `verify-multiplayer` skill to exercise the event end-to-end.
5. If the change affects the protocol design (new game flow, new kind of state), record it in `CONTEXT.md`.
