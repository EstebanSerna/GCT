// Calendario tributario colombiano 2026 — fechas de referencia recopiladas
// de fuentes públicas especializadas (actualicese.com, rankia.co,
// romerocontador.com, entre otras que citan las resoluciones/decretos de
// plazos de la DIAN). Varias obligaciones se pagan en un RANGO de fechas
// que depende de los dos últimos dígitos del NIT/cédula — se muestra ese
// rango completo en vez de inventar un día exacto por dígito, para no dar
// una falsa precisión. Antes de radicar, confirma siempre el día exacto
// de tu NIT en el calendario oficial de la DIAN (dian.gov.co) o con la
// resolución de plazos vigente — esta página es una guía de referencia,
// no un documento legal.

export type CategoriaTributaria =
  | "iva"
  | "retencion"
  | "simple"
  | "renta"
  | "exogena"
  | "patrimonio";

export interface EventoTributario {
  id: string;
  categoria: CategoriaTributaria;
  titulo: string;
  /** ISO yyyy-mm-dd — inicio del rango (o fecha única si no hay rango). */
  desde: string;
  /** ISO yyyy-mm-dd — fin del rango. Igual a "desde" si es un solo día. */
  hasta: string;
  aplicaA: string;
  descripcion: string;
  fundamento: string;
}

export const CATEGORIA_INFO: Record<CategoriaTributaria, { label: string; abrev: string }> = {
  iva: { label: "IVA", abrev: "IVA" },
  retencion: { label: "Retención en la fuente", abrev: "RteFte" },
  simple: { label: "Régimen simple", abrev: "Simple" },
  renta: { label: "Declaración de renta", abrev: "Renta" },
  exogena: { label: "Información exógena", abrev: "Exógena" },
  patrimonio: { label: "Impuesto al patrimonio", abrev: "Patrimonio" },
};

