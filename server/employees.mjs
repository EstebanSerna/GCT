import bcrypt from "bcryptjs";
import { getPool } from "./db.mjs";
import { esEmailValido, validarPassword, inicialesDe } from "./validation.mjs";
import { crearSesion } from "./auth.mjs";

const ROLES_ASIGNABLES = ["gerente", "lider_equipo", "contador", "auxiliar"]; // super_admin no se asigna por acá

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
    coordinadorId: row.coordinador_id ?? null,
  };
}

/** GET /api/employees — super admin: todos, incluidos los pendientes de aprobar. */
export async function listHandler(req, res) {
  const db = getPool();
  const { rows } = await db.query("SELECT * FROM employees ORDER BY activo ASC, nombre ASC");
  res.json({ employees: rows.map(publicEmployee) });
}

/** GET /api/employees/equipo — gerente/super admin: todo el equipo activo.
 * Líder de equipo: solo las personas que coordina. Sin fotos/datos sensibles de más. */
export async function listEquipoHandler(req, res) {
  const db = getPool();
  const esGerenteOMas = req.employee.rol === "gerente" || req.employee.rol === "super_admin";
  const { rows } = esGerenteOMas
    ? await db.query("SELECT id, nombre, email, rol, iniciales, activo, coordinador_id FROM employees WHERE activo = true ORDER BY nombre ASC")
    : await db.query(
        "SELECT id, nombre, email, rol, iniciales, activo, coordinador_id FROM employees WHERE activo = true AND coordinador_id = $1 ORDER BY nombre ASC",
        [req.employee.id]
      );
  res.json({ employees: rows.map((r) => ({ ...publicEmployee(r), fotoBase64: undefined })) });
}

/** POST /api/employees — super admin crea una cuenta directamente (ya aprobada). */
export async function createHandler(req, res) {
  const { nombre, email, password, rol, documento, telefono } = req.body ?? {};

  if (typeof nombre !== "string" || nombre.trim().length < 3) {
    res.status(400).json({ error: "Falta un nombre válido." });
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
  if (!ROLES_ASIGNABLES.includes(rol)) {
    res.status(400).json({ error: "Rol inválido." });
    return;
  }

  const db = getPool();
  const emailNormalizado = email.trim().toLowerCase();
  const existing = await db.query("SELECT 1 FROM employees WHERE lower(email) = $1", [emailNormalizado]);
  if (existing.rows.length > 0) {
    res.status(409).json({ error: "Ya existe un empleado con ese correo." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    `INSERT INTO employees (nombre, email, password_hash, rol, iniciales, documento, telefono, activo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
    [nombre.trim(), emailNormalizado, passwordHash, rol, inicialesDe(nombre), documento ?? null, telefono ?? null]
  );

  res.status(201).json({ employee: publicEmployee(rows[0]) });
}

/** PATCH /api/employees/:id — super admin: aprobar (activo+rol), cambiar rol, restablecer contraseña, desactivar. */
export async function updateHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  const { activo, rol, password, coordinadorId } = req.body ?? {};
  const db = getPool();

  if (typeof activo === "boolean") {
    await db.query("UPDATE employees SET activo = $1 WHERE id = $2", [activo, id]);
  }
  if (rol !== undefined) {
    if (!ROLES_ASIGNABLES.includes(rol)) {
      res.status(400).json({ error: "Rol inválido." });
      return;
    }
    await db.query("UPDATE employees SET rol = $1 WHERE id = $2", [rol, id]);
  }
  if (coordinadorId !== undefined) {
    if (coordinadorId !== null && Number(coordinadorId) === id) {
      res.status(400).json({ error: "Una persona no puede coordinarse a sí misma." });
      return;
    }
    await db.query("UPDATE employees SET coordinador_id = $1 WHERE id = $2", [coordinadorId, id]);
  }
  if (typeof password === "string") {
    const errorPassword = validarPassword(password);
    if (errorPassword) {
      res.status(400).json({ error: errorPassword });
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

/** DELETE /api/employees/:id — super admin: elimina la cuenta por completo. */
export async function deleteHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }
  if (id === req.employee.id) {
    res.status(400).json({ error: "No puedes eliminar tu propia cuenta." });
    return;
  }

  const db = getPool();
  const { rows } = await db.query("DELETE FROM employees WHERE id = $1 RETURNING id", [id]);
  if (rows.length === 0) {
    res.status(404).json({ error: "Empleado no encontrado." });
    return;
  }
  res.json({ ok: true });
}

/** POST /api/employees/:id/impersonate — super admin: abre una sesión real
 * como esa persona, para auditar el sistema desde su perspectiva exacta
 * (permisos incluidos, no es una simulación visual). Queda registrado en
 * los logs del servidor quién entró como quién. */
export async function impersonarHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }
  if (id === req.employee.id) {
    res.status(400).json({ error: "Ya estás en tu propia cuenta." });
    return;
  }

  const db = getPool();
  const { rows } = await db.query("SELECT * FROM employees WHERE id = $1", [id]);
  const objetivo = rows[0];
  if (!objetivo) {
    res.status(404).json({ error: "Empleado no encontrado." });
    return;
  }
  if (!objetivo.activo || !objetivo.rol) {
    res.status(400).json({ error: "Esa cuenta todavía no está activa." });
    return;
  }

  const session = await crearSesion(objetivo.id);
  console.log(`[gct] ${req.employee.email} (super admin) inició sesión como ${objetivo.email} (${objetivo.rol}) para auditoría — token de vuelta al cerrar.`);
  res.json({ token: session.token, employee: publicEmployee(objetivo) });
}
