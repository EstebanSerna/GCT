type Estado = "pendiente" | "en_progreso" | "completada" | "verde" | "amber" | "rojo";

const CONFIG: Record<Estado, { label: string; ring: string; dot: string; text: string }> = {
  pendiente: { label: "Pendiente", ring: "border-ash-light", dot: "bg-ash-light", text: "text-ash" },
  en_progreso: { label: "En curso", ring: "border-magenta", dot: "bg-magenta", text: "text-magenta-deep" },
  completada: { label: "Completada", ring: "border-folio-green", dot: "bg-folio-green", text: "text-folio-green" },
  verde: { label: "Al día", ring: "border-folio-green", dot: "bg-folio-green", text: "text-folio-green" },
  amber: { label: "Por revisar", ring: "border-folio-amber", dot: "bg-folio-amber", text: "text-folio-amber" },
  rojo: { label: "En riesgo", ring: "border-folio-red", dot: "bg-folio-red", text: "text-folio-red" },
};

export function Stamp({ estado, compact = false }: { estado: Estado; compact?: boolean }) {
  const c = CONFIG[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] ${c.ring} ${
        compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      } font-mono uppercase tracking-wide ${c.text} bg-white/40`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function RingMark({ size = 14 }: { size?: number }) {
  // Small decorative arc echoing the firm's G-ring mark, used as a divider/bullet.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block shrink-0">
      <path
        d="M18.5 8.5A7.5 7.5 0 1 0 19.8 15"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
