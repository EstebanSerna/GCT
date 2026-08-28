import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usuarios, clientesSeed, tareasSeed } from "../data/seed";
import type { Usuario, Cliente, Tarea } from "../data/seed";
import { api, getToken, type ApiEmpleado } from "../lib/api";

// Convierte el empleado que devuelve el backend real al formato "Usuario"
// que usa el resto de la app. El "id" es el mismo "usuario" con el que
// inició sesión — así las tareas/clientes de la demo (asignados por ese
// mismo valor en src/data/seed.ts) siguen encontrándose sin cambios. Un
// empleado nuevo, sin tareas de demo asociadas, simplemente no verá nada
// en esas pantallas — no rompe nada.
function aUsuario(emp: ApiEmpleado): Usuario {
  return {
    id: emp.usuario,
    dbId: emp.id,
    nombre: emp.nombre,
    rol: emp.rol,
    iniciales: emp.iniciales,
    usuario: emp.usuario,
  };
}

interface AppState {
  usuarioActual: Usuario | null;
  cargandoSesion: boolean;
  iniciarSesion: (usuario: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  cerrarSesion: () => void;
  clientes: Cliente[];
  tareas: Tarea[];
  completarTarea: (tareaId: string, archivo: File) => void;
  usuarios: Usuario[];
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [clientes] = useState<Cliente[]>(clientesSeed);
  const [tareas, setTareas] = useState<Tarea[]>(tareasSeed);

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
      .then(({ employee }) => setUsuarioActual(aUsuario(employee)))
      .catch(() => {
        /* token vencido o inválido — se queda sin sesión */
      })
      .finally(() => setCargandoSesion(false));
  }, []);

  async function iniciarSesion(usuario: string, password: string) {
    try {
      const employee = await api.login(usuario, password);
      setUsuarioActual(aUsuario(employee));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "No se pudo iniciar sesión." };
    }
  }

  function cerrarSesion() {
    setUsuarioActual(null);
    void api.logout();
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
        cerrarSesion,
        clientes,
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
