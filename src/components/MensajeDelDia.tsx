import { Sparkles } from "lucide-react";

export function MensajeDelDia({ mensaje }: { mensaje: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-magenta/15 bg-gradient-to-br from-magenta/[0.06] to-transparent p-5">
      <Sparkles size={16} className="text-magenta" />
      <p className="mt-2 font-display text-[15px] italic leading-relaxed text-ink">{mensaje}</p>
    </div>
  );
}
