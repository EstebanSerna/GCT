import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, ArrowRight, Info } from "lucide-react";
import { useApp } from "../context/AppContext";
import logo from "../assets/logo-mark.png";
import { RingMark } from "../components/Stamp";

export default function Login() {
  const { iniciarSesion } = useApp();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const resultado = await iniciarSesion(usuario.trim(), password);

    if (!resultado.ok) {
      setError(resultado.error ?? "Usuario o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    navigate("/asistencia");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 py-16">
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-magenta opacity-20 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-magenta-soft opacity-10 blur-[100px]"
        aria-hidden
      />

      <div className="relative w-full max-w-sm">
        <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-xs text-paper/40 transition-colors hover:text-paper/70">
          ← Volver al sitio
        </Link>

        <div className="mb-8 flex flex-col items-center text-center">
          <span className="relative mb-5 flex h-24 w-24 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-magenta/25 blur-2xl" aria-hidden />
            <img
              src={logo}
              alt="Gerencia Contable & Tributaria"
              className="relative h-20 w-20 object-contain drop-shadow-[0_4px_18px_rgba(229,19,111,0.5)]"
            />
          </span>
          <h1 className="font-display text-2xl font-semibold text-white">Portal de colaboradores</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-paper/50">
            <RingMark size={12} /> Ingresa con tu usuario y contraseña
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-paper/10 bg-ink-soft/80 p-6 shadow-2xl shadow-black/30 backdrop-blur"
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-paper/70">Usuario</span>
            <span className="flex items-center gap-2 rounded-lg border border-paper/15 bg-ink px-3.5 py-2.5 focus-within:border-magenta">
              <User size={16} className="shrink-0 text-paper/35" />
              <input
                required
                autoFocus
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="nombre.apellido"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-paper/30"
              />
            </span>
          </label>

          <label className="mt-4 flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-paper/70">Contraseña</span>
            <span className="flex items-center gap-2 rounded-lg border border-paper/15 bg-ink px-3.5 py-2.5 focus-within:border-magenta">
              <Lock size={16} className="shrink-0 text-paper/35" />
              <input
                required
                type={verPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-paper/30"
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                className="shrink-0 text-paper/35 hover:text-paper/70"
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {verPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>

          <div className="mt-4 flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-paper/45">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-paper/30 bg-ink accent-magenta" />
              Recordarme
            </label>
            <button
              type="button"
              onClick={() => setError("Contacta al equipo de sistemas para restablecer tu contraseña.")}
              className="text-paper/45 hover:text-paper/75"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-folio-red/30 bg-folio-red/10 px-3 py-2 text-xs text-folio-red">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-magenta px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-magenta-deep disabled:opacity-60"
          >
            {cargando ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Verificando...
              </>
            ) : (
              <>
                Ingresar <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 flex items-start gap-2 rounded-lg border border-paper/10 bg-white/[0.03] px-3.5 py-3 text-[11px] leading-relaxed text-paper/40">
          <Info size={13} className="mt-0.5 shrink-0" />
          <span>
            Acceso demo — usuario <span className="font-mono text-paper/60">camilo.ruiz</span> · contraseña{" "}
            <span className="font-mono text-paper/60">Contable2026</span>. Datos ilustrativos, no reales.
          </span>
        </div>
      </div>
    </div>
  );
}
