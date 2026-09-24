import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usuarios, tareasSeed } from "../data/seed";
import type { Usuario, Cliente, Tarea } from "../data/seed";
import { api, getToken, setToken, type ApiEmpleado, type ApiCliente, type ApiObligacion, type Rol } from "../lib/api";
import { formatoNombre } from "../lib/texto";

// Mientras el super admin está "viendo como" otra persona, el token real de
// su propia cuenta se guarda acá aparte — así volver es instantáneo y no
// depende de que recuerde su contraseña.
const ADMIN_TOKEN_KEY = "gct_admin_token";

// Convierte el empleado que devuelve el backend real al formato "Usuario"
// que usa el resto de la app. El "id" es el mismo correo con el que inició
// sesión — así las tareas/clientes de la demo (asignados por ese mismo
// valor en src/data/seed.ts) siguen encontrándose sin cambios. Un empleado
// nuevo, sin tareas de demo asociadas, simplemente no verá nada en esas
// pantallas — no rompe nada. `emp.rol` solo llega null para cuentas
// pendientes de aprobar, que el backend nunca deja iniciar sesión — por
// eso el cast es seguro acá.
//
// El nombre se formatea acá una sola vez (mayúscula inicial, resto
// minúscula) para que toda la app se vea consistente sin importar cómo
// haya quedado escrito en el registro original.
function aUsuario(emp: ApiEmpleado): Usuario {
  return {
    id: emp.email,
    dbId: emp.id,
    nombre: formatoNombre(emp.nombre),
    rol: emp.rol as NonNullable<ApiEmpleado["rol"]>,
    iniciales: emp.iniciales,
    usuario: emp.email,
    fotoBase64: emp.fotoBase64,
  };
}

function aCliente(c: ApiCliente): Cliente {
  return { ...c, nombre: formatoNombre(c.nombre), contacto: { ...c.contacto, nombre: formatoNombre(c.contacto.nombre) } };
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
  /** Solo para volver a "pendiente" (deshacer un error) — marcar como
   * presentado/pagado exige el soporte, ver subirSoporteObligacion. */
  actualizarEstadoObligacion: (obligacionId: string, estado: "pendiente") => Promise<{ ok: boolean; error?: string }>;
  reasignarResponsable: (clienteId: string, responsableId: number | null) => Promise<{ ok: boolean; error?: string }>;
  subirSoporteObligacion: (
    obligacionId: string,
    estado: "presentado" | "pagado",
    archivo: File
  ) => Promise<{ ok: boolean; error?: string }>;
  tareas: Tarea[];
  completarTarea: (tareaId: string, archivo: File) => void;
  usuarios: Usuario[];
  impersonando: boolean;
  iniciarImpersonacion: (id: number) => Promise<{ ok: boolean; error?: string; rol?: Rol }>;
  salirDeImpersonacion: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [tareas, setTareas] = useState<Tarea[]>(tareasSeed);
  const [impersonando, setImpersonando] = useState(false);

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
    setImpersonando(!!localStorage.getItem(ADMIN_TOKEN_KEY));
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
    setImpersonando(false);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    void api.logout();
  }

  async function iniciarImpersonacion(id: number) {
    try {
      const { token, employee } = await api.impersonar(id);
      const tokenPropio = getToken();
      if (tokenPropio) localStorage.setItem(ADMIN_TOKEN_KEY, tokenPropio);
      setToken(token);
      setUsuarioActual(aUsuario(employee));
      setImpersonando(true);
      cargarClientes();
      return { ok: true, rol: employee.rol as Rol };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "No se pudo cambiar de perfil." };
    }
  }

  async function salirDeImpersonacion() {
    const tokenPropio = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!tokenPropio) return;
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(tokenPropio);
    setImpersonando(false);
    try {
      const { employee } = await api.me();
      setUsuarioActual(aUsuario(employee));
      cargarClientes();
    } catch {
      setUsuarioActual(null);
    }
  }

  async function actualizarEstadoObligacion(obligacionId: string, estado: "pendiente") {
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

  async function subirSoporteObligacion(obligacionId: string, estado: "presentado" | "pagado", archivo: File) {
    try {
      const { obligacion } = await api.subirSoporte(obligacionId, estado, archivo);
      setClientes((prev) =>
        prev.map((c) => ({
          ...c,
          obligaciones: c.obligaciones.map((o) => (o.id === obligacionId ? (obligacion as ApiObligacion) : o)),
        }))
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "No se pudo subir el soporte." };
    }
  }

  async function reasignarResponsable(clienteId: string, responsableId: number | null) {
    const anterior = clientes;
    setClientes((prev) => prev.map((c) => (c.id === clienteId ? { ...c, responsableId: responsableId === null ? null : String(responsableId) } : c)));
    try {
      await api.reasignarCliente(clienteId, responsableId);
      return { ok: true };
    } catch (err) {
      setClientes(anterior);
      return { ok: false, error: err instanceof Error ? err.message : "No se pudo reasignar." };
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
        subirSoporteObligacion,
        reasignarResponsable,
        tareas,
        completarTarea,
        usuarios,
        impersonando,
        iniciarImpersonacion,
        salirDeImpersonacion,
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
