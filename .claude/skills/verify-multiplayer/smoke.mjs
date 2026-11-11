// Two-client smoke test for the Socket.IO game flow. Run from the repo root.
import { createRequire } from "node:module";
import { join } from "node:path";

// socket.io-client is a dependency of apps/web, so resolve it from there.
const require = createRequire(join(process.cwd(), "apps/web/package.json"));
const { io } = require("socket.io-client");

const URL = process.env.SMOKE_URL ?? "http://localhost:5173";
const gameId = `smoke-${Date.now()}`;
const a = io(URL);
const b = io(URL);
const states = { a: [], b: [] };
const errors = [];

a.on("game:state", (s) => states.a.push(s));
b.on("game:state", (s) => states.b.push(s));
a.on("game:error", (e) => errors.push(e));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (msg) => {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
};

a.emit("game:join", gameId);
b.emit("game:join", gameId);
await wait(500);
if (!states.a.length || !states.b.length) fail("join did not return game:state to both clients");

a.emit("game:move", { gameId, from: "e2", to: "e4" });
await wait(300);
if (states.b.at(-1)?.turn !== "b") fail("legal move e2-e4 was not broadcast to the other client");

a.emit("game:move", { gameId, from: "e2", to: "e5" });
await wait(300);
if (!errors.length) fail("illegal move e2-e5 was not rejected");

console.log("PASS: join, broadcast and illegal-move rejection all work");
process.exit(0);
