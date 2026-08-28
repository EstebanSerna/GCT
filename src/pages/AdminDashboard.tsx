import { useApp } from "../context/AppContext";
import { Stamp } from "../components/Stamp";
import { MensajeDelDia } from "../components/MensajeDelDia";
import { MENSAJES_GERENTE, mensajeDelDia } from "../data/mensajes";
import type { Cliente } from "../data/seed";

function riesgoDe(c: Cliente): "verde" | "amber" | "rojo" {
  if (c.vencimientoDias <= 3 && c.documentosPendientes.length > 0) return "rojo";
  if (c.vencimientoDias <= 7 || c.documentosPendientes.length > 0) return "amber";
  return "verde";
}

export default function AdminDashboard() {
  const { clientes, tareas, usuarios } = useApp();
  const contadores = usuarios.filter((u) => u.rol !== "gerente");

  const conRiesgo = clientes.map((c) => ({ cliente: c, riesgo: riesgoDe(c) }));
  const rojos = conRiesgo.filter((x) => x.riesgo === "rojo");
  const ambar = conRiesgo.filter((x) => x.riesgo === "amber");
  const verdes = conRiesgo.filter((x) => x.riesgo === "verde");

  const hoy = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long" });

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Panel de gerencia · {hoy}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Cómo va la firma hoy</h1>

      <div className="mt-6">
        <MensajeDelDia mensaje={mensajeDelDia(MENSAJES_GERENTE)} />
      </div>

      {/* Semáforo de riesgo */}
      <section className="mt-9">
        <h2 className="font-display text-lg font-semibold text-ink">Semáforo de riesgo por cliente</h2>
        <p className="mt-1 text-sm text-ash">
          Cruce entre días para el próximo vencimiento y documentos pendientes de recibir.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg border border-folio-red/30 bg-folio-red/5 p-3 sm:p-4">
            <p className="font-mono text-xl font-semibold text-folio-red sm:text-2xl">{rojos.length}</p>
            <p className="text-xs text-folio-red">En riesgo</p>
          </div>
          <div className="rounded-lg border border-folio-amber/30 bg-folio-amber/5 p-3 sm:p-4">
            <p className="font-mono text-xl font-semibold text-folio-amber sm:text-2xl">{ambar.length}</p>
            <p className="text-xs text-folio-amber">Por revisar</p>
          </div>
          <div className="rounded-lg border border-folio-green/30 bg-folio-green/5 p-3 sm:p-4">
            <p className="font-mono text-xl font-semibold text-folio-green sm:text-2xl">{verdes.length}</p>
            <p className="text-xs text-folio-green">Al día</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {[...rojos, ...ambar, ...verdes].map(({ cliente, riesgo }) => (
            <div
              key={cliente.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white/60 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{cliente.nombre}</p>
                <p className="truncate text-xs text-ash">{cliente.proximoVencimiento}</p>
              </div>
              <Stamp estado={riesgo} compact />
            </div>
          ))}
        </div>
      </section>

      {/* Carga de trabajo */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Carga de trabajo del equipo</h2>
        <p className="mt-1 text-sm text-ash">Tareas activas por contador/a, para repartir el trabajo a tiempo.</p>
        <div className="mt-4 flex flex-col gap-2.5">
          {contadores.map((u) => {
            const suyas = tareas.filter((t) => t.contadorId === u.id);
            const pendientes = suyas.filter((t) => t.estado !== "completada").length;
            const total = suyas.length || 1;
            const pct = Math.round((pendientes / total) * 100);
            return (
              <div key={u.id} className="rounded-lg border border-ink/10 bg-white/60 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm">
                  <span className="font-medium text-ink">
                    {u.nombre}{" "}
                    <span className="font-mono text-[10px] uppercase tracking-wide text-ash">
                      · {u.rol === "contador" ? "Contador/a" : "Auxiliar"}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-ash">{pendientes} pendientes de {suyas.length}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className={`h-full rounded-full ${pct > 60 ? "bg-folio-red" : pct > 30 ? "bg-folio-amber" : "bg-folio-green"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resumen WhatsApp */}
      <section className="mt-10 mb-6">
        <h2 className="font-display text-lg font-semibold text-ink">Resumen que llega a tu WhatsApp</h2>
        <p className="mt-1 text-sm text-ash">Se envía automáticamente al cierre del día.</p>
        <div className="mt-4 max-w-sm rounded-2xl rounded-tl-sm bg-[#DCF8C6] p-4 font-body text-[13px] leading-relaxed text-ink shadow-sm">
          <p className="font-semibold">📋 Resumen del día — {hoy}</p>
          <p className="mt-2">
            ✅ {tareas.filter((t) => t.estado === "completada").length} tareas completadas con soporte
          </p>
          <p>⏳ {tareas.filter((t) => t.estado !== "completada").length} tareas siguen pendientes</p>
          <p className="mt-2">🔴 {rojos.length} clientes en riesgo: {rojos.map((r) => r.cliente.nombre).join(", ") || "ninguno"}</p>
          <p className="mt-2 text-[11px] text-ink/50">Enviado por el portal · {new Date().toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })}</p>
        </div>
      </section>
    </div>
  );
}
