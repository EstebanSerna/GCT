// Shared CORS allowlist — the site (HostCarriel) and the API (Railway) live
// on different domains, so the browser needs explicit CORS. Configure via
// the ALLOWED_ORIGINS env var (comma-separated); defaults cover production
// plus local dev.
const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.gct.com.co",
  "https://gct.com.co",
  "http://localhost:5173",
];

export function getAllowedOrigins() {
  const fromEnv = process.env.ALLOWED_ORIGINS;
  if (!fromEnv) return DEFAULT_ALLOWED_ORIGINS;
  return fromEnv.split(",").map((o) => o.trim()).filter(Boolean);
}

/** Sets CORS headers on `res` for `req.headers.origin`, if it's allowlisted. */
export function applyCors(req, res, allowedOrigins = getAllowedOrigins()) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
}

/** Express middleware form: applies CORS and answers OPTIONS preflight. */
export function corsMiddleware(req, res, next) {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}
