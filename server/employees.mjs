import bcrypt from "bcryptjs";
import { getPool } from "./db.mjs";

function publicEmployee(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    usuario: row.usuario,
    rol: row.rol,
    iniciales: row.iniciales,
    activo: row.activo,
  };
}

/** GET /api/employees — admin only. */
export async function listHandler(req, res) {
  const db = getPool();
  const { rows } = await db.query("SELECT * FROM employees ORDER BY nombre ASC");
  res.json({ employees: rows.map(publicEmployee) });
}

function inicialesDe(nombre) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** POST /api/employees — admin only. Body: { nombre, usuario, password, rol }. */
export async function createHandler(req, res) {
  const { nombre, usuario, password, rol } = req.body ?? {};

  if (typeof nombre !== "string" || nombre.trim().length < 2) {
    res.status(400).json({ error: "Falta un nombre válido." });
    return;
  }
  if (typeof usuario !== "string" || !/^[a-z0-9._-]{3,40}$/i.test(usuario)) {
    res.status(400).json({ error: "El usuario debe tener 3-40 caracteres (letras, números, puntos, guiones)." });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
    return;
  }
  if (!["admin", "contador", "auxiliar"].includes(rol)) {
    res.status(400).json({ error: "Rol inválido." });
    return;
  }

  const db = getPool();
  const existing = await db.query("SELECT 1 FROM employees WHERE lower(usuario) = lower($1)", [usuario]);
  if (existing.rows.length > 0) {
    res.status(409).json({ error: "Ya existe un empleado con ese usuario." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    `INSERT INTO employees (nombre, usuario, password_hash, rol, iniciales)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [nombre.trim(), usuario.trim(), passwordHash, rol, inicialesDe(nombre)]
  );

  res.status(201).json({ employee: publicEmployee(rows[0]) });
}

/** PATCH /api/employees/:id — admin only. Body may include activo, rol, password. */
export async function updateHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  const { activo, rol, password } = req.body ?? {};
  const db = getPool();

  if (typeof activo === "boolean") {
    await db.query("UPDATE employees SET activo = $1 WHERE id = $2", [activo, id]);
  }
  if (rol && ["admin", "contador", "auxiliar"].includes(rol)) {
    await db.query("UPDATE employees SET rol = $1 WHERE id = $2", [rol, id]);
  }
  if (typeof password === "string") {
    if (password.length < 8) {
      res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await db.query("UPDATE employees SET password_hash = $1 WHERE id = $2", [passwordHash, id]);
    // Cerrar sesiones existentes al cambiar la contraseña.
    await db.query("DELETE FROM sessions WHERE employee_id = $1", [id]);
  }

  const { rows } = await db.query("SELECT * FROM employees WHERE id = $1", [id]);
  if (!rows[0]) {
    res.status(404).json({ error: "Empleado no encontrado." });
    return;
  }
  res.json({ employee: publicEmployee(rows[0]) });
}
