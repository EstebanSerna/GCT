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

export interface Documento {
  id: string;
  clienteId: string;
  obligacionId: string | null;
  nombreArchivo: string;
  tipoMime: string | null;
  tamanoBytes: number | null;
  subidoPor: string | null;
  subidoEn: string; // ISO datetime
}

export interface Obligacion {
  id: string;
  tipo: string; // ej. "Retención en la fuente", "Planilla de seguridad social"
  obligacion: string; // descripción completa, ej. "Retención en la fuente | Marzo de 2026 | Decreto 2229..."
  vencimiento: string; // fecha ISO yyyy-mm-dd
  estado: EstadoObligacion;
  documentos: Documento[]; // el soporte que respalda un estado presentado/pagado
}

export type TipoPersona = "natural" | "juridica";
export type EstadoCartera = "al_dia" | "en_mora";

export interface ContactoCliente {
  nombre: string;
  telefono: string;
  correo: string;
  fechaNacimiento: string; // ISO yyyy-mm-dd — el año es referencial, se usa día y mes
}

export interface Cliente {
  id: string;
  nombre: string;
  nit: string;
  tipoPersona: TipoPersona;
  regimen: string; // ej. "Régimen ordinario", "Régimen Simple", "Gran Contribuyente"
  ciudad: string;
  contacto: ContactoCliente;
  clienteDesde: string; // ISO yyyy-mm-dd — aniversario como cliente de GCT
  responsableId: string | null; // id del empleado que digita la info del cliente (normalmente auxiliar)
  revisorId: string | null; // id del empleado que revisa esa info (normalmente contador)
  honorariosMensuales: number; // COP
  estadoCartera: EstadoCartera;
  notas: string; // preferencias y detalles personales, para un trato cercano
  obligaciones: Obligacion[];
}

// Los datos de ejemplo (clientes y usuarios ficticios) se eliminaron — el
// portal ahora usa cuentas y datos reales. Estos arreglos se dejan vacíos
// (en vez de borrar el tipo/las páginas que los usan) para que las pantallas
// sigan funcionando normalmente, mostrando su estado vacío.
export const usuarios: Usuario[] = [];
export const clientesSeed: Cliente[] = [];
