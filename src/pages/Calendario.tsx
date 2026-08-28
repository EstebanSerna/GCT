import { useMemo, useState } from "react";
import {
  Receipt,
  Landmark,
  FileText,
  Calculator,
  ClipboardCheck,
  Coins,
  CalendarClock,
  AlertCircle,
  ShieldAlert,
  ChevronDown,
  History,
} from "lucide-react";
import { RingMark } from "../components/Stamp";
import {
  CALENDARIO_2026,
  CATEGORIA_INFO,
  type CategoriaTributaria,
  type EventoTributario,
} from "../data/calendarioTributario";

const ICONO: Record<CategoriaTributaria, typeof Receipt> = {
  iva: Receipt,
  retencion: Landmark,
  simple: FileText,
  renta: Calculator,
  exogena: ClipboardCheck,
  patrimonio: Coins,
};

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatoFecha(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MESES[m - 1].toLowerCase()}${y !== new Date().getFullYear() ? ` de ${y}` : ""}`;
}

function rangoLegible(ev: EventoTributario) {
  if (ev.desde === ev.hasta) return formatoFecha(ev.desde);
  const [, mDesde, dDesde] = ev.desde.split("-").map(Number);
  const [, mHasta] = ev.hasta.split("-").map(Number);
  if (mDesde === mHasta) {
    const dHasta = Number(ev.hasta.split("-")[2]);
    return `${dDesde} al ${dHasta} de ${MESES[mDesde - 1].toLowerCase()}`;
  }
  return `${formatoFecha(ev.desde)} al ${formatoFecha(ev.hasta)}`;
}

function diasEntre(a: Date, b: Date) {
  const ms = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime() -
    new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  return Math.round(ms / 86_400_000);
}

export default function Calendario() {
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaTributaria | "todas">("todas");

  const hoy = useMemo(() => new Date(), []);

  const eventosOrdenados = useMemo(
    () => [...CALENDARIO_2026].sort((a, b) => a.desde.localeCompare(b.desde)),
    []
  );

  const proximo = useMemo(() => {
    return eventosOrdenados.find((ev) => new Date(`${ev.hasta}T23:59:59`) >= hoy) ?? null;
  }, [eventosOrdenados, hoy]);

  const visibles = useMemo(
    () => (categoriaActiva === "todas" ? eventosOrdenados : eventosOrdenados.filter((e) => e.categoria === categoriaActiva)),
    [eventosOrdenados, categoriaActiva]
  );

  const porMes = useMemo(() => {
    const grupos = new Map<string, EventoTributario[]>();
    for (const ev of visibles) {
      const clave = ev.desde.slice(0, 7); // yyyy-mm
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave)!.push(ev);
    }
    return Array.from(grupos.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [visibles]);

  const claveMesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;

  // El mes de hoy queda primero en la página (sin scroll de por medio) —
  // los meses ya pasados se guardan aparte, colapsados más abajo.
  const mesesDesdeHoy = useMemo(() => porMes.filter(([clave]) => clave >= claveMesActual), [porMes, claveMesActual]);
  const mesesAnteriores = useMemo(() => porMes.filter(([clave]) => clave < claveMesActual), [porMes, claveMesActual]);
  const [verAnteriores, setVerAnteriores] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-magenta-deep">
        <RingMark size={11} /> Todo el equipo, la misma información
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Calendario contable 2026</h1>
      <p className="mt-2 max-w-xl text-sm text-ash">
        Las fechas de cumplimiento tributario del año, con el fundamento legal de cada una, para que todo el
        equipo sepa qué se vence y cuándo.
      </p>

      {/* Próximo vencimiento — hero */}
      {proximo && <ProximoVencimiento evento={proximo} hoy={hoy} />}

      {/* Filtros por categoría */}
      <div className="mt-8 flex flex-wrap gap-2">
        <FiltroChip activo={categoriaActiva === "todas"} onClick={() => setCategoriaActiva("todas")}>
          Todas
        </FiltroChip>
        {(Object.keys(CATEGORIA_INFO) as CategoriaTributaria[]).map((cat) => (
          <FiltroChip key={cat} activo={categoriaActiva === cat} onClick={() => setCategoriaActiva(cat)}>
            {CATEGORIA_INFO[cat].label}
          </FiltroChip>
        ))}
      </div>

      {/* Línea de tiempo — desde el mes actual en adelante, sin scroll */}
      <div className="relative mt-10">
        <div className="pointer-events-none absolute bottom-4 left-[15px] top-4 w-px bg-ash-light/30 sm:left-[19px]" />

        <div className="flex flex-col gap-10">
          {mesesDesdeHoy.map(([clave, eventos]) => (
            <SeccionMes key={clave} clave={clave} eventos={eventos} hoy={hoy} esMesActual={clave === claveMesActual} />
          ))}

          {mesesDesdeHoy.length === 0 && (
            <p className="rounded-lg border border-dashed border-ash-light px-5 py-8 text-center text-sm text-ash">
              No hay vencimientos próximos en esta categoría.
            </p>
          )}
        </div>
      </div>

      {/* Meses ya pasados — colapsados, para no estorbar */}
      {mesesAnteriores.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setVerAnteriores((v) => !v)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-ash-light/25 bg-white/40 px-4 py-3 text-left transition-colors hover:bg-white/60"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-ash">
              <History size={15} />
              Meses anteriores ({mesesAnteriores.reduce((n, [, evs]) => n + evs.length, 0)} vencimientos ya pasados)
            </span>
            <ChevronDown size={16} className={`text-ash transition-transform ${verAnteriores ? "rotate-180" : ""}`} />
          </button>

          {verAnteriores && (
            <div className="relative mt-6">
              <div className="pointer-events-none absolute bottom-4 left-[15px] top-4 w-px bg-ash-light/30 sm:left-[19px]" />
              <div className="flex flex-col gap-10">
                {mesesAnteriores.map(([clave, eventos]) => (
                  <SeccionMes key={clave} clave={clave} eventos={eventos} hoy={hoy} esMesActual={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-12 flex items-start gap-2.5 rounded-xl border border-folio-amber/25 bg-folio-amber/5 px-4 py-3.5 text-xs leading-relaxed text-ash">
        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-folio-amber" />
        <p>
          Estas fechas son una guía de referencia recopilada de fuentes públicas especializadas. Varios
          vencimientos dependen de los dos últimos dígitos del NIT o cédula de cada cliente — confirma siempre
          el día exacto en el calendario oficial de la DIAN antes de radicar.
        </p>
      </div>
    </div>
  );
}

function ProximoVencimiento({ evento, hoy }: { evento: EventoTributario; hoy: Date }) {
  const Icono = ICONO[evento.categoria];
  const inicio = new Date(`${evento.desde}T00:00:00`);
  const fin = new Date(`${evento.hasta}T00:00:00`);
  const yaEmpezo = inicio <= hoy;
  const dias = yaEmpezo ? diasEntre(hoy, fin) : diasEntre(hoy, inicio);

  let etiquetaTiempo: string;
  if (yaEmpezo) {
    etiquetaTiempo = dias <= 0 ? "Vence hoy" : dias === 1 ? "Vence mañana" : `Quedan ${dias} días`;
  } else {
    etiquetaTiempo = dias === 1 ? "Empieza mañana" : `Empieza en ${dias} días`;
  }

  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 text-paper sm:px-8">
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-magenta opacity-25 blur-[90px]" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-magenta-soft opacity-[0.12] blur-[80px]" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-magenta/20 text-magenta-soft">
            <Icono size={20} />
          </span>
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-magenta-soft">
              <AlertCircle size={11} /> Próximo vencimiento
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-white sm:text-xl">{evento.titulo}</h3>
            <p className="mt-1 text-sm text-paper/55">{evento.aplicaA}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t border-paper/10 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
          <div>
            <p className="font-display text-2xl font-semibold text-white">{rangoLegible(evento)}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-magenta-soft">
              <CalendarClock size={13} /> {etiquetaTiempo}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeccionMes({
  clave,
  eventos,
  hoy,
  esMesActual,
}: {
  clave: string;
  eventos: EventoTributario[];
  hoy: Date;
  esMesActual: boolean;
}) {
  const [y, m] = clave.split("-").map(Number);

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 -mx-1 mb-4 flex items-center gap-3 bg-paper/95 px-1 py-1.5 backdrop-blur">
        <span
          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-semibold text-white sm:h-10 sm:w-10 ${
            esMesActual ? "bg-magenta" : "bg-ink"
          }`}
        >
          {String(m).padStart(2, "0")}
        </span>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          {MESES[m - 1]} <span className="text-ash">{y}</span>
          {esMesActual && (
            <span className="rounded-full bg-magenta/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-magenta-deep">
              Este mes
            </span>
          )}
        </h2>
      </div>

      <div className="flex flex-col gap-3 pl-11 sm:pl-14">
        {eventos.map((ev) => (
          <EventoCard key={ev.id} evento={ev} hoy={hoy} />
        ))}
      </div>
    </div>
  );
}

