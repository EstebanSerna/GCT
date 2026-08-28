// Production server: serves the built SPA (dist/), the AI chat API, and
// the employee auth/attendance API on a single Node process — this is
// what Railway runs.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createChatHandler } from "./chatHandler.mjs";
import { corsMiddleware } from "./cors.mjs";
import { migrate } from "./db.mjs";
import { loginHandler, logoutHandler, meHandler, requireAuth, requireAdmin } from "./auth.mjs";
import { createMarkHandler, getTodayHandler, getAllHandler } from "./attendance.mjs";
import { listHandler, createHandler, updateHandler } from "./employees.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

const app = express();

app.use(corsMiddleware);

// Registered for POST and OPTIONS — the handler itself answers CORS
// preflight requests too (kept self-contained: it also runs, unmodified,
// as a plain Vite dev-server middleware — see devPlugin.mjs).
app.all("/api/chat", createChatHandler({ logger: console }));

// Employee auth, attendance (clock in/out with GPS) and employee
// management. These need a real database, so — unlike /api/chat — they
// only run in production, not in the local Vite dev server.
const api = express.Router();
api.use(express.json());

api.post("/auth/login", loginHandler);
api.post("/auth/logout", requireAuth, logoutHandler);
api.get("/auth/me", requireAuth, meHandler);

api.post("/attendance/entrada", requireAuth, createMarkHandler("entrada"));
api.post("/attendance/salida", requireAuth, createMarkHandler("salida"));
api.get("/attendance/today", requireAuth, getTodayHandler);
api.get("/attendance", requireAdmin, getAllHandler);

api.get("/employees", requireAdmin, listHandler);
api.post("/employees", requireAdmin, createHandler);
api.patch("/employees/:id", requireAdmin, updateHandler);

app.use("/api", api);

app.use(express.static(distDir, { index: false }));

// SPA fallback: any other route (e.g. /portal, /admin) is handled client-side
// by react-router, so always serve index.html for non-API, non-file requests.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

const port = process.env.PORT || 3000;

try {
  await migrate({ logger: console });
  console.log("[gct] base de datos lista.");
} catch (err) {
  console.error("[gct] no se pudo preparar la base de datos:", err);
}

app.listen(port, () => {
  console.log(`[gct] servidor de producción escuchando en el puerto ${port}`);
});
