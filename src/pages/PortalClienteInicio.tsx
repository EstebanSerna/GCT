import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  Download,
  FileText,
  LogOut,
  Mail,
  Phone,
  Pencil,
  Check,
  X,
  FileDown,
  Clock,
} from "lucide-react";
import { usePortalCliente } from "../context/PortalClienteContext";
import logo from "../assets/logo-mark.png";
import { RingMark } from "../components/Stamp";
import type { Obligacion } from "../data/seed";
import { iconoObligacion, ESTADO_INFO, formatoFechaCorta, diasEntreFechas, etiquetaTiempo } from "../lib/obligaciones";
import { aniosDesde } from "../lib/relacion";
import { descargarCsvGenerico } from "../lib/csv";

const MESES_LARGOS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Documentos de ejemplo, solo para mostrar cómo se vería esta sección —
// se reemplaza cuando conectemos almacenamiento real de archivos.
const DOCUMENTOS_DEMO = [
  { nombre: "Certificado de retención en la fuente — Agosto 2026.pdf", fecha: "2026-09-09" },
  { nombre: "Declaración de renta — Año gravable 2025.pdf", fecha: "2026-06-09" },
];

export default function PortalClienteInicio() {
  const { clienteActual, cerrarSesion, actualizarContacto } = usePortalCliente();
  const navigate = useNavigate();
  const hoy = useMemo(() => new Date(), []);

  const [editandoContacto, setEditandoContacto] = useState(false);
  const [telefono, setTelefono] = useState(clienteActual?.contacto.telefono ?? "");
  const [correo, setCorreo] = useState(clienteActual?.contacto.correo ?? "");
  const [avisoDocumento, setAvisoDocumento] = useState<string | null>(null);

  if (!clienteActual) {
    navigate("/portal-clientes");
    return null;
  }

  const c = clienteActual;
  const aniosCliente = aniosDesde(c.clienteDesde, hoy);

  const pendientes = c.obligaciones.filter((o) => o.estado === "pendiente");
  const proxima = [...pendientes].sort((a, b) => a.vencimiento.localeCompare(b.vencimiento))[0] ?? null;

  const porMes = useMemo(() => {
    const grupos = new Map<string, Obligacion[]>();
    for (const o of c.obligaciones) {
      const clave = o.vencimiento.slice(0, 7);
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave)!.push(o);
    }
    for (const lista of grupos.values()) lista.sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));
    return Array.from(grupos.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [c]);

  function descargarCalendario() {
    descargarCsvGenerico(
      ["Tipo de obligación", "Detalle", "Vencimiento", "Estado"],
      c.obligaciones.map((o) => [o.tipo, o.obligacion, o.vencimiento, ESTADO_INFO[o.estado].label]),
      `Obligaciones - ${c.nombre}.csv`
    );
  }

  function guardarContacto() {
    actualizarContacto({ telefono, correo });
    setEditandoContacto(false);
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Encabezado */}
      <header className="border-b border-ink/10 bg-ink px-5 py-4 text-paper sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="GCT" className="h-8 w-8 object-contain" />
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold text-white">Gerencia Contable &amp; Tributaria</p>
              <p className="-mt-0.5 flex items-center gap-1 text-[11px] text-paper/50">
                <RingMark size={9} /> Portal de clientes
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cerrarSesion();
              navigate("/portal-clientes");
            }}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-paper/60 transition-colors hover:bg-ink-faint hover:text-white"
          >
            <LogOut size={13} /> Salir
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ash">
          Cliente desde {formatoFechaCorta(c.clienteDesde)} · {aniosCliente} año{aniosCliente === 1 ? "" : "s"} con nosotros
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Hola, {c.nombre}</h1>
        <p className="mt-2 max-w-xl text-sm text-ash">
          {c.nit} · {c.regimen} · {c.ciudad}
        </p>

        {proxima && (
          <div className="relative mt-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 text-paper sm:px-8">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-magenta opacity-25 blur-[90px]" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-magenta/20 text-magenta-soft">
                  <CalendarClock size={20} />
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-magenta-soft">Tu próximo vencimiento</p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-white sm:text-xl">{proxima.tipo}</h3>
                  <p className="mt-1 text-sm text-paper/55">Nosotros nos encargamos — solo te avisamos.</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4 border-t border-paper/10 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
                <div>
                  <p className="font-display text-2xl font-semibold text-white">{formatoFechaCorta(proxima.vencimiento)}</p>
                  <p className="mt-0.5 text-xs font-medium text-magenta-soft">{etiquetaTiempo(diasEntreFechas(hoy, proxima.vencimiento))}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Datos de contacto */}
        <div className="mt-6 rounded-lg border border-ink/10 bg-white/60 p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Tus datos de contacto</p>
            {!editandoContacto && (
              <button
                onClick={() => setEditandoContacto(true)}
                className="flex items-center gap-1 text-xs text-magenta-deep hover:text-magenta"
              >
                <Pencil size={12} /> Editar
              </button>
            )}
          </div>

          {editandoContacto ? (
            <div className="mt-3 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2">
                <Phone size={14} className="shrink-0 text-ash-light" />
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-transparent text-sm text-ink focus:outline-none"
                  placeholder="Teléfono"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2">
                <Mail size={14} className="shrink-0 text-ash-light" />
                <input
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full bg-transparent text-sm text-ink focus:outline-none"
                  placeholder="Correo"
                />
              </div>
              <div className="mt-1 flex gap-2">
                <button
                  onClick={guardarContacto}
                  className="flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-xs font-medium text-white hover:bg-magenta"
                >
                  <Check size={13} /> Guardar
                </button>
                <button
                  onClick={() => {
                    setTelefono(c.contacto.telefono);
                    setCorreo(c.contacto.correo);
                    setEditandoContacto(false);
                  }}
                  className="flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium text-ash hover:bg-ink/5"
                >
                  <X size={13} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-1">
              <p className="flex items-center gap-1.5 text-sm text-ink">
                <Phone size={13} className="text-ash-light" /> {c.contacto.telefono}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-ink">
                <Mail size={13} className="text-ash-light" /> {c.contacto.correo}
              </p>
            </div>
          )}
        </div>

        {/* Documentos */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Tus documentos</h2>
            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ash">Vista previa</span>
          </div>
          <p className="mt-1 text-sm text-ash">Certificados y declaraciones que hemos presentado por ti.</p>
          <div className="mt-3 flex flex-col gap-2">
            {DOCUMENTOS_DEMO.map((d) => (
              <div key={d.nombre} className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white/60 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <FileText size={16} className="shrink-0 text-magenta-deep" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{d.nombre}</p>
                    <p className="text-xs text-ash">{formatoFechaCorta(d.fecha)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAvisoDocumento(d.nombre)}
                  className="flex shrink-0 items-center gap-1.5 rounded-md bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/10"
                >
                  <Download size={13} /> Descargar
                </button>
              </div>
            ))}
          </div>
          {avisoDocumento && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ash">
              <Clock size={12} /> La descarga de "{avisoDocumento}" estará disponible muy pronto.
            </p>
          )}
        </div>

        {/* Calendario de obligaciones */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Tu calendario de obligaciones</h2>
          <button
            onClick={descargarCalendario}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-ink/10 bg-white/60 px-3 py-1.5 text-xs font-medium text-ink hover:border-magenta/40"
          >
            <FileDown size={13} /> Descargar
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-8">
          {porMes.map(([clave, obligaciones]) => {
            const [y, m] = clave.split("-").map(Number);
            return (
              <div key={clave}>
                <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-ash">
                  {MESES_LARGOS[m - 1]} {y}
                </p>
                <div className="flex flex-col gap-2.5">
                  {obligaciones.map((o) => {
                    const Icono = iconoObligacion(o.tipo);
                    const estado = ESTADO_INFO[o.estado];
                    return (
                      <div key={o.id} className="flex items-start gap-3 rounded-xl border border-ink/10 bg-white/60 p-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-magenta/10 text-magenta-deep">
                          <Icono size={16} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                            <h3 className="font-display text-[15px] font-semibold text-ink">{o.tipo}</h3>
                            <span
                              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] ${estado.ring} bg-white/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${estado.text}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${estado.dot}`} /> {estado.label}
                            </span>
                          </div>
                          <p className="mt-0.5 font-mono text-xs font-medium text-magenta-deep">{formatoFechaCorta(o.vencimiento)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
