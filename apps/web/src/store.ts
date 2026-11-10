import { create } from "zustand";
import type { GameState } from "@chess/shared";

interface GameStore {
  connected: boolean;
  game: GameState | null;
  error: string | null;
  setConnected: (connected: boolean) => void;
  setGame: (game: GameState) => void;
  setError: (error: string | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  connected: false,
  game: null,
  error: null,
  setConnected: (connected) => set({ connected }),
  setGame: (game) => set({ game, error: null }),
  setError: (error) => set({ error }),
}));
