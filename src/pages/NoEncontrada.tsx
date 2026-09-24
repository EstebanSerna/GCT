import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function NoEncontrada() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-wider text-magenta-deep">Error 404</p>
      <h1 className="font-display text-3xl font-semibold text-ink">No encontramos esta página</h1>
      <p className="max-w-sm text-sm text-ash">
        Revisa que la dirección esté bien escrita, o vuelve al inicio del sitio.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-magenta"
      >
        Volver al inicio <ArrowRight size={16} />
      </Link>
    </div>
  );
}
