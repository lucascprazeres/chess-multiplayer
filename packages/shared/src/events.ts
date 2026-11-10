/**
 * Socket.IO contract shared by apps/web and apps/server.
 * Both sides type their socket with these interfaces, so a renamed
 * event or changed payload is a compile error on both ends.
 */

export const SERVER_PORT = 3001;

export type Color = "w" | "b";
export type PromotionPiece = "q" | "r" | "b" | "n";
export type GameStatus = "waiting" | "active" | "finished";

export interface GameState {
  gameId: string;
  fen: string;
  turn: Color;
  status: GameStatus;
}

export interface MovePayload {
  gameId: string;
  from: string;
  to: string;
  promotion?: PromotionPiece;
}

export interface ServerToClientEvents {
  "game:state": (state: GameState) => void;
  "game:error": (message: string) => void;
}

export interface ClientToServerEvents {
  "game:join": (gameId: string) => void;
  "game:move": (move: MovePayload) => void;
}
