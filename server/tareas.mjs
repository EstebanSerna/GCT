import { getPool } from "./db.mjs";

const ESTADOS = ["pendiente", "en_progreso", "completada", "cancelada"];
// Quien solo es la persona asignada puede avanzar su tarea, pero no cancelarla.
const ESTADOS_ASIGNADO = ["pendiente", "en_progreso", "completada"];
const PRIORIDADES = ["baja", "normal", "alta", "urgente"];
const ESTADO_LABEL = { pendiente: "Pendiente", en_progreso: "En progreso", completada: "Completada", cancelada: "Cancelada" };
const PRIORIDAD_LABEL = { baja: "Baja", normal: "Normal", alta: "Alta", urgente: "Urgente" };

const SELECT_TAREA = `
  SELECT t.*, to_char(t.fecha_limite, 'YYYY-MM-DD') AS fecha_limite_txt,
         c.nombre AS cliente_nombre,
         ea.nombre AS asignado_nombre, ea.coordinador_id AS asignado_coordinador_id,
         ec.nombre AS creado_por_nombre
  FROM tareas t
  JOIN clientes c ON c.id = t.cliente_id
  LEFT JOIN employees ea ON ea.id = t.asignado_a
  LEFT JOIN employees ec ON ec.id = t.creado_por`;

const esGerenteOMas = (employee) => employee.rol === "gerente" || employee.rol === "super_admin";

// Gerente/super admin: gestiona todo. Líder de equipo: lo que ella creó, lo
// que tiene asignado ella, o lo asignado a alguien que ella coordina.
function puedeGestionar(employee, row) {
  if (esGerenteOMas(employee)) return true;
  if (employee.rol === "lider_equipo") {
    return row.creado_por === employee.id || row.asignado_a === employee.id || row.asignado_coordinador_id === employee.id;
  }
  return false;
}

function puedeVer(employee, row) {
  return puedeGestionar(employee, row) || row.asignado_a === employee.id;
}

function publicTarea(row, employee) {
  return {
    id: String(row.id),
    clienteId: String(row.cliente_id),
    clienteNombre: row.cliente_nombre,
    titulo: row.titulo,
    descripcion: row.descripcion ?? "",
    asignadoA: row.asignado_a !== null ? String(row.asignado_a) : null,
    asignadoNombre: row.asignado_nombre ?? null,
    creadoPor: row.creado_por !== null ? String(row.creado_por) : null,
    creadoPorNombre: row.creado_por_nombre ?? null,
    prioridad: row.prioridad,
    fechaLimite: row.fecha_limite_txt ?? "",
    estado: row.estado,
    notaCierre: row.nota_cierre ?? "",
    completadaEn: row.completada_en ? row.completada_en.toISOString() : null,
    creadaEn: row.created_at.toISOString(),
    actualizadaEn: row.updated_at.toISOString(),
    puedeGestionar: puedeGestionar(employee, row),
  };
}

