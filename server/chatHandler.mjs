// Shared chat-endpoint logic, used by both the local dev server (Vite
// middleware, see devPlugin.mjs) and the production server (prod.mjs).
// Plain JS on purpose: it runs as-is on any Node host with no build step.
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Eres el asistente virtual de "Gerencia Contable & Tributaria", una firma de contadores en Colombia. Ayudas a visitantes del sitio web con preguntas generales de contabilidad, impuestos y normativa tributaria colombiana (DIAN, IVA, régimen simple de tributación, retención en la fuente, declaración de renta, nómina, seguridad social, constitución de empresas, etc.).

Reglas:
- Responde siempre en español, de forma clara, cercana y profesional, como lo haría un asesor contable con buena actitud de servicio.
- Da información general y educativa. Esto NO es asesoría personalizada ni un concepto tributario formal.
- Si la pregunta depende del caso particular de la persona (su NIT, régimen, tamaño de empresa) o requiere una cifra, tasa o fecha límite exacta, acláralo y recomienda agendar una consulta gratuita con el equipo a través del formulario de contacto del sitio. No inventes cifras, tasas ni fechas si no estás seguro.
- Sé breve: entre 2 y 5 frases por respuesta, o una lista corta si ayuda a la claridad. No escribas ensayos largos.
- Si preguntan algo fuera de contabilidad, impuestos o temas empresariales relacionados, redirige el tema amablemente.
- Nunca sugieras evadir impuestos ni prácticas ilegales.
- Este chat NO renderiza Markdown: nunca uses **negritas**, #, numerales ni asteriscos. Para listas, usa un guion simple "-" al inicio de cada línea con un salto de línea real entre puntos, y texto plano para todo lo demás.`;

const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 800;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;

const requestLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf-8");
  return raw ? JSON.parse(raw) : {};
}

function isValidMessages(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (m) =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
  );
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

// The site (HostCarriel) and the API (Railway) live on different domains,
// so the browser needs an explicit CORS allowlist. Configure via the
// ALLOWED_ORIGINS env var (comma-separated); defaults cover the production
// domain plus local dev.
const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.gct.com.co",
  "https://gct.com.co",
  "http://localhost:5173",
];

function getAllowedOrigins() {
  const fromEnv = process.env.ALLOWED_ORIGINS;
  if (!fromEnv) return DEFAULT_ALLOWED_ORIGINS;
  return fromEnv.split(",").map((o) => o.trim()).filter(Boolean);
}

function applyCors(req, res, allowedOrigins) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

/**
 * Builds a Connect/Express-compatible request handler for POST /api/chat.
 * `logger` needs `.warn(msg)` and `.error(msg)` — defaults to console.
 */
export function createChatHandler({ logger = console } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const client = apiKey ? new Anthropic({ apiKey }) : null;
  const allowedOrigins = getAllowedOrigins();

  if (!apiKey) {
    logger.warn(
      "[gct-chat-api] ANTHROPIC_API_KEY no está configurada — el asistente de IA responderá con un error."
    );
  }

  return async function chatHandler(req, res) {
    applyCors(req, res, allowedOrigins);

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Método no permitido." });
      return;
    }

    if (!client) {
      sendJson(res, 500, {
        error: "El asistente no está configurado. Falta ANTHROPIC_API_KEY en el servidor.",
      });
      return;
    }

    const ip = req.socket?.remoteAddress ?? req.ip ?? "unknown";
    if (isRateLimited(ip)) {
      sendJson(res, 429, {
        error: "Has hecho muchas preguntas seguidas. Espera unos minutos e intenta de nuevo.",
      });
      return;
    }

    try {
      const body = await readJsonBody(req);
      const messages = body && typeof body === "object" ? body.messages : undefined;

      if (!isValidMessages(messages)) {
        sendJson(res, 400, { error: "Solicitud inválida." });
        return;
      }

      const trimmed = messages.slice(-MAX_MESSAGES).map((m) => ({
        role: m.role,
        content: m.content.slice(0, MAX_MESSAGE_CHARS),
      }));

      const response = await client.messages.create({
        model: "claude-opus-5",
        max_tokens: 1024,
        output_config: { effort: "medium" },
        system: SYSTEM_PROMPT,
        messages: trimmed,
      });

      const textBlock = response.content.find((b) => b.type === "text");

      sendJson(res, 200, { reply: textBlock?.text ?? "No tengo una respuesta en este momento." });
    } catch (err) {
      logger.error(`[gct-chat-api] ${String(err)}`);
      sendJson(res, 502, {
        error: "No pude conectarme con el asistente en este momento. Intenta de nuevo en un momento.",
      });
    }
  };
}
