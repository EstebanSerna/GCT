import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Stamp } from "../components/Stamp";
import { EvidenciaModal } from "../components/EvidenciaModal";
import type { Tarea } from "../data/seed";
import { Link } from "react-router-dom";

export default function ContadorDashboard() {
  const { usuarioActual, tareas, clientes, completarTarea } = useApp();
  const [tareaActiva, setTareaActiva] = useState<Tarea | null>(null);

  const misTareas = tareas.filter((t) => t.contadorId === usuarioActual?.id);
  const pendientes = misTareas.filter((t) => t.estado !== "completada");
  const completadas = misTareas.filter((t) => t.estado === "completada");

  function nombreCliente(clienteId: string) {
    return clientes.find((c) => c.id === clienteId)?.nombre ?? "Cliente";
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ash">
        {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Mis tareas de hoy</h1>
      <p className="mt-2 text-sm text-ash">
        {pendientes.length} pendientes · {completadas.length} completadas con soporte
      </p>

      <div className="mt-8 flex flex-col gap-2.5">
        {pendientes.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-3 rounded-lg border border-ink/10 bg-white/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-magenta-deep">{nombreCliente(t.clienteId)}</p>
              <p className="mt-0.5 font-medium text-ink">{t.titulo}</p>
              <p className="mt-1 font-mono text-[11px] text-ash">Vence: {t.fechaLimite}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Stamp estado={t.estado} />
              <button
                onClick={() => setTareaActiva(t)}
                className="rounded-md bg-ink px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-magenta"
              >
                Marcar hecha
              </button>
            </div>
          </div>
        ))}
        {pendientes.length === 0 && (
          <p className="rounded-lg border border-dashed border-ash-light px-5 py-6 text-center text-sm text-ash">
            No tienes tareas pendientes por ahora.
          </p>
        )}
      </div>

      {completadas.length > 0 && (
        <>
          <p className="mb-2 mt-9 font-mono text-[11px] uppercase tracking-wider text-ash">Con soporte entregado</p>
          <div className="flex flex-col gap-2.5">
            {completadas.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-2 rounded-lg border border-folio-green/20 bg-folio-green/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ash">{nombreCliente(t.clienteId)}</p>
                  <p className="mt-0.5 font-medium text-ink">{t.titulo}</p>
                  <p className="mt-1 font-mono text-[11px] text-ash">
                    Completada {t.completadaHora} · soporte: {t.evidenciaNombre}
                  </p>
                </div>
                <Stamp estado="completada" />
              </div>
            ))}
          </div>
        </>
      )}

      <Link
        to="/clientes"
        className="mt-10 inline-block font-mono text-xs uppercase tracking-wide text-magenta-deep underline underline-offset-4"
      >
        Ver hojas de vida de clientes →
      </Link>

      {tareaActiva && (
        <EvidenciaModal
          tarea={tareaActiva}
          onCerrar={() => setTareaActiva(null)}
          onConfirmar={(archivo) => {
            completarTarea(tareaActiva.id, archivo);
            setTareaActiva(null);
          }}
        />
      )}
    </div>
  );
}
