import { getPool } from "./db.mjs";

const ESTADOS_OBLIGACION = ["pendiente", "presentado", "pagado"];

function publicCliente(row) {
  return {
    id: String(row.id),
    nombre: row.nombre,
    nit: row.nit ?? "",
    tipoPersona: row.tipo_persona ?? "juridica",
    regimen: row.regimen ?? "",
    ciudad: row.ciudad ?? "",
    contacto: {
      nombre: row.contacto_nombre ?? "",
      telefono: row.contacto_telefono ?? "",
      correo: row.contacto_correo ?? "",
      fechaNacimiento: row.contacto_fecha_nacimiento ? row.contacto_fecha_nacimiento.toISOString().slice(0, 10) : "",
    },
    clienteDesde: row.cliente_desde ? row.cliente_desde.toISOString().slice(0, 10) : "",
    responsableId: row.responsable_id !== null ? String(row.responsable_id) : null,
    honorariosMensuales: row.honorarios_mensuales !== null ? Number(row.honorarios_mensuales) : 0,
    estadoCartera: row.estado_cartera,
    notas: row.notas ?? "",
  };
}

function publicObligacion(row) {
  return {
    id: String(row.id),
    clienteId: String(row.cliente_id),
    tipo: row.tipo,
    obligacion: row.obligacion,
    vencimiento: row.vencimiento.toISOString().slice(0, 10),
    estado: row.estado,
  };
}

/** GET /api/clientes — gerente/super_admin: todos. contador/auxiliar: solo los suyos (responsable_id). */
export async function listHandler(req, res) {
  const db = getPool();
  const esGerenteOMas = req.employee.rol === "gerente" || req.employee.rol === "super_admin";

  const clientesQuery = esGerenteOMas
    ? await db.query("SELECT * FROM clientes ORDER BY nombre ASC")
    : await db.query("SELECT * FROM clientes WHERE responsable_id = $1 ORDER BY nombre ASC", [req.employee.id]);

  const clienteIds = clientesQuery.rows.map((r) => r.id);
  const obligacionesQuery =
    clienteIds.length > 0
      ? await db.query("SELECT * FROM obligaciones WHERE cliente_id = ANY($1::int[]) ORDER BY vencimiento ASC", [clienteIds])
      : { rows: [] };

  const obligacionesPorCliente = new Map();
  for (const o of obligacionesQuery.rows) {
    const key = o.cliente_id;
    if (!obligacionesPorCliente.has(key)) obligacionesPorCliente.set(key, []);
    obligacionesPorCliente.get(key).push(publicObligacion(o));
  }

  const clientes = clientesQuery.rows.map((row) => ({
    ...publicCliente(row),
    obligaciones: obligacionesPorCliente.get(row.id) ?? [],
  }));

  res.json({ clientes });
}

/** PATCH /api/obligaciones/:id — cambia el estado (pendiente/presentado/pagado).
 * contador/auxiliar solo pueden tocar obligaciones de clientes que tengan asignados. */
export async function actualizarObligacionHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  const { estado } = req.body ?? {};
  if (!ESTADOS_OBLIGACION.includes(estado)) {
    res.status(400).json({ error: "Estado inválido." });
    return;
  }

  const db = getPool();
  const { rows } = await db.query(
    `SELECT o.*, c.responsable_id FROM obligaciones o JOIN clientes c ON c.id = o.cliente_id WHERE o.id = $1`,
    [id]
  );
  const obligacion = rows[0];
  if (!obligacion) {
    res.status(404).json({ error: "Obligación no encontrada." });
    return;
  }

  const esGerenteOMas = req.employee.rol === "gerente" || req.employee.rol === "super_admin";
  const esResponsable = obligacion.responsable_id === req.employee.id;
  if (!esGerenteOMas && !esResponsable) {
    res.status(403).json({ error: "No tienes permisos para modificar esta obligación." });
    return;
  }

  const { rows: actualizadas } = await db.query(
    `UPDATE obligaciones SET estado = $1, actualizado_por = $2, actualizado_en = now() WHERE id = $3 RETURNING *`,
    [estado, req.employee.id, id]
  );

  res.json({ obligacion: publicObligacion(actualizadas[0]) });
}