function fechaValida(texto) {
  if (typeof texto !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const d = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

async function tareaPorId(db, id) {
  const { rows } = await db.query(`${SELECT_TAREA} WHERE t.id = $1`, [id]);
  return rows[0] ?? null;
}

async function registrarEvento(db, tareaId, employeeId, accion, detalle) {
  await db.query("INSERT INTO tarea_eventos (tarea_id, employee_id, accion, detalle) VALUES ($1,$2,$3,$4)", [
    tareaId,
    employeeId,
    accion,
    detalle ?? null,
  ]);
}

// Una persona a la que se le puede asignar trabajo: cuenta activa y con rol.
// Una líder de equipo solo puede asignarse a sí misma o a quien coordina.
async function validarAsignado(db, employee, asignadoId) {
  const { rows } = await db.query("SELECT id, nombre, rol, activo, coordinador_id FROM employees WHERE id = $1", [asignadoId]);
  const destino = rows[0];
  if (!destino || !destino.activo || !destino.rol) return { error: 400, mensaje: "Esa persona no está activa en la plataforma." };
  if (employee.rol === "lider_equipo" && destino.id !== employee.id && destino.coordinador_id !== employee.id) {
    return { error: 403, mensaje: "Solo puedes asignar tareas a personas de tu propio equipo." };
  }
  return { destino };
}

/** GET /api/tareas — gerente/super admin: todas. Líder de equipo: las suyas,
 * las que creó y las de su equipo. Contador/auxiliar: solo las asignadas a ellos. */
export async function listarHandler(req, res) {
  const db = getPool();
  const { rol, id } = req.employee;
  let where = "";
  const params = [];
  if (rol === "lider_equipo") {
    where = "WHERE (t.asignado_a = $1 OR t.creado_por = $1 OR ea.coordinador_id = $1)";
    params.push(id);
  } else if (!esGerenteOMas(req.employee)) {
    where = "WHERE t.asignado_a = $1";
    params.push(id);
  }

  const { rows } = await db.query(
    `${SELECT_TAREA} ${where}
     ORDER BY (t.estado IN ('completada','cancelada')) ASC, t.fecha_limite ASC NULLS LAST, t.id DESC
     LIMIT 2000`,
    params
  );
  res.json({ tareas: rows.map((r) => publicTarea(r, req.employee)) });
}

/** POST /api/tareas — gerente/super admin/líder de equipo. */
export async function crearHandler(req, res) {
  const { clienteId, titulo, descripcion, asignadoA, prioridad, fechaLimite } = req.body ?? {};

  if (!Number.isInteger(Number(clienteId))) {
    res.status(400).json({ error: "Elige el cliente para el que es la tarea." });
    return;
  }
  if (typeof titulo !== "string" || titulo.trim().length < 3 || titulo.trim().length > 200) {
    res.status(400).json({ error: "Escribe un título para la tarea (entre 3 y 200 caracteres)." });
    return;
  }
  if (descripcion !== undefined && descripcion !== null && (typeof descripcion !== "string" || descripcion.length > 2000)) {
    res.status(400).json({ error: "La descripción es demasiado larga (máximo 2000 caracteres)." });
    return;
  }
  if (!Number.isInteger(Number(asignadoA))) {
    res.status(400).json({ error: "Elige a quién se le asigna la tarea." });
    return;
  }
  const prioridadFinal = prioridad ?? "normal";
  if (!PRIORIDADES.includes(prioridadFinal)) {
    res.status(400).json({ error: "Prioridad inválida." });
    return;
  }
  if (fechaLimite && !fechaValida(fechaLimite)) {
    res.status(400).json({ error: "La fecha límite no es válida." });
    return;
  }

  const db = getPool();
  const { rows: clientes } = await db.query("SELECT id FROM clientes WHERE id = $1", [Number(clienteId)]);
  if (!clientes[0]) {
    res.status(404).json({ error: "Cliente no encontrado." });
    return;
  }
  const { error, mensaje, destino } = await validarAsignado(db, req.employee, Number(asignadoA));
  if (error) {
    res.status(error).json({ error: mensaje });
    return;
  }

  const { rows } = await db.query(
    `INSERT INTO tareas (cliente_id, titulo, descripcion, asignado_a, creado_por, prioridad, fecha_limite)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [Number(clienteId), titulo.trim(), descripcion?.trim() || null, destino.id, req.employee.id, prioridadFinal, fechaLimite || null]
  );
  await registrarEvento(db, rows[0].id, req.employee.id, "creada", `Asignada a ${destino.nombre} · prioridad ${PRIORIDAD_LABEL[prioridadFinal].toLowerCase()}`);

  res.status(201).json({ tarea: publicTarea(await tareaPorId(db, rows[0].id), req.employee) });
}

/** PATCH /api/tareas/:id — quien gestiona la tarea puede cambiar todo; la
 * persona asignada solo puede avanzar el estado y dejar una nota de cierre. */
export async function actualizarHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  const db = getPool();
  const tarea = await tareaPorId(db, id);
  if (!tarea || !puedeVer(req.employee, tarea)) {
    res.status(404).json({ error: "Tarea no encontrada." });
    return;
  }

  const gestiona = puedeGestionar(req.employee, tarea);
  const { titulo, descripcion, asignadoA, prioridad, fechaLimite, estado, notaCierre } = req.body ?? {};

  const soloGestion = [titulo, descripcion, asignadoA, prioridad, fechaLimite].some((v) => v !== undefined);
  if (soloGestion && !gestiona) {
    res.status(403).json({ error: "Solo quien asigna la tarea puede cambiar eso." });
    return;
  }

  const sets = [];
  const params = [];
  const set = (columna, valor) => {
    params.push(valor);
    sets.push(`${columna} = $${params.length}`);
  };
  const eventos = [];

  if (estado !== undefined) {
    if (!ESTADOS.includes(estado) || (!gestiona && !ESTADOS_ASIGNADO.includes(estado))) {
      res.status(400).json({ error: "Estado inválido." });
      return;
    }
    if (estado !== tarea.estado) {
      set("estado", estado);
      set("completada_en", estado === "completada" ? new Date() : null);
      eventos.push(["estado", `${ESTADO_LABEL[tarea.estado]} → ${ESTADO_LABEL[estado]}`]);
    }
  }
  if (notaCierre !== undefined) {
    if (typeof notaCierre !== "string" || notaCierre.length > 1000) {
      res.status(400).json({ error: "La nota es demasiado larga (máximo 1000 caracteres)." });
      return;
    }
    if (notaCierre.trim() !== (tarea.nota_cierre ?? "")) {
      set("nota_cierre", notaCierre.trim() || null);
      if (notaCierre.trim()) eventos.push(["nota", notaCierre.trim()]);
    }
  }

  if (titulo !== undefined) {
    if (typeof titulo !== "string" || titulo.trim().length < 3 || titulo.trim().length > 200) {
      res.status(400).json({ error: "Escribe un título para la tarea (entre 3 y 200 caracteres)." });
      return;
    }
    if (titulo.trim() !== tarea.titulo) {
      set("titulo", titulo.trim());
      eventos.push(["editada", "Cambió el título"]);
    }
  }
  if (descripcion !== undefined) {
    if (descripcion !== null && (typeof descripcion !== "string" || descripcion.length > 2000)) {
      res.status(400).json({ error: "La descripción es demasiado larga (máximo 2000 caracteres)." });
      return;
    }
    if ((descripcion?.trim() || "") !== (tarea.descripcion ?? "")) {
      set("descripcion", descripcion?.trim() || null);
      eventos.push(["editada", "Cambió la descripción"]);
    }
  }
  if (prioridad !== undefined) {
    if (!PRIORIDADES.includes(prioridad)) {
      res.status(400).json({ error: "Prioridad inválida." });
      return;
    }
    if (prioridad !== tarea.prioridad) {
      set("prioridad", prioridad);
      eventos.push(["prioridad", `${PRIORIDAD_LABEL[tarea.prioridad]} → ${PRIORIDAD_LABEL[prioridad]}`]);
    }
  }
  if (fechaLimite !== undefined) {
    if (fechaLimite !== null && fechaLimite !== "" && !fechaValida(fechaLimite)) {
      res.status(400).json({ error: "La fecha límite no es válida." });
      return;
    }
    const nueva = fechaLimite || null;
    if (nueva !== (tarea.fecha_limite_txt ?? null)) {
      set("fecha_limite", nueva);
      eventos.push(["fecha", `${tarea.fecha_limite_txt ?? "sin fecha"} → ${nueva ?? "sin fecha"}`]);
    }
  }
  if (asignadoA !== undefined) {
    if (!Number.isInteger(Number(asignadoA))) {
      res.status(400).json({ error: "Elige a quién se le asigna la tarea." });
      return;
    }
    if (Number(asignadoA) !== tarea.asignado_a) {
      const { error, mensaje, destino } = await validarAsignado(db, req.employee, Number(asignadoA));
      if (error) {
        res.status(error).json({ error: mensaje });
        return;
      }
      set("asignado_a", destino.id);
      eventos.push(["reasignada", `${tarea.asignado_nombre ?? "Sin asignar"} → ${destino.nombre}`]);
    }
  }

  if (sets.length > 0) {
    params.push(id);
    await db.query(`UPDATE tareas SET ${sets.join(", ")}, updated_at = now() WHERE id = $${params.length}`, params);
    for (const [accion, detalle] of eventos) await registrarEvento(db, id, req.employee.id, accion, detalle);
  }

  res.json({ tarea: publicTarea(await tareaPorId(db, id), req.employee) });
}

/** GET /api/tareas/:id/historial — la línea de tiempo de la tarea. */
export async function historialHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  const db = getPool();
  const tarea = await tareaPorId(db, id);
  if (!tarea || !puedeVer(req.employee, tarea)) {
    res.status(404).json({ error: "Tarea no encontrada." });
    return;
  }

  const { rows } = await db.query(
    `SELECT ev.id, ev.accion, ev.detalle, ev.creado_en, e.nombre AS empleado_nombre
     FROM tarea_eventos ev LEFT JOIN employees e ON e.id = ev.employee_id
     WHERE ev.tarea_id = $1 ORDER BY ev.creado_en ASC, ev.id ASC`,
    [id]
  );
  res.json({
    eventos: rows.map((r) => ({
      id: String(r.id),
      accion: r.accion,
      detalle: r.detalle ?? "",
      empleadoNombre: r.empleado_nombre ?? null,
      creadoEn: r.creado_en.toISOString(),
    })),
  });
}
