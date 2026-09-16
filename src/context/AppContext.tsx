import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usuarios, tareasSeed } from "../data/seed";
import type { Usuario, Cliente, Tarea, EstadoObligacion } from "../data/seed";
import { api, getToken, type ApiEmpleado, type ApiCliente, type Rol } from "../lib/api";

// Convierte el empleado que devuelve el backend real al formato "Usuario"
// que usa el resto de la app. El "id" es el mismo correo con el que inició
// sesión — así las tareas/clientes de la demo (asignados por ese mismo
// valor en src/data/seed.ts) siguen encontrándose sin cambios. Un empleado
// nuevo, sin tareas de demo asociadas, simplemente no verá nada en esas
// pantallas — no rompe nada. `emp.rol` solo llega null para cuentas
// pendientes de aprobar, que el backend nunca deja iniciar sesión — por
// eso el cast es seguro acá.
function aUsuario(emp: ApiEmpleado): Usuario {
  return {
    id: emp.email,
    dbId: emp.id,
    nombre: emp.nombre,
    rol: emp.rol as NonNullable<ApiEmpleado["rol"]>,
    iniciales: emp.iniciales,
    usuario: emp.email,
    fotoBase64: emp.fotoBase64,
  };
}

function aCliente(c: ApiCliente): Cliente {
  return c;
}

interface AppState {
  usuarioActual: Usuario | null;
  cargandoSesion: boolean;
  iniciarSesion: (email: string, password: string) => Promise<{ ok: boolean; error?: string; rol?: Rol }>;
  /** Para cuando el registro deja la sesión ya iniciada (solo el correo del super admin). */
  iniciarSesionDesdeRegistro: (employee: ApiEmpleado) => void;
  cerrarSesion: () => void;
  clientes: Cliente[];
  cargandoClientes: boolean;
  actualizarEstadoObligacion: (obligacionId: string, estado: EstadoObligacion) => Promise<{ ok: boolean; error?: string }>;
  tareas: Tarea[];
  completarTarea: (tareaId: string, archivo: File) => void;
  usuarios: Usuario[];
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [tareas, setTareas] = useState<Tarea[]>(tareasSeed);

  const cargarClientes = useCallback(() => {
    setCargandoClientes(true);
    api
      .clientes()
      .then(({ clientes: recibidos }) => setClientes(recibidos.map(aCliente)))
      .catch(() => {
        /* sin sesión válida o sin backend (dev local) — se queda vacío */
      })
      .finally(() => setCargandoClientes(false));
  }, []);

  // Al cargar la app, si hay un token guardado, valida la sesión contra el
  // servidor en vez de pedir usuario/contraseña de nuevo cada vez.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCargandoSesion(false);
      return;
    }
    api
      .me()
      .then(({ employee }) => {
        setUsuarioActual(aUsuario(employee));
        cargarClientes();
      })
      .catch(() => {
        /* token vencido o inválido — se queda sin sesión */
      })
      .finally(() => setCargandoSesion(false));
  }, [cargarClientes]);

  async function iniciarSesion(email: string, password: string) {
    try {
      const employee = await api.login(email, password);
      setUsuarioActual(aUsuario(employee));
      cargarClientes();
      return { ok: true, rol: employee.rol as Rol };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "No se pudo iniciar sesión." };
    }
  }

  function iniciarSesionDesdeRegistro(employee: ApiEmpleado) {
    setUsuarioActual(aUsuario(employee));
    cargarClientes();
  }

  function cerrarSesion() {
    setUsuarioActual(null);
    setClientes([]);
    void api.logout();
  }

  async function actualizarEstadoObligacion(obligacionId: string, estado: EstadoObligacion) {
    const anterior = clientes;
    // Optimista: se ve el cambio de inmediato, y se revierte si el
    // servidor lo rechaza (por ejemplo, si ya no tiene ese cliente asignado).
    setClientes((prev) =>
      prev.map((c) => ({
        ...c,
        obligaciones: c.obligaciones.map((o) => (o.id === obligacionId ? { ...o, estado } : o)),
      }))
    );
    try {
      await api.actualizarObligacion(obligacionId, estado);
      return { ok: true };
    } catch (err) {
      setClientes(anterior);
      return { ok: false, error: err instanceof Error ? err.message : "No se pudo actualizar." };
    }
  }

  function completarTarea(tareaId: string, archivo: File) {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              estado: "completada",
              evidenciaNombre: archivo.name,
              evidenciaUrl: URL.createObjectURL(archivo),
              completadaHora: new Date().toLocaleTimeString("es-CO", {
                hour: "numeric",
                minute: "2-digit",
              }),
            }
          : t
      )
    );
  }

  return (
    <AppContext.Provider
      value={{
        usuarioActual,
        cargandoSesion,
        iniciarSesion,
        iniciarSesionDesdeRegistro,
        cerrarSesion,
        clientes,
        cargandoClientes,
        actualizarEstadoObligacion,
        tareas,
        completarTarea,
        usuarios,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}
