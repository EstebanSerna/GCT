import type { Rol } from "../lib/api";
export type { Rol };

export interface Usuario {
  id: string; // = email (ver abajo) — clave usada para asignar tareas/clientes
  dbId?: number; // id real en la base de datos, solo presente tras iniciar sesión
  nombre: string;
  rol: Rol;
  iniciales: string;
  usuario: string; // correo con el que inicia sesión
  fotoBase64?: string | null;
}

export type EstadoObligacion = "pendiente" | "presentado" | "pagado";

export interface Obligacion {
  id: string;
  tipo: string; // ej. "Retención en la fuente", "Planilla de seguridad social"
  obligacion: string; // descripción completa, ej. "Retención en la fuente | Marzo de 2026 | Decreto 2229..."
  vencimiento: string; // fecha ISO yyyy-mm-dd
  estado: EstadoObligacion;
}

export interface Cliente {
  id: string;
  nombre: string;
  obligaciones: Obligacion[];
}

export interface Tarea {
  id: string;
  clienteId: string;
  contadorId: string;
  titulo: string;
  fechaLimite: string;
  estado: "pendiente" | "en_progreso" | "completada";
  evidenciaNombre?: string;
  evidenciaUrl?: string;
  completadaHora?: string;
}

// Los datos de ejemplo (clientes, tareas y usuarios ficticios) se
// eliminaron — el portal ahora usa cuentas y datos reales. Estos arreglos
// se dejan vacíos (en vez de borrar el tipo/las páginas que los usan) para
// que "Clientes" y los paneles de tareas sigan funcionando normalmente,
// mostrando su estado vacío, hasta que se conecten a datos reales.
export const usuarios: Usuario[] = [];
export const clientesSeed: Cliente[] = [];
export const tareasSeed: Tarea[] = [];
