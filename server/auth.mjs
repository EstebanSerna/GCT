import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { getPool } from "./db.mjs";
import { esEmailValido, validarPassword, inicialesDe } from "./validation.mjs";

const SESSION_DAYS = 14;
const MAX_FOTO_BASE64_LENGTH = 400_000; // ~300 KB de imagen, generoso para una foto de perfil ya comprimida

// Correos que se activan automáticamente como super admin al registrarse,
// sin pasar por la aprobación (no hay nadie por encima que los apruebe).
// Configurable por si en el futuro hay más de una persona en ese nivel.
function superAdminEmails() {
  const fromEnv = process.env.SUPER_ADMIN_EMAILS;
  const base = fromEnv ? fromEnv.split(",").map((e) => e.trim().toLowerCase()) : [];
  return new Set([...base, "esteban.serna.garcia@gmail.com"]);
}

function publicEmployee(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    rol: row.rol,
    iniciales: row.iniciales,
    documento: row.documento,
    telefono: row.telefono,
    fotoBase64: row.foto_base64,
    activo: row.activo,
  };
}

/** POST /api/auth/registro — cualquiera puede llenar el formulario; queda
 * pendiente de aprobación del super admin, salvo el/los correos de la
 * lista de arriba. */
export async function registroHandler(req, res) {
  const { nombre, documento, telefono, email, password, fotoBase64 } = req.body ?? {};

  if (typeof nombre !== "string" || nombre.trim().length < 3) {
    res.status(400).json({ error: "Escribe tu nombre completo." });
    return;
  }
  if (typeof documento !== "string" || documento.trim().length < 4) {
    res.status(400).json({ error: "Escribe un número de documento válido." });
    return;
  }
  if (typeof telefono !== "string" || telefono.trim().length < 7) {
    res.status(400).json({ error: "Escribe un número de celular válido." });
    return;
  }
  if (!esEmailValido(email)) {
    res.status(400).json({ error: "Escribe un correo electrónico válido." });
    return;
  }
  const errorPassword = validarPassword(password);
  if (errorPassword) {
    res.status(400).json({ error: errorPassword });
    return;
  }
  if (fotoBase64 && (typeof fotoBase64 !== "string" || fotoBase64.length > MAX_FOTO_BASE64_LENGTH)) {
    res.status(400).json({ error: "La foto es demasiado pesada. Intenta con una más liviana." });
    return;
  }

  const emailNormalizado = email.trim().toLowerCase();
  const db = getPool();

  const existente = await db.query("SELECT 1 FROM employees WHERE lower(email) = $1", [emailNormalizado]);
  if (existente.rows.length > 0) {
    res.status(409).json({ error: "Ya existe una cuenta con ese correo." });
    return;
  }

  const esSuperAdmin = superAdminEmails().has(emailNormalizado);
  const passwordHash = await bcrypt.hash(password, 10);

  const { rows } = await db.query(
    `INSERT INTO employees (nombre, email, password_hash, rol, iniciales, documento, telefono, foto_base64, activo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      nombre.trim(),
      emailNormalizado,
      passwordHash,
      esSuperAdmin ? "super_admin" : null,
      inicialesDe(nombre),
      documento.trim(),
      telefono.trim(),
      fotoBase64 || null,
      esSuperAdmin,
    ]
  );

  const employee = rows[0];

  if (!esSuperAdmin) {
    res.status(201).json({
      pendiente: true,
      mensaje: "Tu cuenta quedó registrada. Un administrador debe aprobarla antes de que puedas iniciar sesión.",
    });
    return;
  }

  const session = await crearSesion(employee.id);
  res.status(201).json({ pendiente: false, token: session.token, employee: publicEmployee(employee) });
}

async function crearSesion(employeeId) {
  const db = getPool();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.query("INSERT INTO sessions (token, employee_id, expires_at) VALUES ($1, $2, $3)", [
    token,
    employeeId,
    expiresAt,
  ]);
  return { token };
}

export async function login(email, password) {
  const db = getPool();
  const { rows } = await db.query("SELECT * FROM employees WHERE lower(email) = lower($1)", [email.trim()]);
  const employee = rows[0];
  if (!employee) return { error: "Correo o contraseña incorrectos." };

  const valid = await bcrypt.compare(password, employee.password_hash);
  if (!valid) return { error: "Correo o contraseña incorrectos." };

  if (!employee.activo || !employee.rol) {
    return { error: "Tu cuenta todavía no ha sido aprobada por un administrador." };
  }

  const session = await crearSesion(employee.id);
  return { token: session.token, employee: publicEmployee(employee) };
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
     WHERE s.token = $1 AND s.expires_at > now() AND e.activo = true AND e.rol IS NOT NULL`,
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

function requireRoles(roles) {
  return async function (req, res, next) {
    const token = tokenFromHeader(req);
    const employee = await getEmployeeForToken(token);
    if (!employee) {
      res.status(401).json({ error: "Sesión inválida o expirada. Inicia sesión de nuevo." });
      return;
    }
    if (!roles.includes(employee.rol)) {
      res.status(403).json({ error: "No tienes permisos para esta acción." });
      return;
    }
    req.employee = employee;
    req.authToken = token;
    next();
  };
}

/** Gerente o super admin. */
export const requireGerenteOAbove = requireRoles(["gerente", "super_admin"]);

/** Solo super admin. */
export const requireSuperAdmin = requireRoles(["super_admin"]);

/** POST /api/auth/login — body: { email, password }. */
export async function loginHandler(req, res) {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    res.status(400).json({ error: "Correo y contraseña son obligatorios." });
    return;
  }
  const result = await login(email, password);
  if (result.error) {
    res.status(401).json({ error: result.error });
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
