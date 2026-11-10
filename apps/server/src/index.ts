import { createServer } from "node:http";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import {
  SERVER_PORT,
  type ClientToServerEvents,
  type GameState,
  type ServerToClientEvents,
} from "@chess/shared";

// In-memory games for the MVP. Lost on restart; swap for a store later.
const games = new Map<string, Chess>();

function toState(gameId: string, chess: Chess): GameState {
  return {
    gameId,
    fen: chess.fen(),
    turn: chess.turn(),
    status: chess.isGameOver() ? "finished" : "active",
  };
}

const httpServer = createServer();
// The Vite dev server proxies /socket.io here, so no CORS config is needed.
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);

io.on("connection", (socket) => {
  socket.on("game:join", (gameId) => {
    let chess = games.get(gameId);
    if (!chess) {
      chess = new Chess();
      games.set(gameId, chess);
    }
    void socket.join(gameId);
    socket.emit("game:state", toState(gameId, chess));
  });

  socket.on("game:move", ({ gameId, from, to, promotion }) => {
    const chess = games.get(gameId);
    if (!chess) {
      socket.emit("game:error", `Game ${gameId} not found`);
      return;
    }
    try {
      // chess.js throws on illegal moves; the server is the source of truth.
      chess.move({ from, to, promotion });
    } catch {
      socket.emit("game:error", `Illegal move ${from}-${to}`);
      socket.emit("game:state", toState(gameId, chess));
      return;
    }
    io.to(gameId).emit("game:state", toState(gameId, chess));
  });
});

httpServer.listen(SERVER_PORT, () => {
  console.log(`Server listening on http://localhost:${SERVER_PORT}`);
});
