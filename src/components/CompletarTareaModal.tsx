import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ApiTarea } from "../lib/api";

export function CompletarTareaModal({
  tarea,
  onCerrar,
  onConfirmar,
}: {
  tarea: ApiTarea;
  onCerrar: () => void;
  onConfirmar: (nota: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCerrar]);

  async function confirmar() {
    setError(null);
    setGuardando(true);
    const resultado = await onConfirmar(nota.trim());
    setGuardando(false);
    if (!resultado.ok) setError(resultado.error ?? "No se pudo guardar.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 backdrop-blur-sm">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="completar-tarea-titulo"
        tabIndex={-1}
        className="w-full max-w-sm rounded-xl bg-paper p-6 shadow-2xl outline-none"
      >
        <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Marcar como completada</p>
        <h2 id="completar-tarea-titulo" className="mt-1 font-display text-lg font-semibold text-ink">
          {tarea.titulo}
        </h2>
        <p className="mt-0.5 text-xs text-magenta-deep">{tarea.clienteNombre}</p>

        <label className="mt-4 block text-sm">
          <span className="font-medium text-ink">Nota de cierre (opcional)</span>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Qué hiciste o qué debe saber gerencia"
            className="mt-1.5 w-full resize-none rounded-lg border border-ash-light/50 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-magenta"
          />
        </label>

        {error && <p className="mt-2 text-xs text-folio-red">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            onClick={onCerrar}
            className="flex-1 rounded-md border border-ash-light px-4 py-2.5 text-sm font-medium text-ash transition-colors hover:bg-ink/5"
          >
            Cancelar
          </button>
          <button
            disabled={guardando}
            onClick={confirmar}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-magenta px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-magenta-deep disabled:opacity-50"
          >
            {guardando && <Loader2 size={14} className="animate-spin" />} Marcar hecha
          </button>
        </div>
      </div>
    </div>
  );
}
