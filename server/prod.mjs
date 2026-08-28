// Production server: serves the built SPA (dist/), the AI chat API, and
// the employee auth/attendance API on a single Node process — this is
// what Railway runs.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createChatHandler } from "./chatHandler.mjs";
import { corsMiddleware } from "./cors.mjs";
import { migrate } from "./db.mjs";
import {
  registroHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  requireAuth,
  requireGerenteOAbove,
  requireSuperAdmin,
} from "./auth.mjs";
import { createMarkHandler, getTodayHandler, getAllHandler } from "./attendance.mjs";
import { listHandler, listEquipoHandler, createHandler, updateHandler, deleteHandler } from "./employees.mjs";

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
// Límite generoso (1mb) porque el registro incluye una foto de perfil en
// base64 dentro del JSON.
api.use(express.json({ limit: "1mb" }));

api.post("/auth/registro", registroHandler);
api.post("/auth/login", loginHandler);
api.post("/auth/logout", requireAuth, logoutHandler);
api.get("/auth/me", requireAuth, meHandler);

api.post("/attendance/entrada", requireAuth, createMarkHandler("entrada"));
api.post("/attendance/salida", requireAuth, createMarkHandler("salida"));
api.get("/attendance/today", requireAuth, getTodayHandler);
api.get("/attendance", requireGerenteOAbove, getAllHandler);

// Gestión de cuentas: exclusiva del super admin, tal como se definió.
api.get("/employees", requireSuperAdmin, listHandler);
api.post("/employees", requireSuperAdmin, createHandler);
api.patch("/employees/:id", requireSuperAdmin, updateHandler);
api.delete("/employees/:id", requireSuperAdmin, deleteHandler);

// Vista liviana del equipo activo, para la gerente (reportes, sin datos
// sensibles de más).
api.get("/employees/equipo", requireGerenteOAbove, listEquipoHandler);

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
