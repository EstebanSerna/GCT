import { getPool } from "./db.mjs";
import { notificarAsistencia } from "./whatsapp.mjs";

const EARTH_RADIUS_M = 6371000;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two lat/lng points, in meters. */
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

function getOfficeConfig() {
  const lat = Number(process.env.OFFICE_LAT);
  const lng = Number(process.env.OFFICE_LNG);
  const radius = Number(process.env.OFFICE_RADIUS_METERS) || 150;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, radius };
}

function isValidCoord(value) {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 180;
}

// La gerencia y el super admin no marcan entrada/salida — solo el equipo
// operativo (contadores y auxiliares).
const ROLES_QUE_MARCAN = ["contador", "auxiliar"];

/** POST /api/attendance/:tipo  (tipo = "entrada" | "salida") */
export function createMarkHandler(tipo) {
  return async function markHandler(req, res) {
    if (!ROLES_QUE_MARCAN.includes(req.employee.rol)) {
      res.status(403).json({ error: "Tu rol no requiere marcar entrada/salida." });
      return;
    }

    const office = getOfficeConfig();
    if (!office) {
      res.status(500).json({
        error: "La ubicación de la oficina no está configurada en el servidor (OFFICE_LAT / OFFICE_LNG).",
      });
      return;
    }

    const { lat, lng, precision } = req.body ?? {};
    if (!isValidCoord(lat) || !isValidCoord(lng)) {
      res.status(400).json({ error: "No se recibió una ubicación GPS válida." });
      return;
    }

    const distancia = distanceMeters(lat, lng, office.lat, office.lng);
    const dentroDeRango = distancia <= office.radius;

    const db = getPool();
    const { rows } = await db.query(
      `INSERT INTO attendance_records (employee_id, tipo, lat, lng, precision_metros, distancia_oficina_metros, dentro_de_rango)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, tipo, registrado_en, distancia_oficina_metros, dentro_de_rango`,
      [req.employee.id, tipo, lat, lng, precision ?? null, distancia, dentroDeRango]
    );

    res.json({ record: rows[0] });

    // Se envía después de responder al empleado — un problema notificando
    // a la gerente nunca debe demorar ni bloquear el registro de la marca.
    void notificarAsistencia({
      nombreEmpleado: req.employee.nombre,
      tipo,
      horaTexto: new Date(rows[0].registrado_en).toLocaleTimeString("es-CO", {
        hour: "numeric",
        minute: "2-digit",
      }),
      dentroDeRango,
    });
  };
}

/** GET /api/attendance/today — the current employee's records for today. */
export async function getTodayHandler(req, res) {
  const db = getPool();
  const { rows } = await db.query(
    `SELECT id, tipo, registrado_en, dentro_de_rango, distancia_oficina_metros
     FROM attendance_records
     WHERE employee_id = $1 AND registrado_en::date = now()::date
     ORDER BY registrado_en ASC`,
    [req.employee.id]
  );
  res.json({ records: rows });
}

/** GET /api/attendance — admin: recent records across all employees. */
export async function getAllHandler(req, res) {
  const limit = Math.min(Number(req.query.limit) || 200, 500);
  const db = getPool();
  const { rows } = await db.query(
    `SELECT a.id, a.tipo, a.registrado_en, a.dentro_de_rango, a.distancia_oficina_metros,
            e.id AS employee_id, e.nombre, e.iniciales, e.rol
     FROM attendance_records a
     JOIN employees e ON e.id = a.employee_id
     ORDER BY a.registrado_en DESC
     LIMIT $1`,
    [limit]
  );
  res.json({ records: rows });
}
