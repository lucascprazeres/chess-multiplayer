# Chess

A real-time multiplayer chess game. The frontend is React and the backend is a Node server; both are TypeScript and live in one monorepo. Players' moves are sent to the server over Socket.IO, checked against the rules with `chess.js`, and the new position is sent to everyone in the game.

- `apps/web`: React + Vite frontend with `react-chessboard`
- `apps/server`: Node + Socket.IO game server
- `packages/shared`: message types shared by the frontend and the server

See [CONTEXT.md](CONTEXT.md) for the tech decisions and the reasons behind them.

## Setup

**Requirements:** Node 24 (see `.nvmrc`). pnpm is installed through corepack, which comes with Node.

```sh
nvm use                # or install Node 24 another way
corepack enable pnpm   # uses the pnpm version pinned in package.json
pnpm install
```

## Running

```sh
pnpm dev
```

This starts both apps:

- Web app: http://localhost:5173
- Game server: http://localhost:3001 (in dev, the web app forwards its Socket.IO traffic here)

Open the web app in two browser tabs to play against yourself.

Other commands:

```sh
pnpm typecheck   # type-check every package
pnpm build       # production build of the web app
```
