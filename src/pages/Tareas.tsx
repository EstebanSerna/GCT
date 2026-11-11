import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Loader2, Plus, Search } from "lucide-react";
import { useApp } from "../context/AppContext";
import { api, ApiError, type ApiEmpleado, type ApiTarea, type ApiTareaEvento, type CambiosTarea, type EstadoTarea, type PrioridadTarea } from "../lib/api";
import { formatoNombre } from "../lib/texto";
import { diasEntreFechas, etiquetaTiempo, formatoFechaCorta } from "../lib/obligaciones";
import { ESTADO_TAREA_LABEL, PRIORIDAD_INFO, estaAbierta, estaVencida, hoyISO } from "../lib/tareas";

interface Asignable {
  id: number;
  nombre: string;
}

type Vista = "abiertas" | "vencidas" | "completadas" | "canceladas" | "todas";
type Resultado = { ok: boolean; error?: string };

const VISTAS: { valor: Vista; etiqueta: string }[] = [
  { valor: "abiertas", etiqueta: "Abiertas" },
  { valor: "vencidas", etiqueta: "Vencidas" },
  { valor: "completadas", etiqueta: "Completadas" },
  { valor: "canceladas", etiqueta: "Canceladas" },
  { valor: "todas", etiqueta: "Todas" },
];

const PRIORIDADES: PrioridadTarea[] = ["urgente", "alta", "normal", "baja"];
const ETIQUETA_EVENTO: Record<string, string> = {
  creada: "Creada",
  estado: "Estado",
  reasignada: "Reasignada",
  prioridad: "Prioridad",
  fecha: "Fecha límite",
  editada: "Editada",
  nota: "Nota",
};

const campo =
  "w-full rounded-lg border border-ash-light/50 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-magenta disabled:opacity-60";

