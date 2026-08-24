import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Stamp, RingMark } from "../components/Stamp";
import type { Cliente } from "../data/seed";

function riesgoDe(c: Cliente): "verde" | "amber" | "rojo" {
  if (c.vencimientoDias <= 3 && c.documentosPendientes.length > 0) return "rojo";
  if (c.vencimientoDias <= 7 || c.documentosPendientes.length > 0) return "amber";
  return "verde";
}

export default function Clientes() {
  const { clientes, usuarios } = useApp();
  const [seleccionado, setSeleccionado] = useState<Cliente | null>(null);

  function nombreContador(id: string) {
    return usuarios.find((u) => u.id === id)?.nombre ?? "Sin asignar";
  }

  if (seleccionado) {
    const c = seleccionado;
    return (
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
        <button
          onClick={() => setSeleccionado(null)}
          className="mb-6 font-mono text-xs uppercase tracking-wide text-ash hover:text-magenta-deep"
        >
          ← Todos los clientes
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ash">{c.nit}</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{c.nombre}</h1>
            <p className="mt-1 text-sm text-ash">{c.regimen}</p>
          </div>
          <Stamp estado={riesgoDe(c)} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-ink/10 bg-white/60 p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Contacto</p>
            <p className="mt-1 text-sm font-medium text-ink">{c.contactoNombre}</p>
            <p className="text-sm text-ash">{c.contactoTelefono}</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-white/60 p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Contador/a asignado</p>
            <p className="mt-1 text-sm font-medium text-ink">{nombreContador(c.contadorId)}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-magenta/20 bg-magenta/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-magenta-deep">Próximo vencimiento</p>
          <p className="mt-1 text-sm font-medium text-ink">
            {c.proximoVencimiento} · en {c.vencimientoDias} día{c.vencimientoDias === 1 ? "" : "s"}
          </p>
        </div>

        {c.documentosPendientes.length > 0 && (
          <div className="mt-4 rounded-lg border border-folio-amber/30 bg-folio-amber/5 p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-folio-amber">Documentos pendientes</p>
            <ul className="mt-2 flex flex-col gap-1">
              {c.documentosPendientes.map((d, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-ink">
                  <RingMark size={10} /> {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mb-2 mt-8 font-mono text-[11px] uppercase tracking-wider text-ash">Historial</p>
        <div className="flex flex-col">
          {c.historial.map((h, i) => (
            <div key={i} className="flex gap-4 border-l-2 border-ink/10 py-2.5 pl-4">
              <p className="w-20 shrink-0 font-mono text-[11px] text-ash">{h.fecha}</p>
              <p className="text-sm text-ink">{h.accion}</p>
            </div>
          ))}
        </div>

        {c.notas && (
          <div className="mt-6 rounded-lg bg-ink/5 p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Notas</p>
            <p className="mt-1 text-sm text-ink">{c.notas}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Clientes de la firma</h1>
      <p className="mt-2 text-sm text-ash">{clientes.length} hojas de vida activas</p>

      <div className="mt-8 flex flex-col gap-2.5">
        {clientes.map((c) => (
          <button
            key={c.id}
            onClick={() => setSeleccionado(c)}
            className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white/60 px-4 py-4 text-left transition-colors hover:border-magenta/40 sm:px-5"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{c.nombre}</p>
              <p className="mt-0.5 truncate text-xs text-ash">{c.regimen} · {nombreContador(c.contadorId)}</p>
            </div>
            <Stamp estado={riesgoDe(c)} compact />
          </button>
        ))}
      </div>
    </div>
  );
}
