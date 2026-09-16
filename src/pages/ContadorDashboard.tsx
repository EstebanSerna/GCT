import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Stamp } from "../components/Stamp";
import { EvidenciaModal } from "../components/EvidenciaModal";
import { MensajeDelDia } from "../components/MensajeDelDia";
import { MENSAJES_CONTADOR, MENSAJES_AUXILIAR, mensajeDelDia } from "../data/mensajes";
import type { Tarea, Cliente } from "../data/seed";
import { diasEntreFechas, etiquetaTiempo, formatoFechaCorta, iconoObligacion } from "../lib/obligaciones";

interface ItemPendiente {
  fecha: string; // ISO
  origen: "obligacion" | "tarea";
  clienteNombre: string;
  clienteId?: string;
  titulo: string;
  tarea?: Tarea;
}

function riesgoDe(c: Cliente, hoy: Date): "verde" | "amber" | "rojo" {
  const pendientes = c.obligaciones.filter((o) => o.estado === "pendiente").sort((a, b) => a.vencimiento.localeCompare(b.vencimiento));
  const proxima = pendientes[0];
  if (!proxima) return "verde";
  const dias = diasEntreFechas(hoy, proxima.vencimiento);
  if (dias <= 3) return "rojo";
  if (dias <= 7) return "amber";
  return "verde";
}

export default function ContadorDashboard() {
  const { usuarioActual, tareas, clientes, completarTarea } = useApp();
  const [tareaActiva, setTareaActiva] = useState<Tarea | null>(null);

  const hoy = useMemo(() => new Date(), []);
  const mensajes = usuarioActual?.rol === "auxiliar" ? MENSAJES_AUXILIAR : MENSAJES_CONTADOR;

  const misClientes = useMemo(
    () => clientes.filter((c) => c.responsable === usuarioActual?.nombre),
    [clientes, usuarioActual]
  );

  const conRiesgo = useMemo(() => misClientes.map((c) => riesgoDe(c, hoy)), [misClientes, hoy]);
  const enRiesgo = conRiesgo.filter((r) => r === "rojo").length;
  const porRevisar = conRiesgo.filter((r) => r === "amber").length;

  const misTareas = tareas.filter((t) => t.contadorId === usuarioActual?.id);
  const tareasCompletadas = misTareas.filter((t) => t.estado === "completada");

  function nombreCliente(clienteId: string) {
    return clientes.find((c) => c.id === clienteId)?.nombre ?? misClientes.find((c) => c.id === clienteId)?.nombre ?? "Cliente";
  }

  // Obligaciones tributarias pendientes + tareas internas pendientes,
  // fusionadas en una sola lista ordenada por fecha — así no hay que mirar
  // dos pantallas distintas para saber qué toca hoy.
  const pendientes: ItemPendiente[] = useMemo(() => {
    const deObligaciones: ItemPendiente[] = misClientes.flatMap((c) =>
      c.obligaciones
        .filter((o) => o.estado === "pendiente")
        .map((o) => ({ fecha: o.vencimiento, origen: "obligacion" as const, clienteNombre: c.nombre, clienteId: c.id, titulo: o.tipo }))
    );
    const deTareas: ItemPendiente[] = misTareas
      .filter((t) => t.estado !== "completada")
      .map((t) => ({ fecha: t.fechaLimite, origen: "tarea" as const, clienteNombre: nombreCliente(t.clienteId), titulo: t.titulo, tarea: t }));
    return [...deObligaciones, ...deTareas].sort((a, b) => a.fecha.localeCompare(b.fecha));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [misClientes, misTareas]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ash">
        {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Mis pendientes</h1>
      <p className="mt-2 text-sm text-ash">
        {misClientes.length} clientes a tu cargo · {pendientes.length} pendientes en total
      </p>

      <div className="mt-6">
        <MensajeDelDia mensaje={mensajeDelDia(mensajes)} />
      </div>

      {misClientes.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg border border-folio-red/30 bg-folio-red/5 p-3 sm:p-4">
            <p className="font-mono text-xl font-semibold text-folio-red sm:text-2xl">{enRiesgo}</p>
            <p className="text-xs text-folio-red">En riesgo</p>
          </div>
          <div className="rounded-lg border border-folio-amber/30 bg-folio-amber/5 p-3 sm:p-4">
            <p className="font-mono text-xl font-semibold text-folio-amber sm:text-2xl">{porRevisar}</p>
            <p className="text-xs text-folio-amber">Por revisar</p>
          </div>
          <div className="rounded-lg border border-folio-green/30 bg-folio-green/5 p-3 sm:p-4">
            <p className="font-mono text-xl font-semibold text-folio-green sm:text-2xl">{misClientes.length - enRiesgo - porRevisar}</p>
            <p className="text-xs text-folio-green">Al día</p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-2.5">
        {pendientes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ash-light px-5 py-6 text-center text-sm text-ash">
            No tienes pendientes por ahora.
          </p>
        ) : (
          pendientes.map((item, i) => {
            if (item.origen === "tarea" && item.tarea) {
              const t = item.tarea;
              return (
                <div
                  key={`t-${t.id}`}
                  className="flex flex-col gap-3 rounded-lg border border-ink/10 bg-white/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-magenta-deep">{item.clienteNombre}</p>
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
              );
            }

            const Icono = iconoObligacion(item.titulo);
            const dias = diasEntreFechas(hoy, item.fecha);
            return (
              <Link
                key={`o-${item.clienteId}-${i}`}
                to={`/clientes/${item.clienteId}`}
                className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white/60 px-4 py-4 transition-colors hover:border-magenta/40 sm:px-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-magenta/10 text-magenta-deep">
                  <Icono size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-magenta-deep">{item.clienteNombre}</p>
                  <p className="mt-0.5 truncate font-medium text-ink">{item.titulo}</p>
                  <p className="mt-1 font-mono text-[11px] text-ash">
                    {formatoFechaCorta(item.fecha)} · {etiquetaTiempo(dias)}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {tareasCompletadas.length > 0 && (
        <>
          <p className="mb-2 mt-9 font-mono text-[11px] uppercase tracking-wider text-ash">Con soporte entregado</p>
          <div className="flex flex-col gap-2.5">
            {tareasCompletadas.map((t) => (
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
        Ver mis clientes →
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
