import { useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { socket } from "./socket.ts";
import { useGameStore } from "./store.ts";

// Single hard-coded room until there is a lobby.
const GAME_ID = "dev";

export function App() {
  const { connected, game, error, setConnected, setGame, setError } = useGameStore();

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      socket.emit("game:join", GAME_ID);
    };
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("game:state", setGame);
    socket.on("game:error", setError);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("game:state", setGame);
      socket.off("game:error", setError);
    };
  }, [setConnected, setGame, setError]);

  return (
    <main style={{ maxWidth: 560, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Chess</h1>
      <p>
        {connected ? "Connected" : "Connecting…"}
        {game && ` · ${game.turn === "w" ? "White" : "Black"} to move`}
      </p>
      <Chessboard
        options={{
          position: game?.fen ?? "start",
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!game || !targetSquare) return false;
            // Server validates and broadcasts the new position.
            socket.emit("game:move", {
              gameId: game.gameId,
              from: sourceSquare,
              to: targetSquare,
              promotion: "q",
            });
            return true;
          },
        }}
      />
      {error && <p style={{ color: "#f88" }}>{error}</p>}
    </main>
  );
}
