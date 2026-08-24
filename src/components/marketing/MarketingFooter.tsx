import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { RingMark } from "../Stamp";
import { serviciosSeed } from "../../data/servicios";
import logo from "../../assets/logo-mark.png";

export function MarketingFooter() {
  return (
    <footer className="border-t border-paper/10 bg-ink px-6 pt-14 pb-8 text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
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
          </div>
          <p className="mt-4 max-w-xs text-sm text-paper/50">
            Acompañamiento contable y tributario cercano para empresas que quieren crecer sin sobresaltos con la DIAN.
          </p>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-paper/40">Servicios</p>
          <ul className="mt-3 flex flex-col gap-2">
            {serviciosSeed.slice(0, 5).map((s) => (
              <li key={s.id}>
                <a href="#servicios" className="flex items-center gap-1.5 text-sm text-paper/60 hover:text-white">
                  <RingMark size={10} /> {s.titulo}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-paper/40">Contacto</p>
          <ul className="mt-3 flex flex-col gap-2.5 text-sm text-paper/60">
            <li className="flex items-center gap-2">
              <Phone size={14} className="shrink-0 text-magenta" /> +57 300 000 0000
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="shrink-0 text-magenta" /> contacto@gerenciacontable.co
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-magenta" /> Medellín, Colombia
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-paper/10 pt-6 text-xs text-paper/35 md:flex-row">
        <p>© {new Date().getFullYear()} Gerencia Contable &amp; Tributaria. Demo — datos ilustrativos.</p>
        <Link to="/portal" className="text-paper/40 hover:text-white">
          Portal de empleados →
        </Link>
      </div>
    </footer>
  );
}
