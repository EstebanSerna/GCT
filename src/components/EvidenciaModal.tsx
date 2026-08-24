import { useRef, useState } from "react";
import type { Tarea } from "../data/seed";

export function EvidenciaModal({
  tarea,
  onCerrar,
  onConfirmar,
}: {
  tarea: Tarea;
  onCerrar: () => void;
  onConfirmar: (archivo: File) => void;
}) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-paper p-6 shadow-2xl">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Marcar como completada</p>
        <h2 className="mt-1 font-display text-lg font-semibold text-ink">{tarea.titulo}</h2>
        <p className="mt-2 text-sm text-ash">
          Para dejar constancia, adjunta un soporte de la entrega: captura, PDF o el documento final.
        </p>

        <button
          onClick={() => inputRef.current?.click()}
          className={`mt-4 w-full rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
            archivo ? "border-folio-green bg-folio-green/5 text-folio-green" : "border-ash-light text-ash hover:border-magenta hover:text-magenta"
          }`}
        >
          {archivo ? (
            <span className="font-medium">{archivo.name}</span>
          ) : (
            <span>Haz clic para adjuntar evidencia</span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
        />

        <div className="mt-6 flex gap-2">
          <button
            onClick={onCerrar}
            className="flex-1 rounded-md border border-ash-light px-4 py-2.5 text-sm font-medium text-ash transition-colors hover:bg-ink/5"
          >
            Cancelar
          </button>
          <button
            disabled={!archivo}
            onClick={() => archivo && onConfirmar(archivo)}
            className="flex-1 rounded-md bg-magenta px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-magenta-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirmar entrega
          </button>
        </div>
      </div>
    </div>
  );
}
