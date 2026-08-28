import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { rutaInicioPara } from "../lib/rutas";
import logo from "../assets/logo-mark.png";
import { RingMark } from "../components/Stamp";
import { CampoAuth } from "../components/CampoAuth";

export default function Login() {
  const { iniciarSesion } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const resultado = await iniciarSesion(email.trim(), password);

    if (!resultado.ok || !resultado.rol) {
      setError(resultado.error ?? "Usuario o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    navigate(rutaInicioPara(resultado.rol));
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 py-16 [color-scheme:dark]">
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
            <RingMark size={12} /> Ingresa con tu correo y contraseña
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-[2rem] border border-paper/10 bg-ink-soft/80 p-6 shadow-2xl shadow-black/30 backdrop-blur"
        >
          <CampoAuth
            icono={<Mail size={16} />}
            label="Correo electrónico"
            required
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />

          <CampoAuth
            icono={<Lock size={16} />}
            label="Contraseña"
            required
            type={verPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            extra={
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                className="shrink-0 text-paper/35 hover:text-paper/70"
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {verPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <div className="flex items-center justify-between text-xs">
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
            <p className="rounded-full border border-folio-red/30 bg-folio-red/10 px-4 py-2.5 text-xs text-folio-red">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-magenta to-magenta-deep px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-magenta/25 transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
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

        <p className="mt-6 text-center text-sm text-paper/45">
          ¿Eres nuevo en el equipo?{" "}
          <Link to="/registro" className="font-medium text-magenta-soft hover:text-white">
            Crea tu cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
