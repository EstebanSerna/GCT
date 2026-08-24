import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { usuarios, clientesSeed, tareasSeed } from "../data/seed";
import type { Usuario, Cliente, Tarea } from "../data/seed";

interface AppState {
  usuarioActual: Usuario | null;
  setUsuarioActual: (u: Usuario | null) => void;
  clientes: Cliente[];
  tareas: Tarea[];
  completarTarea: (tareaId: string, archivo: File) => void;
  usuarios: Usuario[];
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [clientes] = useState<Cliente[]>(clientesSeed);
  const [tareas, setTareas] = useState<Tarea[]>(tareasSeed);

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
      value={{ usuarioActual, setUsuarioActual, clientes, tareas, completarTarea, usuarios }}
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
