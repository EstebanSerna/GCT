import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { usePortalCliente } from "../context/PortalClienteContext";
import logo from "../assets/logo-mark.png";
import { RingMark } from "../components/Stamp";
import { CampoAuth } from "../components/CampoAuth";
import { FondoAuth } from "../components/FondoAuth";

export default function PortalClienteLogin() {
  const { iniciarSesion } = usePortalCliente();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    await new Promise((r) => setTimeout(r, 250));

    const resultado = iniciarSesion(correo, password);
    if (!resultado.ok) {
      setError(resultado.error ?? "No pudimos verificar tus datos.");
      setCargando(false);
      return;
    }
    navigate("/portal-clientes/inicio");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 py-16 [color-scheme:dark]">
      <FondoAuth />

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
          <h1 className="font-display text-2xl font-semibold text-white">Portal de clientes</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-paper/50">
            <RingMark size={12} /> Tu información tributaria, siempre a la mano
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
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
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

        <div className="mt-6 rounded-xl border border-magenta/15 bg-magenta/5 px-4 py-3 text-center text-xs text-paper/50">
          Vista previa de diseño — probá con{" "}
          <span className="font-mono text-magenta-soft">marcela.rios@vistahermosa.com.co</span> y contraseña{" "}
          <span className="font-mono text-magenta-soft">ClienteGCT2026</span>
        </div>

        <p className="mt-6 text-center text-sm text-paper/45">
          ¿Eres del equipo de GCT?{" "}
          <Link to="/portal" className="font-medium text-magenta-soft hover:text-white">
            Ingresa acá
          </Link>
        </p>
      </div>
    </div>
  );
}
