import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { getPool } from "./db.mjs";

const SESSION_DAYS = 14;

function publicEmployee(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    usuario: row.usuario,
    rol: row.rol,
    iniciales: row.iniciales,
  };
}

export async function login(usuario, password) {
  const db = getPool();
  const { rows } = await db.query(
    "SELECT * FROM employees WHERE lower(usuario) = lower($1) AND activo = true",
    [usuario]
  );
  const employee = rows[0];
  if (!employee) return null;

  const valid = await bcrypt.compare(password, employee.password_hash);
  if (!valid) return null;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.query("INSERT INTO sessions (token, employee_id, expires_at) VALUES ($1, $2, $3)", [
    token,
    employee.id,
    expiresAt,
  ]);

  return { token, employee: publicEmployee(employee) };
}

export async function logout(token) {
  const db = getPool();
  await db.query("DELETE FROM sessions WHERE token = $1", [token]);
}

export async function getEmployeeForToken(token) {
  if (!token) return null;
  const db = getPool();
  const { rows } = await db.query(
    `SELECT e.* FROM sessions s
     JOIN employees e ON e.id = s.employee_id
     WHERE s.token = $1 AND s.expires_at > now() AND e.activo = true`,
    [token]
  );
  const employee = rows[0];
  return employee ? publicEmployee(employee) : null;
}

function tokenFromHeader(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" ? token : null;
}

/** Express middleware: attaches req.employee, or responds 401. */
export async function requireAuth(req, res, next) {
  const token = tokenFromHeader(req);
  const employee = await getEmployeeForToken(token);
  if (!employee) {
    res.status(401).json({ error: "Sesión inválida o expirada. Inicia sesión de nuevo." });
    return;
  }
  req.employee = employee;
  req.authToken = token;
  next();
}

/** Express middleware: like requireAuth, but only lets admin/gerente through. */
export async function requireAdmin(req, res, next) {
  const token = tokenFromHeader(req);
  const employee = await getEmployeeForToken(token);
  if (!employee) {
    res.status(401).json({ error: "Sesión inválida o expirada. Inicia sesión de nuevo." });
    return;
  }
  if (employee.rol !== "admin") {
    res.status(403).json({ error: "Esta acción requiere permisos de gerencia." });
    return;
  }
  req.employee = employee;
  req.authToken = token;
  next();
}

/** POST /api/auth/login — body: { usuario, password }. */
export async function loginHandler(req, res) {
  const { usuario, password } = req.body ?? {};
  if (typeof usuario !== "string" || typeof password !== "string" || !usuario || !password) {
    res.status(400).json({ error: "Usuario y contraseña son obligatorios." });
    return;
  }
  const result = await login(usuario, password);
  if (!result) {
    res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    return;
  }
  res.json(result);
}

/** POST /api/auth/logout */
export async function logoutHandler(req, res) {
  if (req.authToken) await logout(req.authToken);
  res.json({ ok: true });
}

/** GET /api/auth/me — returns the current session's employee. */
export async function meHandler(req, res) {
  res.json({ employee: req.employee });
}
