import { getPool } from "./db.mjs";
import { subirArchivo, urlDescarga } from "./storage.mjs";

const ESTADOS_OBLIGACION = ["pendiente", "presentado", "pagado"];
const ESTADOS_QUE_EXIGEN_SOPORTE = ["presentado", "pagado"];
const TAMANO_MAXIMO_ARCHIVO = 15 * 1024 * 1024; // 15 MB
const TIPOS_PERMITIDOS = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

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
    revisorId: row.revisor_id !== null ? String(row.revisor_id) : null,
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
    documentos: [],
  };
}

function publicDocumento(row) {
  return {
    id: String(row.id),
    clienteId: String(row.cliente_id),
    obligacionId: row.obligacion_id !== null ? String(row.obligacion_id) : null,
    nombreArchivo: row.nombre_archivo,
    tipoMime: row.tipo_mime,
    tamanoBytes: row.tamano_bytes,
    subidoPor: row.subido_por !== null ? String(row.subido_por) : null,
    subidoEn: row.subido_en.toISOString(),
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
  const documentosQuery =
    clienteIds.length > 0
      ? await db.query("SELECT * FROM documentos WHERE cliente_id = ANY($1::int[])", [clienteIds])
      : { rows: [] };

  const documentosPorObligacion = new Map();
  for (const d of documentosQuery.rows) {
    if (d.obligacion_id === null) continue;
    if (!documentosPorObligacion.has(d.obligacion_id)) documentosPorObligacion.set(d.obligacion_id, []);
    documentosPorObligacion.get(d.obligacion_id).push(publicDocumento(d));
  }

  const obligacionesPorCliente = new Map();
  for (const o of obligacionesQuery.rows) {
    const key = o.cliente_id;
    if (!obligacionesPorCliente.has(key)) obligacionesPorCliente.set(key, []);
    const publica = publicObligacion(o);
    publica.documentos = documentosPorObligacion.get(o.id) ?? [];
    obligacionesPorCliente.get(key).push(publica);
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

async function obligacionConPermiso(db, id, employee) {
  const { rows } = await db.query(
    `SELECT o.*, c.responsable_id, e.coordinador_id AS responsable_coordinador_id
     FROM obligaciones o
     JOIN clientes c ON c.id = o.cliente_id
     LEFT JOIN employees e ON e.id = c.responsable_id
     WHERE o.id = $1`,
    [id]
  );
  const obligacion = rows[0];
  if (!obligacion) return { error: 404, mensaje: "Obligación no encontrada." };
  if (!puedeGestionar(employee, obligacion.responsable_id, obligacion.responsable_coordinador_id)) {
    return { error: 403, mensaje: "No tienes permisos para modificar esta obligación." };
  }
  return { obligacion };
}

/** PATCH /api/obligaciones/:id — solo para volver a "pendiente" (deshacer un
 * error). Marcar como presentado/pagado exige subir el soporte — ver
 * POST /api/obligaciones/:id/soporte. */
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
  if (ESTADOS_QUE_EXIGEN_SOPORTE.includes(estado)) {
    res.status(400).json({ error: "Para marcarla como presentada o pagada hay que adjuntar el soporte." });
    return;
  }

  const db = getPool();
  const { error, mensaje } = await obligacionConPermiso(db, id, req.employee);
  if (error) {
    res.status(error).json({ error: mensaje });
    return;
  }

  const { rows: actualizadas } = await db.query(
    `UPDATE obligaciones SET estado = $1, actualizado_por = $2, actualizado_en = now() WHERE id = $3 RETURNING *`,
    [estado, req.employee.id, id]
  );

  const publica = publicObligacion(actualizadas[0]);
  const { rows: docs } = await db.query("SELECT * FROM documentos WHERE obligacion_id = $1", [id]);
  publica.documentos = docs.map(publicDocumento);
  res.json({ obligacion: publica });
}

/** POST /api/obligaciones/:id/soporte — multipart: campos "estado"
 * (presentado|pagado) y "archivo". Sube el soporte al bucket, lo registra en
 * `documentos` y cambia el estado de la obligación — todo junto, porque el
 * uno no tiene sentido sin el otro. */
export async function subirSoporteHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  const { estado } = req.body ?? {};
  if (!ESTADOS_QUE_EXIGEN_SOPORTE.includes(estado)) {
    res.status(400).json({ error: "Estado inválido — debe ser 'presentado' o 'pagado'." });
    return;
  }
  const archivo = req.file;
  if (!archivo) {
    res.status(400).json({ error: "Falta el archivo de soporte." });
    return;
  }
  if (!TIPOS_PERMITIDOS.has(archivo.mimetype)) {
    res.status(400).json({ error: "El soporte debe ser PDF o una imagen (JPG, PNG, WEBP)." });
    return;
  }

  const db = getPool();
  const { error, mensaje, obligacion } = await obligacionConPermiso(db, id, req.employee);
  if (error) {
    res.status(error).json({ error: mensaje });
    return;
  }

  const key = `obligaciones/${id}/${Date.now()}-${archivo.originalname.replace(/[^\w.\-]+/g, "_")}`;
  await subirArchivo(key, archivo.buffer, archivo.mimetype);

  const { rows: docRows } = await db.query(
    `INSERT INTO documentos (cliente_id, obligacion_id, nombre_archivo, storage_key, tipo_mime, tamano_bytes, subido_por)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [obligacion.cliente_id, id, archivo.originalname, key, archivo.mimetype, archivo.size, req.employee.id]
  );

  const { rows: actualizadas } = await db.query(
    `UPDATE obligaciones SET estado = $1, actualizado_por = $2, actualizado_en = now() WHERE id = $3 RETURNING *`,
    [estado, req.employee.id, id]
  );

  const publica = publicObligacion(actualizadas[0]);
  publica.documentos = [publicDocumento(docRows[0])];
  res.json({ obligacion: publica });
}

/** GET /api/documentos/:id/descargar — devuelve una URL firmada temporal
 * (5 min) al archivo real en el bucket, respetando el mismo permiso que
 * gobierna la obligación/cliente al que pertenece. */
export async function descargarDocumentoHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  const db = getPool();
  const { rows } = await db.query(
    `SELECT d.*, c.responsable_id, e.coordinador_id AS responsable_coordinador_id
     FROM documentos d
     JOIN clientes c ON c.id = d.cliente_id
     LEFT JOIN employees e ON e.id = c.responsable_id
     WHERE d.id = $1`,
    [id]
  );
  const documento = rows[0];
  if (!documento) {
    res.status(404).json({ error: "Documento no encontrado." });
    return;
  }
  if (!puedeGestionar(req.employee, documento.responsable_id, documento.responsable_coordinador_id)) {
    res.status(403).json({ error: "No tienes permisos para ver este documento." });
    return;
  }

  const url = await urlDescarga(documento.storage_key, documento.nombre_archivo);
  res.json({ url });
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
