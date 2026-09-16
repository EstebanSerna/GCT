import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Stamp } from "../components/Stamp";
import { MensajeDelDia } from "../components/MensajeDelDia";
import { MENSAJES_LIDER_EQUIPO, mensajeDelDia } from "../data/mensajes";
import { api, ApiError, type ApiEmpleado } from "../lib/api";
import { formatoNombre } from "../lib/texto";
import { diasEntreFechas } from "../lib/obligaciones";
import type { Cliente } from "../data/seed";

function riesgoDe(c: Cliente, hoy: Date): "verde" | "amber" | "rojo" {
  const pendientes = c.obligaciones.filter((o) => o.estado === "pendiente").sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));
  const proxima = pendientes[0];
  if (!proxima) return "verde";
  const dias = diasEntreFechas(hoy, proxima.vencimiento);
  if (dias <= 3) return "rojo";
  if (dias <= 7) return "amber";
  return "verde";
}

export default function EquipoDashboard() {
  const { clientes, reasignarResponsable } = useApp();
  const [equipo, setEquipo] = useState<ApiEmpleado[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null); // clienteId en proceso de reasignar

  const hoy = useMemo(() => new Date(), []);

  useEffect(() => {
    api
      .equipo()
      .then(({ employees }) => setEquipo(employees))
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudo cargar el equipo."));
  }, []);

  // `clientes` del contexto ya trae toda la firma (la líder de equipo ve
  // todo, igual que gerencia) — acá se recorta solo a los de su equipo,
  // porque este panel es sobre su equipo, no sobre toda la firma.
  const clientesEquipo = useMemo(() => {
    if (!equipo) return [];
    const idsEquipo = new Set(equipo.map((emp) => String(emp.id)));
    return clientes.filter((c) => c.responsableId !== null && idsEquipo.has(c.responsableId));
  }, [clientes, equipo]);

  const porPersona = useMemo(() => {
    if (!equipo) return [];
    return equipo.map((emp) => {
      const susClientes = clientesEquipo.filter((c) => c.responsableId === String(emp.id));
      const riesgos = susClientes.map((c) => riesgoDe(c, hoy));
      return {
        emp,
        clientes: susClientes,
        pendientes: susClientes.reduce((n, c) => n + c.obligaciones.filter((o) => o.estado === "pendiente").length, 0),
        enRiesgo: riesgos.filter((r) => r === "rojo").length,
        porRevisar: riesgos.filter((r) => r === "amber").length,
      };
    });
  }, [equipo, clientesEquipo, hoy]);

  const totalEnRiesgo = porPersona.reduce((n, p) => n + p.enRiesgo, 0);
  const totalPorRevisar = porPersona.reduce((n, p) => n + p.porRevisar, 0);
  const totalAlDia = clientesEquipo.length - totalEnRiesgo - totalPorRevisar;

  async function reasignar(clienteId: string, nuevoResponsableId: number) {
    setOcupado(clienteId);
    await reasignarResponsable(clienteId, nuevoResponsableId);
    setOcupado(null);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Líder de equipo</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Cómo va tu equipo hoy</h1>
      <p className="mt-2 text-sm text-ash">
        {equipo?.length ?? 0} personas a tu cargo · {clientesEquipo.length} clientes en total
      </p>

      <div className="mt-6">
        <MensajeDelDia mensaje={mensajeDelDia(MENSAJES_LIDER_EQUIPO)} />
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-folio-red/30 bg-folio-red/10 px-4 py-3 text-sm text-folio-red">{error}</p>
      )}

      {/* Semáforo combinado del equipo */}
      <section className="mt-9">
        <h2 className="font-display text-lg font-semibold text-ink">Semáforo del equipo</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg border border-folio-red/30 bg-folio-red/5 p-3 sm:p-4">
            <p className="font-mono text-xl font-semibold text-folio-red sm:text-2xl">{totalEnRiesgo}</p>
            <p className="text-xs text-folio-red">En riesgo</p>
          </div>
          <div className="rounded-lg border border-folio-amber/30 bg-folio-amber/5 p-3 sm:p-4">
            <p className="font-mono text-xl font-semibold text-folio-amber sm:text-2xl">{totalPorRevisar}</p>
            <p className="text-xs text-folio-amber">Por revisar</p>
          </div>
          <div className="rounded-lg border border-folio-green/30 bg-folio-green/5 p-3 sm:p-4">
            <p className="font-mono text-xl font-semibold text-folio-green sm:text-2xl">{totalAlDia}</p>
            <p className="text-xs text-folio-green">Al día</p>
          </div>
        </div>
      </section>

      {/* Cumplimiento por persona */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Tu equipo</h2>
        <p className="mt-1 text-sm text-ash">Cuántos clientes lleva cada quien y cómo van sus vencimientos.</p>
        <div className="mt-4 flex flex-col gap-2.5">
          {equipo === null ? (
            <p className="text-sm text-ash">Cargando...</p>
          ) : equipo.length === 0 ? (
            <p className="rounded-lg border border-dashed border-ash-light px-5 py-6 text-center text-sm text-ash">
              Todavía no tienes personas asignadas a tu equipo.
            </p>
          ) : (
            porPersona.map(({ emp, clientes: susClientes, pendientes, enRiesgo, porRevisar }) => (
              <div key={emp.id} className="rounded-lg border border-ink/10 bg-white/60 px-4 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                  <span className="font-medium text-ink">
                    {formatoNombre(emp.nombre)}{" "}
                    <span className="font-mono text-[10px] uppercase tracking-wide text-ash">
                      · {emp.rol === "contador" ? "Contador/a" : "Auxiliar"}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-ash">
                    {susClientes.length} cliente{susClientes.length === 1 ? "" : "s"} · {pendientes} pendiente{pendientes === 1 ? "" : "s"}
                  </span>
                </div>
                {(enRiesgo > 0 || porRevisar > 0) && (
                  <div className="mt-2 flex items-center gap-2">
                    {enRiesgo > 0 && <Stamp estado="rojo" compact />}
                    {enRiesgo > 0 && <span className="text-xs text-folio-red">{enRiesgo} en riesgo</span>}
                    {porRevisar > 0 && <Stamp estado="amber" compact />}
                    {porRevisar > 0 && <span className="text-xs text-folio-amber">{porRevisar} por revisar</span>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Reasignar clientes */}
      {equipo && equipo.length > 0 && clientesEquipo.length > 0 && (
        <section className="mt-10 mb-6">
          <h2 className="flex items-center gap-1.5 font-display text-lg font-semibold text-ink">
            <ArrowRightLeft size={16} /> Repartir clientes
          </h2>
          <p className="mt-1 text-sm text-ash">Cambia a quién le corresponde cada cliente, para equilibrar la carga.</p>
          <div className="mt-4 flex flex-col gap-2">
            {clientesEquipo.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white/60 px-4 py-3">
                <Link to={`/clientes/${c.id}`} className="min-w-0 truncate text-sm font-medium text-ink hover:text-magenta-deep">
                  {c.nombre}
                </Link>
                <select
                  value={c.responsableId ?? ""}
                  disabled={ocupado === c.id}
                  onChange={(e) => reasignar(c.id, Number(e.target.value))}
                  className="rounded-md border border-ash-light/50 bg-white px-2 py-1.5 text-xs text-ink outline-none focus:border-magenta disabled:opacity-50"
                >
                  {c.responsableId === null && <option value="">Sin asignar</option>}
                  {equipo.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {formatoNombre(emp.nombre)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
