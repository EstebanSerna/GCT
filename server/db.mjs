// Postgres connection + schema migration. Plain JS — see chatHandler.mjs
// for why (runs unmodified on any Node host, no build step).
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL no está configurada.");
    }
    pool = new Pool({
      connectionString,
      // Railway's internal Postgres doesn't need/support SSL; only require
      // it when connecting to an external host (e.g. local dev via the
      // public proxy URL, which does use SSL).
      ssl: connectionString.includes("railway.internal") ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  usuario TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin','contador','auxiliar')),
  iniciales TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada','salida')),
  registrado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  precision_metros DOUBLE PRECISION,
  distancia_oficina_metros DOUBLE PRECISION NOT NULL,
  dentro_de_rango BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_time
  ON attendance_records (employee_id, registrado_en DESC);
`;

// The 6 demo accounts that used to be hardcoded in src/data/seed.ts — kept
// as the initial dataset so the portal isn't empty after migrating to a
// real database. Same demo password as before; change it from the admin
// panel once real employees are loaded.
const SEED_EMPLOYEES = [
  { nombre: "Yesica Zuluaga", usuario: "yesica.zuluaga", rol: "admin", iniciales: "YZ" },
  { nombre: "Camilo Ruiz", usuario: "camilo.ruiz", rol: "contador", iniciales: "CR" },
  { nombre: "Valentina Gómez", usuario: "valentina.gomez", rol: "contador", iniciales: "VG" },
  { nombre: "Laura Cifuentes", usuario: "laura.cifuentes", rol: "contador", iniciales: "LC" },
  { nombre: "Andrés Salazar", usuario: "andres.salazar", rol: "auxiliar", iniciales: "AS" },
  { nombre: "Sebastián Morales", usuario: "sebastian.morales", rol: "auxiliar", iniciales: "SM" },
];
const SEED_PASSWORD = "Contable2026";

export async function migrate({ logger = console } = {}) {
  const db = getPool();
  await db.query(SCHEMA);

  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM employees");
  if (rows[0].count === 0) {
    logger.log?.("[db] Tabla employees vacía — cargando cuentas iniciales.");
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    for (const emp of SEED_EMPLOYEES) {
      await db.query(
        `INSERT INTO employees (nombre, usuario, password_hash, rol, iniciales)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (usuario) DO NOTHING`,
        [emp.nombre, emp.usuario, passwordHash, emp.rol, emp.iniciales]
      );
    }
  }
}
