// Postgres connection + schema migration. Plain JS — see chatHandler.mjs
// for why (runs unmodified on any Node host, no build step).
import pg from "pg";

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

// Cada sentencia se ejecuta por separado y se ignora si ya no aplica (por
// ejemplo, renombrar una columna que ya fue renombrada en un despliegue
// anterior) — así esta migración es segura de correr en cada arranque,
// tanto en una base de datos nueva como en una que ya tiene datos reales.
const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol TEXT,
    iniciales TEXT NOT NULL,
    documento TEXT,
    telefono TEXT,
    foto_base64 TEXT,
    activo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  // --- migración desde el esquema anterior (login con "usuario", roles
  // limitados a admin/contador/auxiliar, sin foto/documento/teléfono) ---
  `ALTER TABLE employees RENAME COLUMN usuario TO email`,
  `ALTER TABLE employees ADD COLUMN IF NOT EXISTS documento TEXT`,
  `ALTER TABLE employees ADD COLUMN IF NOT EXISTS telefono TEXT`,
  `ALTER TABLE employees ADD COLUMN IF NOT EXISTS foto_base64 TEXT`,
  `ALTER TABLE employees ALTER COLUMN rol DROP NOT NULL`,
  `ALTER TABLE employees ALTER COLUMN activo SET DEFAULT false`,
  `ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_rol_check`,
  `UPDATE employees SET rol = 'gerente' WHERE rol = 'admin'`,
  `ALTER TABLE employees ADD CONSTRAINT employees_rol_check CHECK (rol IN ('super_admin','gerente','contador','auxiliar'))`,
  // --- resto de las tablas ---
  `CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada','salida')),
    registrado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    precision_metros DOUBLE PRECISION,
    distancia_oficina_metros DOUBLE PRECISION NOT NULL,
    dentro_de_rango BOOLEAN NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_attendance_employee_time
    ON attendance_records (employee_id, registrado_en DESC)`,
];

export async function migrate({ logger = console } = {}) {
  const db = getPool();
  for (const statement of MIGRATIONS) {
    try {
      await db.query(statement);
    } catch (err) {
      // Esperado cuando el paso ya no aplica (columna ya renombrada,
      // restricción que ya no existe, etc.) — se sigue con el resto.
      logger.log?.(`[db] Paso de migración omitido (${String(err.message).slice(0, 80)})`);
    }
  }
}
