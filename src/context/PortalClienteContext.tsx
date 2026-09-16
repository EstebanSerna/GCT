import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Cliente } from "../data/seed";
import { clientesDemo } from "../data/clientesDemo";

// Sesión del PORTAL DE CLIENTES — un sistema de acceso completamente
// aparte del de tu equipo (AppContext/empleados). Un cliente que inicia
// sesión acá nunca debe poder ver nada del portal interno, ni de otros
// clientes.
//
// ⚠️ Vista previa de diseño: esto valida contra clientesDemo.ts en el
// navegador, sin backend ni contraseñas reales — es solo para revisar cómo
// se ve y se siente el portal. Antes de usarse con clientes reales hay que
// construir el backend real (tabla de sesiones de cliente, bcrypt, etc.),
// igual de serio que el del equipo interno.
const CLAVE_DEMO = "ClienteGCT2026";
const STORAGE_KEY = "gct_cliente_demo_id";

interface PortalClienteState {
  clienteActual: Cliente | null;
  cargando: boolean;
  iniciarSesion: (correo: string, password: string) => { ok: boolean; error?: string };
  cerrarSesion: () => void;
  actualizarContacto: (datos: Partial<Cliente["contacto"]>) => void;
}

const PortalClienteContext = createContext<PortalClienteState | undefined>(undefined);

export function PortalClienteProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(clientesDemo);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) setClienteId(guardado);
    setCargando(false);
  }, []);

  function iniciarSesion(correo: string, password: string) {
    const encontrado = clientes.find((c) => c.contacto.correo.toLowerCase() === correo.trim().toLowerCase());
    if (!encontrado) return { ok: false, error: "No encontramos una cuenta con ese correo." };
    if (password !== CLAVE_DEMO) return { ok: false, error: "Contraseña incorrecta." };
    setClienteId(encontrado.id);
    localStorage.setItem(STORAGE_KEY, encontrado.id);
    return { ok: true };
  }

  function cerrarSesion() {
    setClienteId(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function actualizarContacto(datos: Partial<Cliente["contacto"]>) {
    if (!clienteId) return;
    setClientes((prev) => prev.map((c) => (c.id === clienteId ? { ...c, contacto: { ...c.contacto, ...datos } } : c)));
  }

  const clienteActual = clienteId ? clientes.find((c) => c.id === clienteId) ?? null : null;

  return (
    <PortalClienteContext.Provider value={{ clienteActual, cargando, iniciarSesion, cerrarSesion, actualizarContacto }}>
      {children}
    </PortalClienteContext.Provider>
  );
}

export function usePortalCliente() {
  const ctx = useContext(PortalClienteContext);
  if (!ctx) throw new Error("usePortalCliente debe usarse dentro de PortalClienteProvider");
  return ctx;
}
