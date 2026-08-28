import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Fingerprint, ShieldCheck, CalendarDays } from "lucide-react";
import { useApp } from "../context/AppContext";
import logo from "../assets/logo-mark.png";
import { RingMark } from "./Stamp";

const ROL_LABEL: Record<string, string> = {
  super_admin: "Super admin",
  gerente: "Gerente de la firma",
  contador: "Contador/a",
  auxiliar: "Auxiliar contable",
};

export function Shell({ children }: { children: ReactNode }) {
  const { usuarioActual, cerrarSesion } = useApp();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  if (!usuarioActual) return <>{children}</>;

  const esSuperAdmin = usuarioActual.rol === "super_admin";
  const esGerenteOMas = esSuperAdmin || usuarioActual.rol === "gerente";

  const linkBase =
    "flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors";
  const linkActive = "bg-magenta text-white";
  const linkIdle = "text-paper/70 hover:bg-ink-faint hover:text-paper";

  const marca = (
    <div className="flex items-center gap-2.5 px-1">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-magenta/25 blur-md" aria-hidden />
        <img
          src={logo}
          alt="Gerencia Contable & Tributaria"
          className="relative h-10 w-10 object-contain drop-shadow-[0_2px_8px_rgba(229,19,111,0.4)]"
        />
      </span>
      <div className="leading-tight">
        <p className="font-display text-sm font-semibold text-white">Gerencia</p>
        <p className="-mt-0.5 font-display text-[11px] text-paper/60">Contable &amp; Tributaria</p>
      </div>
    </div>
  );

  const navegacion = (
    <nav className="flex flex-col gap-1">
      {!esGerenteOMas && (
        <NavLink
          to="/asistencia"
          onClick={() => setMenuAbierto(false)}
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <Fingerprint size={14} /> Marcar asistencia
        </NavLink>
      )}
      {esGerenteOMas ? (
        <NavLink
          to="/admin"
          onClick={() => setMenuAbierto(false)}
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <RingMark /> Panel de gerencia
        </NavLink>
      ) : (
        <NavLink
          to="/contador"
          onClick={() => setMenuAbierto(false)}
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <RingMark /> Mis tareas
        </NavLink>
      )}
      {esSuperAdmin && (
        <NavLink
          to="/empleados"
          onClick={() => setMenuAbierto(false)}
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <ShieldCheck size={14} /> Cuentas y accesos
        </NavLink>
      )}
      <NavLink
        to="/clientes"
        onClick={() => setMenuAbierto(false)}
        className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
      >
        <RingMark /> Clientes
      </NavLink>
      <NavLink
        to="/calendario"
        onClick={() => setMenuAbierto(false)}
        className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
      >
        <CalendarDays size={14} /> Calendario
      </NavLink>
    </nav>
  );

  const perfil = (
    <div className="mt-auto border-t border-paper/10 pt-4">
      <div className="mb-3 flex items-center gap-2.5 px-1">
        {usuarioActual.fotoBase64 ? (
          <img
            src={usuarioActual.fotoBase64}
            alt={usuarioActual.nombre}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-magenta text-[11px] font-semibold text-white">
            {usuarioActual.iniciales}
          </span>
        )}
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm text-white">{usuarioActual.nombre}</p>
          <p className="text-[11px] text-paper/50">{ROL_LABEL[usuarioActual.rol] ?? usuarioActual.rol}</p>
        </div>
      </div>
      <button
        onClick={() => {
          cerrarSesion();
          navigate("/portal");
        }}
        className="w-full rounded-md px-3 py-2 text-left text-xs text-paper/50 transition-colors hover:bg-ink-faint hover:text-paper"
      >
        Cerrar sesión
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Barra superior — solo en móvil/tablet angosta */}
      <header className="flex shrink-0 items-center justify-between border-b border-paper/10 bg-ink px-4 py-3 text-paper md:hidden">
        {marca}
        <button
          onClick={() => setMenuAbierto((v) => !v)}
          className="shrink-0 rounded-md p-2 text-paper/80 hover:bg-ink-faint"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        >
          {menuAbierto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Fondo oscuro al abrir el menú móvil */}
      {menuAbierto && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMenuAbierto(false)}
          aria-hidden
        />
      )}

      {/* Sidebar: cajón deslizante en móvil, fijo en desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col bg-ink px-4 py-6 text-paper transition-transform duration-200 ease-out md:static md:z-auto md:w-60 md:max-w-none md:translate-x-0 ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 hidden md:block">{marca}</div>
        {navegacion}
        {perfil}
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto bg-paper">{children}</main>
    </div>
  );
}