function fechaHora(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function Tareas() {
  const { usuarioActual, clientes, tareas, crearTarea, actualizarTarea } = useApp();
  const [equipo, setEquipo] = useState<ApiEmpleado[] | null>(null);
  const [errorEquipo, setErrorEquipo] = useState<string | null>(null);

  const [vista, setVista] = useState<Vista>("abiertas");
  const [persona, setPersona] = useState<string>("todas");
  const [clienteFiltro, setClienteFiltro] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [expandida, setExpandida] = useState<string | null>(null);

  const [formAbierto, setFormAbierto] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [asignadoA, setAsignadoA] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<PrioridadTarea>("normal");
  const [fechaLimite, setFechaLimite] = useState("");
  const [creando, setCreando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const hoy = useMemo(() => hoyISO(), []);
  const hoyFecha = useMemo(() => new Date(), []);
  const esGerente = usuarioActual?.rol === "gerente" || usuarioActual?.rol === "super_admin";

  useEffect(() => {
    api
      .equipo()
      .then(({ employees }) => setEquipo(employees))
      .catch((err) => setErrorEquipo(err instanceof ApiError ? err.message : "No se pudo cargar el equipo."));
  }, []);

  // A quién se le puede asignar: gerencia, a todo el equipo activo; la líder
  // de equipo, a su gente y a sí misma (el servidor lo vuelve a verificar).
  const asignables: Asignable[] = useMemo(() => {
    const lista = (equipo ?? []).map((e) => ({ id: e.id, nombre: formatoNombre(e.nombre) }));
    if (usuarioActual?.dbId !== undefined && !lista.some((a) => a.id === usuarioActual.dbId)) {
      lista.push({ id: usuarioActual.dbId, nombre: usuarioActual.nombre });
    }
    return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [equipo, usuarioActual]);

  const abiertas = tareas.filter(estaAbierta);
  const vencidas = abiertas.filter((t) => estaVencida(t, hoy));
  const urgentes = abiertas.filter((t) => t.prioridad === "urgente");
  const completadas = tareas.filter((t) => t.estado === "completada");

  // Una fila por persona (más "sin asignar" si hay), con su carga abierta.
  const cargaPorPersona = useMemo(() => {
    const filas = asignables.map((a) => {
      const suyas = tareas.filter((t) => t.asignadoA === String(a.id) && estaAbierta(t));
      return { clave: String(a.id), nombre: a.nombre, abiertas: suyas.length, vencidas: suyas.filter((t) => estaVencida(t, hoy)).length };
    });
    const sinAsignar = tareas.filter((t) => t.asignadoA === null && estaAbierta(t));
    if (sinAsignar.length > 0) {
      filas.push({ clave: "sin-asignar", nombre: "Sin asignar", abiertas: sinAsignar.length, vencidas: sinAsignar.filter((t) => estaVencida(t, hoy)).length });
    }
    return filas;
  }, [asignables, tareas, hoy]);

  const clientesConTareas = useMemo(() => {
    const ids = new Set(tareas.map((t) => t.clienteId));
    return clientes.filter((c) => ids.has(c.id));
  }, [clientes, tareas]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const lista = tareas.filter((t) => {
      if (vista === "abiertas" && !estaAbierta(t)) return false;
      if (vista === "vencidas" && !estaVencida(t, hoy)) return false;
      if (vista === "completadas" && t.estado !== "completada") return false;
      if (vista === "canceladas" && t.estado !== "cancelada") return false;
      if (persona === "sin-asignar" ? t.asignadoA !== null : persona !== "todas" && t.asignadoA !== persona) return false;
      if (clienteFiltro !== "todos" && t.clienteId !== clienteFiltro) return false;
      if (q && !`${t.titulo} ${t.clienteNombre} ${t.descripcion}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (vista === "completadas") lista.sort((a, b) => (b.completadaEn ?? "").localeCompare(a.completadaEn ?? ""));
    return lista;
  }, [tareas, vista, persona, clienteFiltro, busqueda, hoy]);

  async function onCrear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorForm(null);
    setAviso(null);
    if (!clienteId) return setErrorForm("Elige el cliente para el que es la tarea.");
    if (!asignadoA) return setErrorForm("Elige a quién se le asigna.");
    setCreando(true);
    const resultado = await crearTarea({
      clienteId,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      asignadoA: Number(asignadoA),
      prioridad,
      fechaLimite: fechaLimite || undefined,
    });
    setCreando(false);
    if (!resultado.ok) return setErrorForm(resultado.error ?? "No se pudo crear la tarea.");
    const nombre = asignables.find((a) => String(a.id) === asignadoA)?.nombre ?? "la persona elegida";
    setAviso(`Tarea asignada a ${nombre}.`);
    setTitulo("");
    setDescripcion("");
    setFechaLimite("");
    setPrioridad("normal");
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ash">{esGerente ? "Gerencia" : "Líder de equipo"}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{esGerente ? "Tareas del equipo" : "Tareas de tu equipo"}</h1>
      <p className="mt-2 text-sm text-ash">
        {esGerente
          ? "Asigna lo que cada persona debe hacer para cada cliente y revisa cómo va todo el equipo."
          : "Asigna tareas a tu equipo y haz seguimiento de lo que están haciendo."}
      </p>

      {errorEquipo && (
        <p className="mt-4 rounded-lg border border-folio-red/30 bg-folio-red/10 px-4 py-3 text-sm text-folio-red">{errorEquipo}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <div className="rounded-lg border border-ink/10 bg-white/60 p-3 sm:p-4">
          <p className="font-mono text-xl font-semibold text-ink sm:text-2xl">{abiertas.length}</p>
          <p className="text-xs text-ash">Abiertas</p>
        </div>
        <div className="rounded-lg border border-folio-red/30 bg-folio-red/5 p-3 sm:p-4">
          <p className="font-mono text-xl font-semibold text-folio-red sm:text-2xl">{vencidas.length}</p>
          <p className="text-xs text-folio-red">Vencidas</p>
        </div>
        <div className="rounded-lg border border-folio-amber/30 bg-folio-amber/5 p-3 sm:p-4">
          <p className="font-mono text-xl font-semibold text-folio-amber sm:text-2xl">{urgentes.length}</p>
          <p className="text-xs text-folio-amber">Urgentes</p>
        </div>
        <div className="rounded-lg border border-folio-green/30 bg-folio-green/5 p-3 sm:p-4">
          <p className="font-mono text-xl font-semibold text-folio-green sm:text-2xl">{completadas.length}</p>
          <p className="text-xs text-folio-green">Completadas</p>
        </div>
      </div>

      {/* Nueva tarea */}
      <section className="mt-8 rounded-2xl border border-ink/10 bg-white/60">
        <button
          type="button"
          onClick={() => setFormAbierto((v) => !v)}
          aria-expanded={formAbierto}
          className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left"
        >
          <span className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Plus size={18} className="text-magenta-deep" /> Asignar una tarea nueva
          </span>
          {formAbierto ? <ChevronUp size={18} className="text-ash" /> : <ChevronDown size={18} className="text-ash" />}
        </button>

        {formAbierto && (
          <form onSubmit={onCrear} className="grid grid-cols-1 gap-4 border-t border-ink/10 px-5 py-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Cliente</span>
              <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)} className={campo}>
                <option value="">Elige un cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Asignar a</span>
              <select required value={asignadoA} onChange={(e) => setAsignadoA(e.target.value)} className={campo}>
                <option value="">Elige una persona…</option>
                {asignables.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="font-medium text-ink">¿Qué hay que hacer?</span>
              <input
                required
                minLength={3}
                maxLength={200}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Conciliar el banco de septiembre"
                className={campo}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="font-medium text-ink">Detalle (opcional)</span>
              <textarea
                rows={3}
                maxLength={2000}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Instrucciones o contexto para quien la va a hacer"
                className={`${campo} resize-none`}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Prioridad</span>
              <select value={prioridad} onChange={(e) => setPrioridad(e.target.value as PrioridadTarea)} className={campo}>
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORIDAD_INFO[p].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Fecha límite (opcional)</span>
              <input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} className={campo} />
            </label>

            {errorForm && <p className="text-sm text-folio-red sm:col-span-2">{errorForm}</p>}
            {aviso && <p className="text-sm text-folio-green sm:col-span-2">{aviso}</p>}

            <button
              type="submit"
              disabled={creando}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-magenta to-magenta-deep px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-magenta/20 transition-transform hover:scale-[1.01] disabled:opacity-60 sm:col-span-2"
            >
              {creando && <Loader2 size={15} className="animate-spin" />} Asignar tarea
            </button>
          </form>
        )}
      </section>

      {/* Carga por persona */}
      {cargaPorPersona.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-ink">Cómo va cada persona</h2>
          <p className="mt-1 text-sm text-ash">Toca a alguien para ver solo sus tareas.</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {cargaPorPersona.map((p) => {
              const activo = persona === p.clave;
              return (
                <button
                  key={p.clave}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => setPersona(activo ? "todas" : p.clave)}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left transition-colors ${
                    activo ? "border-magenta bg-magenta/5" : "border-ink/10 bg-white/60 hover:border-magenta/40"
                  }`}
                >
                  <span className="truncate text-sm font-medium text-ink">{p.nombre}</span>
                  <span className="shrink-0 font-mono text-xs text-ash">
                    {p.abiertas} abierta{p.abiertas === 1 ? "" : "s"}
                    {p.vencidas > 0 && <span className="text-folio-red"> · {p.vencidas} vencida{p.vencidas === 1 ? "" : "s"}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Filtros */}
      <section className="mt-8">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
          {VISTAS.map((v) => (
            <button
              key={v.valor}
              type="button"
              aria-pressed={vista === v.valor}
              onClick={() => setVista(v.valor)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                vista === v.valor ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/60 text-ink hover:border-magenta/40"
              }`}
            >
              {v.etiqueta}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1.2fr]">
          <select aria-label="Filtrar por persona" value={persona} onChange={(e) => setPersona(e.target.value)} className={campo}>
            <option value="todas">Todas las personas</option>
            {asignables.map((a) => (
              <option key={a.id} value={String(a.id)}>
                {a.nombre}
              </option>
            ))}
            <option value="sin-asignar">Sin asignar</option>
          </select>
          <select aria-label="Filtrar por cliente" value={clienteFiltro} onChange={(e) => setClienteFiltro(e.target.value)} className={campo}>
            <option value="todos">Todos los clientes</option>
            {clientesConTareas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="search"
              aria-label="Buscar tarea"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar tarea o cliente…"
              className={`${campo} pl-9`}
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-ash">
          {visibles.length} tarea{visibles.length === 1 ? "" : "s"}
        </p>
        <div className="mt-2 flex flex-col gap-2.5">
          {visibles.length === 0 ? (
            <p className="rounded-lg border border-dashed border-ash-light px-5 py-8 text-center text-sm text-ash">
              {tareas.length === 0 ? "Todavía no hay tareas. Asigna la primera con el botón de arriba." : "Ninguna tarea coincide con estos filtros."}
            </p>
          ) : (
            visibles.map((t) => (
              <TareaFila
                key={t.id}
                tarea={t}
                asignables={asignables}
                hoy={hoy}
                hoyFecha={hoyFecha}
                expandida={expandida === t.id}
                onToggle={() => setExpandida((actual) => (actual === t.id ? null : t.id))}
                onCambiar={(cambios) => actualizarTarea(t.id, cambios)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function TareaFila({
  tarea,
  asignables,
  hoy,
  hoyFecha,
  expandida,
  onToggle,
  onCambiar,
}: {
  tarea: ApiTarea;
  asignables: Asignable[];
  hoy: string;
  hoyFecha: Date;
  expandida: boolean;
  onToggle: () => void;
  onCambiar: (cambios: CambiosTarea) => Promise<Resultado>;
}) {
  const [ocupada, setOcupada] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventos, setEventos] = useState<ApiTareaEvento[] | null>(null);
  const [tituloEdit, setTituloEdit] = useState(tarea.titulo);
  const [descripcionEdit, setDescripcionEdit] = useState(tarea.descripcion);

  const vencida = estaVencida(tarea, hoy);
  const estadosPosibles: EstadoTarea[] = tarea.puedeGestionar
    ? ["pendiente", "en_progreso", "completada", "cancelada"]
    : ["pendiente", "en_progreso", "completada"];

  // El historial se carga al abrir la tarea y se refresca cuando algo cambia.
  useEffect(() => {
    if (!expandida) return;
    let vigente = true;
    api
      .historialTarea(tarea.id)
      .then(({ eventos: recibidos }) => vigente && setEventos(recibidos))
      .catch(() => vigente && setEventos([]));
    return () => {
      vigente = false;
    };
  }, [expandida, tarea.id, tarea.actualizadaEn]);

  async function cambiar(cambios: CambiosTarea) {
    setError(null);
    setOcupada(true);
    const resultado = await onCambiar(cambios);
    setOcupada(false);
    if (!resultado.ok) setError(resultado.error ?? "No se pudo guardar el cambio.");
  }

  const hayEdicionPendiente = tituloEdit.trim() !== tarea.titulo || descripcionEdit.trim() !== tarea.descripcion;

  return (
    <div className={`rounded-xl border bg-white/60 ${vencida ? "border-folio-red/40" : "border-ink/10"}`}>
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-magenta-deep">
            <Link to={`/clientes/${tarea.clienteId}`} className="hover:underline">
              {tarea.clienteNombre}
            </Link>
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-ink">
            <span className={tarea.estado === "completada" || tarea.estado === "cancelada" ? "line-through decoration-ash/50" : ""}>
              {tarea.titulo}
            </span>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${PRIORIDAD_INFO[tarea.prioridad].chip}`}>
              {PRIORIDAD_INFO[tarea.prioridad].label}
            </span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-ash">
            <span className="text-ink">{tarea.asignadoNombre ? formatoNombre(tarea.asignadoNombre) : "Sin asignar"}</span>
            {" · "}
            <span className={vencida ? "text-folio-red" : ""}>
              {tarea.fechaLimite
                ? `${formatoFechaCorta(tarea.fechaLimite)}${estaAbierta(tarea) ? ` · ${etiquetaTiempo(diasEntreFechas(hoyFecha, tarea.fechaLimite))}` : ""}`
                : "Sin fecha límite"}
            </span>
            {tarea.estado === "completada" && tarea.completadaEn && <span> · hecha el {formatoFechaCorta(tarea.completadaEn.slice(0, 10))}</span>}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <select
            aria-label={`Estado de la tarea ${tarea.titulo}`}
            value={tarea.estado}
            disabled={ocupada}
            onChange={(e) => cambiar({ estado: e.target.value as EstadoTarea })}
            className="rounded-md border border-ash-light/50 bg-white px-2 py-1.5 text-xs text-ink outline-none focus:border-magenta disabled:opacity-60"
          >
            {estadosPosibles.map((e) => (
              <option key={e} value={e}>
                {ESTADO_TAREA_LABEL[e]}
              </option>
            ))}
            {!estadosPosibles.includes(tarea.estado) && (
              <option value={tarea.estado} disabled>
                {ESTADO_TAREA_LABEL[tarea.estado]}
              </option>
            )}
          </select>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expandida}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-ash transition-colors hover:bg-ink/5 hover:text-ink"
          >
            Detalle {expandida ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {error && <p className="px-4 pb-3 text-xs text-folio-red sm:px-5">{error}</p>}

      {expandida && (
        <div className="grid grid-cols-1 gap-5 border-t border-ink/10 px-4 py-4 sm:px-5 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            {tarea.puedeGestionar ? (
              <>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-ink">Título</span>
                  <input value={tituloEdit} onChange={(e) => setTituloEdit(e.target.value)} maxLength={200} className={campo} />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-ink">Detalle</span>
                  <textarea value={descripcionEdit} onChange={(e) => setDescripcionEdit(e.target.value)} rows={3} maxLength={2000} className={`${campo} resize-none`} />
                </label>
                {hayEdicionPendiente && (
                  <button
                    type="button"
                    disabled={ocupada}
                    onClick={() => cambiar({ titulo: tituloEdit.trim(), descripcion: descripcionEdit.trim() })}
                    className="self-start rounded-md bg-ink px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-magenta disabled:opacity-60"
                  >
                    Guardar cambios
                  </button>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
                  <label className="flex flex-col gap-1 text-xs">
                    <span className="font-medium text-ink">Asignada a</span>
                    <select
                      value={tarea.asignadoA ?? ""}
                      disabled={ocupada}
                      onChange={(e) => e.target.value && cambiar({ asignadoA: Number(e.target.value) })}
                      className={campo}
                    >
                      {tarea.asignadoA === null && <option value="">Sin asignar</option>}
                      {asignables.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs">
                    <span className="font-medium text-ink">Prioridad</span>
                    <select
                      value={tarea.prioridad}
                      disabled={ocupada}
                      onChange={(e) => cambiar({ prioridad: e.target.value as PrioridadTarea })}
                      className={campo}
                    >
                      {PRIORIDADES.map((p) => (
                        <option key={p} value={p}>
                          {PRIORIDAD_INFO[p].label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs">
                    <span className="font-medium text-ink">Fecha límite</span>
                    <input
                      key={tarea.actualizadaEn}
                      type="date"
                      defaultValue={tarea.fechaLimite}
                      disabled={ocupada}
                      onChange={(e) => cambiar({ fechaLimite: e.target.value || null })}
                      className={campo}
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <p className="whitespace-pre-line text-sm text-ink/80">{tarea.descripcion || "Esta tarea no tiene detalle adicional."}</p>
              </>
            )}
            {tarea.notaCierre && (
              <p className="rounded-lg border border-folio-green/20 bg-folio-green/5 px-3 py-2 text-xs text-ink/80">
                <span className="font-medium">Nota de cierre:</span> {tarea.notaCierre}
              </p>
            )}
            <p className="font-mono text-[11px] text-ash">
              Creada {fechaHora(tarea.creadaEn)}
              {tarea.creadoPorNombre && ` por ${formatoNombre(tarea.creadoPorNombre)}`}
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Historial</p>
            {eventos === null ? (
              <p className="mt-2 text-xs text-ash">Cargando…</p>
            ) : eventos.length === 0 ? (
              <p className="mt-2 text-xs text-ash">Sin movimientos registrados.</p>
            ) : (
              <ol className="mt-2 flex flex-col gap-2 border-l border-ink/10 pl-3">
                {eventos.map((ev) => (
                  <li key={ev.id} className="text-xs">
                    <p className="text-ink">
                      <span className="font-medium">{ETIQUETA_EVENTO[ev.accion] ?? ev.accion}</span>
                      {ev.detalle && <span className="text-ink/80"> · {ev.detalle}</span>}
                    </p>
                    <p className="font-mono text-[10px] text-ash">
                      {ev.empleadoNombre ? formatoNombre(ev.empleadoNombre) : "Alguien"} · {fechaHora(ev.creadoEn)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
