import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@chess/shared";

// Same origin: Vite proxies /socket.io to the Node server in dev.
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
