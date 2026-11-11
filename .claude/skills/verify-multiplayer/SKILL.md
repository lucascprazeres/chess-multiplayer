---
name: verify-multiplayer
description: Smoke-test the real-time game end-to-end by running the dev servers and connecting two socket clients. Use after changing socket events, server game logic, or the Vite proxy.
---

# Verify multiplayer end-to-end

Node is not on the PATH in non-interactive shells; prefix commands with `export PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH"` (or another v24 under `~/.nvm/versions/node/`).

1. Check whether dev servers are already running: `lsof -ti :5173 -ti :3001`. If they are, reuse them.
2. Otherwise, start `corepack pnpm dev` from the repo root in the background, and wait until http://localhost:5173 responds and the log shows `Server listening`.
3. Run the smoke script from the repo root:
   ```sh
   node .claude/skills/verify-multiplayer/smoke.mjs
   ```
   It connects two clients through the Vite proxy, joins both to a fresh game, plays a legal move and an illegal one, and exits non-zero if either client doesn't receive the broadcast or the illegal move isn't rejected. Extend it when you add events.
4. Stop only the processes you started, by the PIDs from `lsof -ti :5173 -ti :3001` and `pgrep -f "turbo dev"`. Never use broad `pkill`.
