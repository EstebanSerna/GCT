import {
  Landmark,
  ShieldCheck,
  Users,
  Fingerprint,
  Receipt,
  Calculator,
  ClipboardCheck,
  Coins,
  Building2,
  FileText,
  FileCheck,
  Building,
} from "lucide-react";
import type { EstadoObligacion } from "../data/seed";

// El tipo de obligación viene como texto libre del calendario tributario
// (más de 50 variantes distintas entre retención, nómina, ICA por
// municipio, etc.) — en vez de mapear cada una, se empareja por palabra
// clave para cubrir variantes sin mantenimiento constante.
const REGLAS_ICONO: [RegExp, typeof Receipt][] = [
  [/retenci[oó]n/i, Landmark],
  [/planilla|seguridad social/i, ShieldCheck],
  [/n[oó]mina/i, Users],
  [/rub|beneficiarios finales/i, Fingerprint],
  [/iva|consumo/i, Receipt],
  [/renta/i, Calculator],
  [/ex[oó]gena/i, ClipboardCheck],
  [/patrimonio/i, Coins],
  [/ica\b|\|.*-/i, Building2],
  [/registro mercantil|rup/i, FileText],
  [/conciliaci[oó]n/i, FileCheck],
  [/supersociedades/i, Building],
];

export function iconoObligacion(tipo: string) {
  const regla = REGLAS_ICONO.find(([re]) => re.test(tipo));
  return regla ? regla[1] : FileText;
}

export const ESTADO_INFO: Record<EstadoObligacion, { label: string; ring: string; dot: string; text: string }> = {
  pendiente: { label: "Pendiente", ring: "border-ash-light", dot: "bg-ash-light", text: "text-ash" },
  presentado: { label: "Presentado", ring: "border-magenta", dot: "bg-magenta", text: "text-magenta-deep" },
  pagado: { label: "Pagado", ring: "border-folio-green", dot: "bg-folio-green", text: "text-folio-green" },
};

const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export function formatoFechaCorta(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES_CORTOS[m - 1]} ${y}`;
}

export function diasEntreFechas(hoy: Date, iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const objetivo = new Date(y, m - 1, d);
  const ms = objetivo.getTime() - new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  return Math.round(ms / 86_400_000);
}

export function etiquetaTiempo(dias: number) {
  if (dias < 0) return "Vencido";
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `En ${dias} días`;
}
