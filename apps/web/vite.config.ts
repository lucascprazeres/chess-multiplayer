import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { SERVER_PORT } from "@chess/shared";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/socket.io": { target: `http://localhost:${SERVER_PORT}`, ws: true },
    },
  },
});
