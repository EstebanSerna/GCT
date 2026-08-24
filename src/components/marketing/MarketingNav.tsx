import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/logo-mark.png";

const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#nosotros", label: "Por qué nosotros" },
  { href: "#proceso", label: "Cómo trabajamos" },
  { href: "#contacto", label: "Contacto" },
];

export function MarketingNav() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-paper/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <a href="#inicio" className="flex items-center gap-3">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-magenta/25 blur-lg" aria-hidden />
            <img
              src={logo}
              alt="Gerencia Contable & Tributaria"
              className="relative h-11 w-11 object-contain drop-shadow-[0_2px_10px_rgba(229,19,111,0.45)]"
            />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold text-white">Gerencia</span>
            <span className="-mt-0.5 block font-display text-[12px] text-paper/60">Contable &amp; Tributaria</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-paper/70 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/portal"
            className="rounded-md px-3.5 py-2 text-sm font-medium text-paper/70 transition-colors hover:text-white"
          >
            Iniciar sesión
          </Link>
          <a
            href="#contacto"
            className="rounded-md bg-magenta px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-magenta-deep"
          >
            Agenda un diagnóstico
          </a>
        </div>

        <button
          onClick={() => setAbierto((v) => !v)}
          className="text-paper/80 md:hidden"
          aria-label="Abrir menú"
        >
          {abierto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {abierto && (
        <div className="border-t border-paper/10 bg-ink px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setAbierto(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-paper/70 hover:bg-ink-faint hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/portal"
              onClick={() => setAbierto(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-paper/70 hover:bg-ink-faint hover:text-white"
            >
              Iniciar sesión
            </Link>
            <a
              href="#contacto"
              onClick={() => setAbierto(false)}
              className="mt-2 rounded-md bg-magenta px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Agenda un diagnóstico
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