function FiltroChip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        activo ? "bg-magenta text-white" : "bg-ash-light/15 text-ash hover:bg-ash-light/25"
      }`}
    >
      {children}
    </button>
  );
}

function EventoCard({ evento, hoy }: { evento: EventoTributario; hoy: Date }) {
  const Icono = ICONO[evento.categoria];
  const pasado = new Date(`${evento.hasta}T23:59:59`) < hoy;

  return (
    <div
      className={`relative rounded-xl border bg-white/60 p-4 transition-colors ${
        pasado ? "border-ink/5 opacity-55" : "border-ink/10 hover:border-magenta/30"
      }`}
    >
      <span className="absolute -left-[27px] top-5 hidden h-2 w-2 rounded-full bg-magenta ring-4 ring-paper sm:block" />
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-magenta/10 text-magenta-deep">
          <Icono size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-display text-[15px] font-semibold text-ink">{evento.titulo}</h3>
            <span className="rounded-full bg-ink/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ash">
              {CATEGORIA_INFO[evento.categoria].abrev}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-xs font-medium text-magenta-deep">{rangoLegible(evento)}</p>
          <p className="mt-1.5 text-xs text-ash">{evento.aplicaA}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{evento.descripcion}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-ash/70">{evento.fundamento}</p>
        </div>
      </div>
    </div>
  );
}
