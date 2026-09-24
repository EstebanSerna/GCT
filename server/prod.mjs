// Production server: serves the built SPA (dist/), the AI chat API, and
// the employee auth/attendance API on a single Node process — this is
// what Railway runs.
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
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
  requireLiderEquipoOAbove,
  requireSuperAdmin,
} from "./auth.mjs";
import { createMarkHandler, getTodayHandler, getAllHandler } from "./attendance.mjs";
import { listHandler, listEquipoHandler, createHandler, updateHandler, deleteHandler, impersonarHandler } from "./employees.mjs";
import { listHandler as listClientesHandler, actualizarObligacionHandler, actualizarClienteHandler } from "./clientes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

const app = express();

// Railway está detrás de un proxy — sin esto, el rate limiter ve la IP
// del proxy en vez de la del cliente real y limita a todo el tráfico junto.
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://api.gct.com.co"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  })
);

app.use(corsMiddleware);

// Frena intentos de fuerza bruta contra login/registro: generoso para no
// estorbar a un usuario real que se equivoca de contraseña, suficiente
// para descartar un ataque automatizado.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Espera unos minutos y vuelve a intentar." },
});
const registroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados registros desde esta conexión. Intenta más tarde." },
});

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

api.post("/auth/registro", registroLimiter, registroHandler);
api.post("/auth/login", loginLimiter, loginHandler);
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
api.post("/employees/:id/impersonate", requireSuperAdmin, impersonarHandler);

// Vista liviana del equipo, para gerencia y líderes de equipo (reportes,
// sin datos sensibles de más).
api.get("/employees/equipo", requireLiderEquipoOAbove, listEquipoHandler);

// Clientes: cada quien ve los suyos (o de su equipo, o todos, según el rol)
// — el filtro vive dentro del handler porque depende de datos (el
// responsable_id de cada cliente), no solo del rol en sí.
api.get("/clientes", requireAuth, listClientesHandler);
api.patch("/clientes/:id", requireAuth, actualizarClienteHandler);
api.patch("/obligaciones/:id", requireAuth, actualizarObligacionHandler);

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
