# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Multiplayer chess: a pnpm + Turborepo monorepo with a React frontend (`apps/web`), a Node Socket.IO server (`apps/server`) and a shared contract package (`packages/shared`). Decisions and their reasons are in `CONTEXT.md`. Update it when an architectural decision changes.

## Commands

Node 24 is installed via nvm and is **not on the PATH in non-interactive shells**. Prefix commands with `export PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH"` (or check `~/.nvm/versions/node/` for another v24). pnpm 12 is pinned in `packageManager`. Run it as `corepack pnpm ...`, because a global pnpm 9 also exists.

```sh
corepack pnpm install
corepack pnpm dev          # web :5173 + server :3001 (tsx watch), via turbo
corepack pnpm typecheck    # tsc --noEmit in every package
corepack pnpm build        # only apps/web has a build (vite)
corepack pnpm --filter @chess/web typecheck   # a single package
```

There is no test runner or linter yet. Verify changes with `typecheck`, and for real-time behavior use the `verify-multiplayer` skill (a two-client smoke test).

## Architecture

- **The server is authoritative.** The client emits `game:move` intents. The server validates them with `chess.js` and broadcasts `game:state` (including the FEN) to the Socket.IO room named after the `gameId`. The client renders whatever state it receives.
- **`packages/shared/src/events.ts` is the wire contract.** Both sides type their sockets with `ClientToServerEvents` / `ServerToClientEvents`, and `SERVER_PORT` lives there too. To add or change an event, use the `add-socket-event` skill.
- **`@chess/shared` exports raw `.ts` source** (`"exports": "./src/index.ts"`) with no build step. Vite and `tsx` consume it directly. Imports use explicit `.ts` extensions and `import type` (`verbatimModuleSyntax`). This is also why the server runs via `tsx` rather than compiled `tsc` output.
- **Dev networking:** the web client calls `io()` same-origin, and `apps/web/vite.config.ts` proxies `/socket.io` to the server, so the server has no CORS config.

Detailed rules for each app load automatically from `.claude/rules/backend.md` (`apps/server/**`) and `.claude/rules/frontend.md` (`apps/web/**`).

## Claude tooling (`.claude/`)

- `skills/add-socket-event`: the steps for changing the socket contract end-to-end.
- `skills/verify-multiplayer`: starts the dev servers and runs `smoke.mjs` (two clients: join, broadcast, illegal-move rejection).
- `agents/chess-reviewer`: reviews a diff against this project's rules. Use it before committing.
- `settings.json`: shared permissions. Personal overrides go in `.claude/settings.local.json` (gitignored).

## Gotchas

- pnpm blocks dependency install scripts. Allowed ones are listed under `allowBuilds` in `pnpm-workspace.yaml` (currently only `esbuild`). Add entries there if install fails with `ERR_PNPM_IGNORED_BUILDS`.
- MVP limitations, not bugs: games are kept in memory (lost on restart), there's a single hard-coded room `"dev"` in the client, no seat/color enforcement, and promotion always picks a queen.
- When stopping dev servers, kill only the PIDs you started (`lsof -ti :5173 -ti :3001`, `pgrep -f "turbo dev"`), never with broad `pkill`.
