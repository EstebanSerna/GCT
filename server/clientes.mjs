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

/** GET /api/clientes — gerente/super_admin/líder de equipo: todos (la líder
 * de equipo necesita visión completa de la firma, no solo de su equipo).
 * contador/auxiliar: solo los suyos. */
export async function listHandler(req, res) {
  const db = getPool();
  const rol = req.employee.rol;

  const clientesQuery =
    rol === "gerente" || rol === "super_admin" || rol === "lider_equipo"
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

// ¿Puede esta cuenta gestionar (ver/editar) un cliente cuyo responsable es
// `responsableId` y cuyo responsable reporta a `responsableCoordinadorId`?
// Gerente/super admin: siempre. Líder de equipo: si el cliente es suyo o de
// alguien que ella coordina. Contador/auxiliar: solo si es su propio cliente.
function puedeGestionar(employee, responsableId, responsableCoordinadorId) {
  if (employee.rol === "gerente" || employee.rol === "super_admin") return true;
  if (responsableId === employee.id) return true;
  if (employee.rol === "lider_equipo" && responsableCoordinadorId === employee.id) return true;
  return false;
}

/** PATCH /api/obligaciones/:id — cambia el estado (pendiente/presentado/pagado).
 * contador/auxiliar solo pueden tocar obligaciones de clientes que tengan asignados;
 * líder de equipo, las de los clientes de su equipo también. */
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
    `SELECT o.*, c.responsable_id, e.coordinador_id AS responsable_coordinador_id
     FROM obligaciones o
     JOIN clientes c ON c.id = o.cliente_id
     LEFT JOIN employees e ON e.id = c.responsable_id
     WHERE o.id = $1`,
    [id]
  );
  const obligacion = rows[0];
  if (!obligacion) {
    res.status(404).json({ error: "Obligación no encontrada." });
    return;
  }

  if (!puedeGestionar(req.employee, obligacion.responsable_id, obligacion.responsable_coordinador_id)) {
    res.status(403).json({ error: "No tienes permisos para modificar esta obligación." });
    return;
  }

  const { rows: actualizadas } = await db.query(
    `UPDATE obligaciones SET estado = $1, actualizado_por = $2, actualizado_en = now() WHERE id = $3 RETURNING *`,
    [estado, req.employee.id, id]
  );

  res.json({ obligacion: publicObligacion(actualizadas[0]) });
}

/** PATCH /api/clientes/:id — hoy solo reasigna el responsable (para repartir
 * carga de trabajo). Gerente/super admin: a cualquier persona. Líder de
 * equipo: solo entre las personas que coordina (y ella misma), y solo para
 * clientes que ya son suyos o de su equipo. */
export async function actualizarClienteHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  const { responsableId } = req.body ?? {};
  if (responsableId !== null && !Number.isInteger(Number(responsableId))) {
    res.status(400).json({ error: "responsableId inválido." });
    return;
  }
  const nuevoResponsableId = responsableId === null ? null : Number(responsableId);

  const db = getPool();
  const { rows } = await db.query(
    `SELECT c.*, e.coordinador_id AS responsable_coordinador_id
     FROM clientes c
     LEFT JOIN employees e ON e.id = c.responsable_id
     WHERE c.id = $1`,
    [id]
  );
  const cliente = rows[0];
  if (!cliente) {
    res.status(404).json({ error: "Cliente no encontrado." });
    return;
  }

  if (!puedeGestionar(req.employee, cliente.responsable_id, cliente.responsable_coordinador_id)) {
    res.status(403).json({ error: "No tienes permisos para reasignar este cliente." });
    return;
  }

  // Una líder de equipo solo puede mover el cliente a alguien de su propio
  // equipo (o a sí misma) — no puede regalarle un cliente a otro equipo.
  if (req.employee.rol === "lider_equipo" && nuevoResponsableId !== null && nuevoResponsableId !== req.employee.id) {
    const { rows: destino } = await db.query("SELECT coordinador_id FROM employees WHERE id = $1", [nuevoResponsableId]);
    if (!destino[0] || destino[0].coordinador_id !== req.employee.id) {
      res.status(403).json({ error: "Solo puedes asignar clientes a personas de tu propio equipo." });
      return;
    }
  }

  const { rows: actualizado } = await db.query(
    "UPDATE clientes SET responsable_id = $1 WHERE id = $2 RETURNING *",
    [nuevoResponsableId, id]
  );

  res.json({ cliente: { ...publicCliente(actualizado[0]), obligaciones: [] } });
}
