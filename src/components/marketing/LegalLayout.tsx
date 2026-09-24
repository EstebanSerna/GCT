import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";

export function Pendiente({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-folio-amber/40 bg-folio-amber/10 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-folio-amber">
      Pendiente de confirmar{children ? `: ${children}` : ""}
    </span>
  );
}

export function LegalLayout({
  titulo,
  actualizado,
  children,
}: {
  titulo: string;
  actualizado: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <MarketingNav />
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-ash hover:text-magenta-deep"
        >
          <ChevronLeft size={14} /> Volver al sitio
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{titulo}</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-wide text-ash">Última actualización: {actualizado}</p>
        <div className="prose-legal mt-10 flex flex-col gap-6 text-[15px] leading-relaxed text-ink/85">{children}</div>
      </div>
      <MarketingFooter />
    </div>
  );
}

export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-ink">{titulo}</h2>
      <div className="mt-2.5 flex flex-col gap-2.5">{children}</div>
    </section>
  );
}
