// Helpers para la capa de relación con el cliente: fechas que se repiten
// cada año (cumpleaños, aniversario como cliente de GCT) y formato de
// honorarios en pesos colombianos.

/** Próxima ocurrencia (este año o el que sigue) del día/mes de una fecha ISO. */
export function proximaFechaAnual(iso: string, hoy: Date) {
  const [, m, d] = iso.split("-").map(Number);
  let objetivo = new Date(hoy.getFullYear(), m - 1, d);
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (objetivo < hoySinHora) objetivo = new Date(hoy.getFullYear() + 1, m - 1, d);
  const dias = Math.round((objetivo.getTime() - hoySinHora.getTime()) / 86_400_000);
  return { fecha: objetivo, dias };
}

export function aniosDesde(iso: string, hoy: Date) {
  const [y, m, d] = iso.split("-").map(Number);
  let anios = hoy.getFullYear() - y;
  const aunNoCumple = hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d);
  if (aunNoCumple) anios--;
  return anios;
}

const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export function diaMesCorto(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES_CORTOS[m - 1]}`;
}

export function formatoPesos(valor: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
}

export const CARTERA_INFO: Record<"al_dia" | "en_mora", { label: string; ring: string; dot: string; text: string }> = {
  al_dia: { label: "Cartera al día", ring: "border-folio-green", dot: "bg-folio-green", text: "text-folio-green" },
  en_mora: { label: "Cartera en mora", ring: "border-folio-red", dot: "bg-folio-red", text: "text-folio-red" },
};