export const CALENDARIO_2026: EventoTributario[] = [
  // ---- Retención en la fuente (mensual, formulario 350) ----
  ...[
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ].map((mes, i) => {
    const mesVencimiento = ((i + 1) % 12) + 1; // el mes siguiente al periodo (envuelve dic → ene)
    const anoVencimiento = mesVencimiento === 1 ? 2027 : 2026;
    const mm = String(mesVencimiento).padStart(2, "0");
    return {
      id: `rtefte-${i + 1}`,
      categoria: "retencion" as const,
      titulo: `Retención en la fuente — ${mes[0].toUpperCase()}${mes.slice(1)}`,
      desde: `${anoVencimiento}-${mm}-09`,
      hasta: `${anoVencimiento}-${mm}-22`,
      aplicaA: "Todos los agentes retenedores (formulario 350)",
      descripcion:
        "Se declara y paga incluso si en el mes no hubo retenciones. Vence en los primeros días hábiles del mes siguiente, según el último dígito del NIT (sin el dígito de verificación).",
      fundamento: "Art. 606 Estatuto Tributario · calendario de plazos DIAN 2026",
    };
  }),

  // ---- IVA bimestral (grandes contribuyentes y responsables régimen ordinario) ----
  { id: "iva-b1", categoria: "iva", titulo: "IVA bimestral — Enero/Febrero", desde: "2026-03-10", hasta: "2026-03-24",
    aplicaA: "Responsables de IVA con periodo bimestral", descripcion: "Declaración y pago del bimestre enero–febrero 2026.", fundamento: "Art. 600 E.T. · Decreto de plazos 2026" },
  { id: "iva-b2", categoria: "iva", titulo: "IVA bimestral — Marzo/Abril", desde: "2026-05-12", hasta: "2026-05-26",
    aplicaA: "Responsables de IVA con periodo bimestral", descripcion: "Declaración y pago del bimestre marzo–abril 2026.", fundamento: "Art. 600 E.T. · Decreto de plazos 2026" },
  { id: "iva-b3", categoria: "iva", titulo: "IVA bimestral — Mayo/Junio", desde: "2026-07-09", hasta: "2026-07-23",
    aplicaA: "Responsables de IVA con periodo bimestral", descripcion: "Declaración y pago del bimestre mayo–junio 2026.", fundamento: "Art. 600 E.T. · Decreto de plazos 2026" },
  { id: "iva-b4", categoria: "iva", titulo: "IVA bimestral — Julio/Agosto", desde: "2026-09-09", hasta: "2026-09-22",
    aplicaA: "Responsables de IVA con periodo bimestral", descripcion: "Declaración y pago del bimestre julio–agosto 2026.", fundamento: "Art. 600 E.T. · Decreto de plazos 2026" },
  { id: "iva-b5", categoria: "iva", titulo: "IVA bimestral — Septiembre/Octubre", desde: "2026-11-11", hasta: "2026-11-25",
    aplicaA: "Responsables de IVA con periodo bimestral", descripcion: "Declaración y pago del bimestre septiembre–octubre 2026.", fundamento: "Art. 600 E.T. · Decreto de plazos 2026" },
  { id: "iva-b6", categoria: "iva", titulo: "IVA bimestral — Noviembre/Diciembre", desde: "2027-01-13", hasta: "2027-01-26",
    aplicaA: "Responsables de IVA con periodo bimestral", descripcion: "Declaración y pago del bimestre noviembre–diciembre 2026.", fundamento: "Art. 600 E.T. · Decreto de plazos 2026" },

  // ---- IVA cuatrimestral ----
  { id: "iva-c1", categoria: "iva", titulo: "IVA cuatrimestral — Enero a Abril", desde: "2026-05-12", hasta: "2026-05-26",
    aplicaA: "Responsables de IVA con periodo cuatrimestral", descripcion: "Declaración y pago del cuatrimestre enero–abril 2026.", fundamento: "Art. 600 E.T. · Decreto de plazos 2026" },
  { id: "iva-c2", categoria: "iva", titulo: "IVA cuatrimestral — Mayo a Agosto", desde: "2026-09-09", hasta: "2026-09-22",
    aplicaA: "Responsables de IVA con periodo cuatrimestral", descripcion: "Declaración y pago del cuatrimestre mayo–agosto 2026.", fundamento: "Art. 600 E.T. · Decreto de plazos 2026" },
  { id: "iva-c3", categoria: "iva", titulo: "IVA cuatrimestral — Septiembre a Diciembre", desde: "2027-01-13", hasta: "2027-01-26",
    aplicaA: "Responsables de IVA con periodo cuatrimestral", descripcion: "Declaración y pago del cuatrimestre septiembre–diciembre 2026.", fundamento: "Art. 600 E.T. · Decreto de plazos 2026" },

  // ---- Régimen simple de tributación ----
  { id: "simple-anual", categoria: "simple", titulo: "Declaración anual consolidada — Régimen Simple", desde: "2026-04-20", hasta: "2026-04-24",
    aplicaA: "Contribuyentes del Régimen Simple de Tributación (año gravable 2025)", descripcion: "Declaración anual consolidada del SIMPLE; se descuentan los anticipos bimestrales ya pagados.", fundamento: "Ley 2277 de 2022 · Decreto de plazos 2026" },
  { id: "simple-b1", categoria: "simple", titulo: "Anticipo bimestral — Mayo", desde: "2026-05-01", hasta: "2026-05-15",
    aplicaA: "Régimen Simple de Tributación", descripcion: "Pago del anticipo bimestral mediante el recibo electrónico SIMPLE.", fundamento: "Ley 2277 de 2022 · Decreto de plazos 2026" },
  { id: "simple-b2", categoria: "simple", titulo: "Anticipo bimestral — Junio", desde: "2026-06-01", hasta: "2026-06-15",
    aplicaA: "Régimen Simple de Tributación", descripcion: "Pago del anticipo bimestral mediante el recibo electrónico SIMPLE.", fundamento: "Ley 2277 de 2022 · Decreto de plazos 2026" },
  { id: "simple-b3", categoria: "simple", titulo: "Anticipo bimestral — Julio", desde: "2026-07-01", hasta: "2026-07-15",
    aplicaA: "Régimen Simple de Tributación", descripcion: "Pago del anticipo bimestral mediante el recibo electrónico SIMPLE.", fundamento: "Ley 2277 de 2022 · Decreto de plazos 2026" },
  { id: "simple-b4", categoria: "simple", titulo: "Anticipo bimestral — Septiembre", desde: "2026-09-01", hasta: "2026-09-15",
    aplicaA: "Régimen Simple de Tributación", descripcion: "Pago del anticipo bimestral mediante el recibo electrónico SIMPLE.", fundamento: "Ley 2277 de 2022 · Decreto de plazos 2026" },
  { id: "simple-b5", categoria: "simple", titulo: "Anticipo bimestral — Noviembre", desde: "2026-11-01", hasta: "2026-11-15",
    aplicaA: "Régimen Simple de Tributación", descripcion: "Pago del anticipo bimestral mediante el recibo electrónico SIMPLE.", fundamento: "Ley 2277 de 2022 · Decreto de plazos 2026" },

  // ---- Declaración de renta ----
  { id: "renta-pn-1", categoria: "renta", titulo: "Renta personas naturales — cédulas terminadas en 01 a 20", desde: "2026-08-12", hasta: "2026-08-26",
    aplicaA: "Personas naturales (año gravable 2025)", descripcion: "Declaración y pago del impuesto de renta.", fundamento: "Decreto de plazos 2026" },
  { id: "renta-pn-2", categoria: "renta", titulo: "Renta personas naturales — cédulas terminadas en 21 a 66", desde: "2026-09-01", hasta: "2026-09-28",
    aplicaA: "Personas naturales (año gravable 2025)", descripcion: "Declaración y pago del impuesto de renta.", fundamento: "Decreto de plazos 2026" },
  { id: "renta-pn-3", categoria: "renta", titulo: "Renta personas naturales — cédulas terminadas en 67 a 00", desde: "2026-10-01", hasta: "2026-10-26",
    aplicaA: "Personas naturales (año gravable 2025)", descripcion: "Declaración y pago del impuesto de renta.", fundamento: "Decreto de plazos 2026" },
  { id: "renta-pj-1", categoria: "renta", titulo: "Renta personas jurídicas — declaración y primera cuota", desde: "2026-05-12", hasta: "2026-05-26",
    aplicaA: "Personas jurídicas (año gravable 2025)", descripcion: "Declaración de renta y pago de la primera cuota.", fundamento: "Decreto de plazos 2026" },
  { id: "renta-pj-2", categoria: "renta", titulo: "Renta personas jurídicas — segunda cuota", desde: "2026-07-09", hasta: "2026-07-23",
    aplicaA: "Personas jurídicas (año gravable 2025)", descripcion: "Pago de la segunda cuota del impuesto de renta.", fundamento: "Decreto de plazos 2026" },
  { id: "renta-gc-1", categoria: "renta", titulo: "Grandes contribuyentes — primera cuota (anticipo)", desde: "2026-02-10", hasta: "2026-02-23",
    aplicaA: "Grandes contribuyentes", descripcion: "Pago del anticipo de la primera cuota del impuesto de renta.", fundamento: "Decreto de plazos 2026" },
  { id: "renta-gc-2", categoria: "renta", titulo: "Grandes contribuyentes — declaración y segunda cuota", desde: "2026-04-13", hasta: "2026-04-27",
    aplicaA: "Grandes contribuyentes", descripcion: "Declaración de renta y pago de la segunda cuota.", fundamento: "Decreto de plazos 2026" },
  { id: "renta-gc-3", categoria: "renta", titulo: "Grandes contribuyentes — tercera cuota", desde: "2026-06-10", hasta: "2026-06-24",
    aplicaA: "Grandes contribuyentes", descripcion: "Pago de la tercera y última cuota del impuesto de renta.", fundamento: "Decreto de plazos 2026" },

  // ---- Información exógena ----
  { id: "exogena-gc", categoria: "exogena", titulo: "Información exógena — grandes contribuyentes", desde: "2026-04-28", hasta: "2026-05-19",
    aplicaA: "Grandes contribuyentes", descripcion: "Reporte de información exógena del año gravable 2025 (plazo ampliado por la Resolución 000012 de 2026 para NIT terminados en 1, 2 y 3).", fundamento: "Resolución de exógena DIAN 2026" },
  { id: "exogena-pj", categoria: "exogena", titulo: "Información exógena — personas jurídicas y naturales", desde: "2026-05-14", hasta: "2026-06-12",
    aplicaA: "Personas jurídicas y naturales obligadas", descripcion: "Reporte de información exógena del año gravable 2025.", fundamento: "Resolución de exógena DIAN 2026" },

  // ---- Patrimonio ----
  { id: "patrimonio-1", categoria: "patrimonio", titulo: "Impuesto al patrimonio — primera cuota", desde: "2026-05-12", hasta: "2026-05-26",
    aplicaA: "Personas naturales obligadas al impuesto al patrimonio", descripcion: "Declaración y pago de la primera cuota.", fundamento: "Ley 2277 de 2022 · Decreto de plazos 2026" },
  { id: "patrimonio-2", categoria: "patrimonio", titulo: "Impuesto al patrimonio — segunda cuota", desde: "2026-09-14", hasta: "2026-09-14",
    aplicaA: "Personas naturales obligadas al impuesto al patrimonio", descripcion: "Pago de la segunda cuota.", fundamento: "Ley 2277 de 2022 · Decreto de plazos 2026" },
];
