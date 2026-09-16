import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, ChevronLeft, CalendarClock, Cake, PartyPopper, Phone, Mail, Building2, IdCard, UserCircle2, Wallet } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Stamp } from "../components/Stamp";
import type { Cliente, Obligacion } from "../data/seed";
import { iconoObligacion, ESTADO_INFO, formatoFechaCorta, diasEntreFechas, etiquetaTiempo } from "../lib/obligaciones";
import { proximaFechaAnual, aniosDesde, diaMesCorto, formatoPesos, CARTERA_INFO } from "../lib/relacion";

const DIAS_SPOTLIGHT = 14;

function proximaPendiente(c: Cliente): Obligacion | null {
  const pendientes = c.obligaciones
    .filter((o) => o.estado === "pendiente")
    .sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));
  return pendientes[0] ?? null;
}

function riesgoCliente(c: Cliente, hoy: Date): "verde" | "amber" | "rojo" {
  const proxima = proximaPendiente(c);
  if (!proxima) return "verde";
  const dias = diasEntreFechas(hoy, proxima.vencimiento);
  if (dias <= 3) return "rojo";
  if (dias <= 7) return "amber";
  return "verde";
}

export default function Clientes() {
  const { usuarioActual, clientes } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");

  const hoy = useMemo(() => new Date(), []);

  // Gerencia y super admin ven a todos los clientes de la firma; contador/a
  // y auxiliar solo ven los que tienen asignados — así su panel no se llena
  // de clientes que no les corresponden.
  const misClientes = useMemo(() => {
    if (!usuarioActual || usuarioActual.rol === "gerente" || usuarioActual.rol === "super_admin") return clientes;
    return clientes.filter((c) => c.responsable === usuarioActual.nombre);
  }, [clientes, usuarioActual]);

  const seleccionado = id ? misClientes.find((c) => c.id === id) ?? null : null;

  const fechasEspeciales = useMemo(() => {
    const eventos: { cliente: Cliente; tipo: "cumpleaños" | "aniversario"; dias: number; detalle: string }[] = [];
    for (const c of misClientes) {
      const cumple = proximaFechaAnual(c.contacto.fechaNacimiento, hoy);
      if (cumple.dias <= DIAS_SPOTLIGHT) {
        eventos.push({ cliente: c, tipo: "cumpleaños", dias: cumple.dias, detalle: c.contacto.nombre });
      }
      const aniversario = proximaFechaAnual(c.clienteDesde, hoy);
      if (aniversario.dias <= DIAS_SPOTLIGHT) {
        const anios = aniosDesde(c.clienteDesde, hoy) + (aniversario.dias === 0 ? 0 : 1);
        eventos.push({ cliente: c, tipo: "aniversario", dias: aniversario.dias, detalle: `${anios} año${anios === 1 ? "" : "s"} con GCT` });
      }
    }
    return eventos.sort((a, b) => a.dias - b.dias);
  }, [misClientes, hoy]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const lista = q
      ? misClientes.filter((c) => c.nombre.toLowerCase().includes(q) || c.nit.includes(q))
      : misClientes;
    return [...lista].sort((a, b) => {
      const pa = proximaPendiente(a);
      const pb = proximaPendiente(b);
      if (!pa && !pb) return a.nombre.localeCompare(b.nombre);
      if (!pa) return 1;
      if (!pb) return -1;
      return pa.vencimiento.localeCompare(pb.vencimiento);
    });
  }, [misClientes, busqueda]);

  if (seleccionado) {
    return <DetalleCliente cliente={seleccionado} hoy={hoy} onVolver={() => navigate("/clientes")} />;
  }

  const esPropio = usuarioActual?.rol === "contador" || usuarioActual?.rol === "auxiliar";
  const totalPendientes = misClientes.reduce(
    (n, c) => n + c.obligaciones.filter((o) => o.estado === "pendiente").length,
    0
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">{esPropio ? "Mis clientes" : "Clientes de la firma"}</h1>
      <p className="mt-2 text-sm text-ash">
        {misClientes.length} clientes · {totalPendientes} obligaciones tributarias pendientes
      </p>

      {fechasEspeciales.length > 0 && (
        <div className="mt-6 rounded-2xl border border-magenta/15 bg-magenta/5 p-4 sm:p-5">
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-magenta-deep">
            <PartyPopper size={13} /> Próximos cumpleaños y aniversarios
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {fechasEspeciales.map((ev, i) => (
              <button
                key={i}
                onClick={() => navigate(`/clientes/${ev.cliente.id}`)}
                className="flex items-center justify-between gap-3 rounded-lg bg-white/60 px-3.5 py-2.5 text-left transition-colors hover:bg-white"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {ev.tipo === "cumpleaños" ? (
                    <Cake size={15} className="shrink-0 text-magenta-deep" />
                  ) : (
                    <PartyPopper size={15} className="shrink-0 text-magenta-deep" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{ev.cliente.nombre}</p>
                    <p className="truncate text-xs text-ash">
                      {ev.tipo === "cumpleaños" ? "Cumpleaños de " : "Aniversario · "}
                      {ev.detalle}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-magenta-deep">
                  {ev.dias === 0 ? "Hoy" : ev.dias === 1 ? "Mañana" : `En ${ev.dias} días`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative mt-6">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ash-light" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar cliente o NIT..."
          className="w-full rounded-full border border-ink/10 bg-white/70 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ash-light focus:border-magenta/40 focus:outline-none"
        />
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {misClientes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ash-light px-5 py-8 text-center text-sm text-ash">
            {esPropio
              ? "Todavía no tienes clientes asignados."
              : "Todavía no hay clientes cargados. Cuando se agreguen, sus vencimientos aparecerán acá."}
          </p>
        ) : filtrados.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ash-light px-5 py-8 text-center text-sm text-ash">
            Ningún cliente coincide con "{busqueda}".
          </p>
        ) : (
          filtrados.map((c) => {
            const proxima = proximaPendiente(c);
            const pendientes = c.obligaciones.filter((o) => o.estado === "pendiente").length;
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/clientes/${c.id}`)}
                className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white/60 px-4 py-4 text-left transition-colors hover:border-magenta/40 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{c.nombre}</p>
                  <p className="mt-0.5 truncate text-xs text-ash">
                    {pendientes} pendiente{pendientes === 1 ? "" : "s"}
                    {proxima && (
                      <>
                        {" "}
                        · próx. {formatoFechaCorta(proxima.vencimiento)} ({etiquetaTiempo(diasEntreFechas(hoy, proxima.vencimiento))})
                      </>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {c.estadoCartera === "en_mora" && (
                    <span className="hidden rounded-full border-[1.5px] border-folio-red bg-white/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-folio-red sm:inline-block">
                      Mora
                    </span>
                  )}
                  <Stamp estado={riesgoCliente(c, hoy)} compact />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function DetalleCliente({ cliente, hoy, onVolver }: { cliente: Cliente; hoy: Date; onVolver: () => void }) {
  const proxima = proximaPendiente(cliente);
  const pendientes = cliente.obligaciones.filter((o) => o.estado === "pendiente").length;
  const cumple = proximaFechaAnual(cliente.contacto.fechaNacimiento, hoy);
  const aniversario = proximaFechaAnual(cliente.clienteDesde, hoy);
  const aniosCliente = aniosDesde(cliente.clienteDesde, hoy);
  const cartera = CARTERA_INFO[cliente.estadoCartera];

  const porMes = useMemo(() => {
    const grupos = new Map<string, Obligacion[]>();
    for (const o of cliente.obligaciones) {
      const clave = o.vencimiento.slice(0, 7);
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave)!.push(o);
    }
    for (const lista of grupos.values()) lista.sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));
    return Array.from(grupos.entries()).sort(([a], [b]) => b.localeCompare(a)); // más reciente primero
  }, [cliente]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <button
        onClick={onVolver}
        className="mb-6 flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-ash hover:text-magenta-deep"
      >
        <ChevronLeft size={14} /> Todos los clientes
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ash">
            <IdCard size={12} /> {cliente.nit}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">{cliente.nombre}</h1>
          <p className="mt-1 text-sm text-ash">
            {cliente.regimen} · {cliente.ciudad}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] ${cartera.ring} bg-white/40 px-3 py-1 font-mono text-xs uppercase tracking-wide ${cartera.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${cartera.dot}`} /> {cartera.label}
        </span>
      </div>

      {/* Contacto y relación */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-ink/10 bg-white/60 p-4">
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ash">
            <UserCircle2 size={13} /> Persona de contacto
          </p>
          <p className="mt-1.5 text-sm font-medium text-ink">{cliente.contacto.nombre}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ash">
            <Phone size={12} /> {cliente.contacto.telefono}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ash">
            <Mail size={12} /> {cliente.contacto.correo}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-magenta-deep">
            <Cake size={12} />
            Cumpleaños {diaMesCorto(cliente.contacto.fechaNacimiento)}
            {cumple.dias <= DIAS_SPOTLIGHT && (
              <span className="font-mono">· {cumple.dias === 0 ? "hoy" : cumple.dias === 1 ? "mañana" : `en ${cumple.dias} días`}</span>
            )}
          </p>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/60 p-4">
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ash">
            <Building2 size={13} /> Relación con GCT
          </p>
          <p className="mt-1.5 text-sm font-medium text-ink">
            Cliente desde {formatoFechaCorta(cliente.clienteDesde)} · {aniosCliente} año{aniosCliente === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-xs text-ash">Responsable: {cliente.responsable}</p>
          {aniversario.dias <= DIAS_SPOTLIGHT && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-magenta-deep">
              <PartyPopper size={12} />
              Aniversario {aniversario.dias === 0 ? "hoy" : aniversario.dias === 1 ? "mañana" : `en ${aniversario.dias} días`}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/60 p-4 sm:col-span-2">
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ash">
            <Wallet size={13} /> Honorarios
          </p>
          <p className="mt-1.5 text-sm font-medium text-ink">{formatoPesos(cliente.honorariosMensuales)} / mes</p>
        </div>
      </div>

      {cliente.notas && (
        <div className="mt-3 rounded-lg border border-magenta/15 bg-magenta/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-magenta-deep">Notas y preferencias</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{cliente.notas}</p>
        </div>
      )}

      <p className="mt-8 text-sm text-ash">
        {cliente.obligaciones.length} obligaciones en total · {pendientes} pendiente{pendientes === 1 ? "" : "s"}
      </p>

      {proxima && (
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-ink px-6 py-6 text-paper">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-magenta opacity-20 blur-[80px]" />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-magenta/20 text-magenta-soft">
              <CalendarClock size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-magenta-soft">Próximo vencimiento</p>
              <h3 className="mt-1 truncate font-display text-lg font-semibold text-white">{proxima.tipo}</h3>
              <p className="mt-1 text-sm text-paper/55">
                {formatoFechaCorta(proxima.vencimiento)} · {etiquetaTiempo(diasEntreFechas(hoy, proxima.vencimiento))}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-8">
        {porMes.map(([clave, obligaciones]) => (
          <div key={clave}>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-ash">{etiquetaMes(clave)}</p>
            <div className="flex flex-col gap-2.5">
              {obligaciones.map((o) => (
                <ObligacionCard key={o.id} obligacion={o} hoy={hoy} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObligacionCard({ obligacion, hoy }: { obligacion: Obligacion; hoy: Date }) {
  const Icono = iconoObligacion(obligacion.tipo);
  const estado = ESTADO_INFO[obligacion.estado];
  const dias = diasEntreFechas(hoy, obligacion.vencimiento);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-ink/10 bg-white/60 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-magenta/10 text-magenta-deep">
        <Icono size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h3 className="font-display text-[15px] font-semibold text-ink">{obligacion.tipo}</h3>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] ${estado.ring} bg-white/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${estado.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${estado.dot}`} /> {estado.label}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-xs font-medium text-magenta-deep">
          {formatoFechaCorta(obligacion.vencimiento)}
          {obligacion.estado === "pendiente" && <> · {etiquetaTiempo(dias)}</>}
        </p>
        <p className="mt-1.5 text-xs text-ash">{obligacion.obligacion}</p>
      </div>
    </div>
  );
}

const MESES_LARGOS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function etiquetaMes(clave: string) {
  const [y, m] = clave.split("-").map(Number);
  return `${MESES_LARGOS[m - 1]} ${y}`;
}
