import type { ApiTarea, EstadoTarea, PrioridadTarea } from "./api";

export const ESTADO_TAREA_LABEL: Record<EstadoTarea, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
  cancelada: "Cancelada",
};

export const PRIORIDAD_INFO: Record<PrioridadTarea, { label: string; chip: string }> = {
  urgente: { label: "Urgente", chip: "border-folio-red/40 bg-folio-red/10 text-folio-red" },
  alta: { label: "Alta", chip: "border-folio-amber/40 bg-folio-amber/10 text-folio-amber" },
  normal: { label: "Normal", chip: "border-ink/15 bg-ink/5 text-ash" },
  baja: { label: "Baja", chip: "border-ink/10 bg-transparent text-ash" },
};

/** Fecha de hoy como yyyy-mm-dd en hora local (no UTC), para compararla con las fechas límite. */
export function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function estaAbierta(t: ApiTarea): boolean {
  return t.estado === "pendiente" || t.estado === "en_progreso";
}

export function estaVencida(t: ApiTarea, hoy: string): boolean {
  return estaAbierta(t) && t.fechaLimite !== "" && t.fechaLimite < hoy;
}
