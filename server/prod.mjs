// Production server: serves the built SPA (dist/) and the chat API on a
// single Node process — this is what Railway (or any Node host) runs.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createChatHandler } from "./chatHandler.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

const app = express();

// Registered for POST and OPTIONS — the handler itself answers CORS
// preflight requests (see applyCors in chatHandler.mjs).
app.all("/api/chat", createChatHandler({ logger: console }));

app.use(express.static(distDir, { index: false }));

// SPA fallback: any other route (e.g. /portal, /admin) is handled client-side
// by react-router, so always serve index.html for non-API, non-file requests.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[gct] servidor de producción escuchando en el puerto ${port}`);
});
