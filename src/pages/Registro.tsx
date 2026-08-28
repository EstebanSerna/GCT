import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, IdCard, Phone, Mail, Lock, Camera, ArrowRight, Check, X, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { api, ApiError } from "../lib/api";
import { archivoAFotoBase64 } from "../lib/foto";
import logo from "../assets/logo-mark.png";

interface Requisito {
  label: string;
  cumple: (p: string) => boolean;
}

const REQUISITOS: Requisito[] = [
  { label: "Al menos 8 caracteres", cumple: (p) => p.length >= 8 },
  { label: "Una mayúscula", cumple: (p) => /[A-Z]/.test(p) },
  { label: "Una minúscula", cumple: (p) => /[a-z]/.test(p) },
  { label: "Un número", cumple: (p) => /[0-9]/.test(p) },
  { label: "Un carácter especial (!@#$...)", cumple: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function Registro() {
  const { iniciarSesionDesdeRegistro } = useApp();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendienteAprobacion, setPendienteAprobacion] = useState(false);

  const passwordValida = REQUISITOS.every((r) => r.cumple(password));

  async function onFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await archivoAFotoBase64(file);
      setFotoBase64(dataUrl);
      setFotoPreview(dataUrl);
    } catch {
      setError("No se pudo procesar la foto. Intenta con otra imagen.");
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!passwordValida) {
      setError("La contraseña todavía no cumple todos los requisitos de seguridad.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      const resultado = await api.registro({
        nombre: nombre.trim(),
        documento: documento.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        password,
        fotoBase64,
      });

      if (resultado.pendiente) {
        setPendienteAprobacion(true);
      } else {
        iniciarSesionDesdeRegistro(resultado.employee);
        navigate("/asistencia");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar el registro.");
    } finally {
      setCargando(false);
    }
  }

  if (pendienteAprobacion) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 py-16">
        <div className="relative w-full max-w-sm text-center">
          <CheckCircle2 size={40} className="mx-auto text-folio-green" />
          <h1 className="mt-4 font-display text-xl font-semibold text-white">¡Cuenta registrada!</h1>
          <p className="mt-3 text-sm leading-relaxed text-paper/60">
            Un administrador debe activar tu cuenta y asignarte tu rol antes de que puedas iniciar sesión. Te
            avisarán apenas esté lista.
          </p>
          <Link
            to="/portal"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-magenta px-5 py-2.5 text-sm font-semibold text-white hover:bg-magenta-deep"
          >
            Volver al portal
          </Link>
        </div>
      </div>
    );
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

      <div className="relative w-full max-w-md">
        <Link to="/portal" className="mb-6 inline-flex items-center gap-1.5 text-xs text-paper/40 hover:text-paper/70">
          ← Volver al portal
        </Link>

        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="Gerencia Contable & Tributaria" className="mb-4 h-14 w-14 object-contain" />
          <h1 className="font-display text-2xl font-semibold text-white">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-paper/50">Un administrador aprobará tu acceso al portal.</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-paper/10 bg-ink-soft/80 p-6 shadow-2xl shadow-black/30 backdrop-blur"
        >
          <div className="flex flex-col items-center gap-2">
            <label htmlFor="foto" className="group relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-paper/25 bg-ink text-paper/40 hover:border-magenta hover:text-magenta">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Vista previa" className="h-full w-full rounded-full object-cover" />
              ) : (
                <Camera size={22} />
              )}
            </label>
            <input id="foto" type="file" accept="image/*" onChange={onFotoChange} className="hidden" />
            <span className="text-[11px] text-paper/40">Foto de perfil (opcional)</span>
          </div>

          <Campo icono={<User size={16} />} label="Nombre completo">
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" className="campo-input" />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo icono={<IdCard size={16} />} label="Documento">
              <input required value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="1020304050" className="campo-input" />
            </Campo>
            <Campo icono={<Phone size={16} />} label="Celular">
              <input required value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="3001234567" className="campo-input" />
            </Campo>
          </div>

          <Campo icono={<Mail size={16} />} label="Correo electrónico">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" className="campo-input" />
          </Campo>

          <Campo icono={<Lock size={16} />} label="Contraseña">
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="campo-input" />
          </Campo>

          {password.length > 0 && (
            <ul className="-mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {REQUISITOS.map((r) => {
                const ok = r.cumple(password);
                return (
                  <li key={r.label} className={`flex items-center gap-1.5 text-[11px] ${ok ? "text-folio-green" : "text-paper/35"}`}>
                    {ok ? <Check size={12} /> : <X size={12} />} {r.label}
                  </li>
                );
              })}
            </ul>
          )}

          <Campo icono={<Lock size={16} />} label="Confirmar contraseña">
            <input required type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} placeholder="••••••••" className="campo-input" />
          </Campo>

          {error && (
            <p className="rounded-lg border border-folio-red/30 bg-folio-red/10 px-3 py-2 text-xs text-folio-red">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-magenta px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-magenta-deep disabled:opacity-60"
          >
            {cargando ? "Creando cuenta..." : (<>Registrarme <ArrowRight size={16} /></>)}
          </button>
        </form>
      </div>
    </div>
  );
}

function Campo({ icono, label, children }: { icono: ReactNode; label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-paper/70">{label}</span>
      <span className="flex items-center gap-2 rounded-lg border border-paper/15 bg-ink px-3.5 py-2.5 focus-within:border-magenta [&_.campo-input]:w-full [&_.campo-input]:bg-transparent [&_.campo-input]:text-sm [&_.campo-input]:text-white [&_.campo-input]:outline-none [&_.campo-input]:placeholder:text-paper/30">
        <span className="shrink-0 text-paper/35">{icono}</span>
        {children}
      </span>
    </label>
  );
}
