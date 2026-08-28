// Cliente para el backend real (auth, asistencia, empleados). En local
// (Vite dev) no hay backend con base de datos, así que estas llamadas
// fallarán ahí — funcionan contra el backend desplegado en Railway.
// Ver server/prod.mjs para las rutas.

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "gct_token";

export type Rol = "admin" | "contador" | "auxiliar";

export interface ApiEmpleado {
  id: number;
  nombre: string;
  usuario: string;
  rol: Rol;
  iniciales: string;
  activo?: boolean;
}

export interface RegistroAsistencia {
  id: number;
  tipo: "entrada" | "salida";
  registrado_en: string;
  dentro_de_rango: boolean;
  distancia_oficina_metros: number;
}

export interface RegistroAsistenciaAdmin extends RegistroAsistencia {
  employee_id: number;
  nombre: string;
  iniciales: string;
  rol: Rol;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError((data && data.error) || "No se pudo conectar con el servidor.");
  }
  return data as T;
}

export const api = {
  async login(usuario: string, password: string) {
    const data = await request<{ token: string; employee: ApiEmpleado }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ usuario, password }),
    });
    setToken(data.token);
    return data.employee;
  },

  async logout() {
    try {
      await request("/api/auth/logout", { method: "POST" });
    } finally {
      setToken(null);
    }
  },

  me() {
    return request<{ employee: ApiEmpleado }>("/api/auth/me");
  },

  marcar(tipo: "entrada" | "salida", lat: number, lng: number, precision?: number) {
    return request<{ record: RegistroAsistencia }>(`/api/attendance/${tipo}`, {
      method: "POST",
      body: JSON.stringify({ lat, lng, precision }),
    });
  },

  asistenciaHoy() {
    return request<{ records: RegistroAsistencia[] }>("/api/attendance/today");
  },

  asistenciaTodos(limit = 200) {
    return request<{ records: RegistroAsistenciaAdmin[] }>(`/api/attendance?limit=${limit}`);
  },

  empleados() {
    return request<{ employees: ApiEmpleado[] }>("/api/employees");
  },

  crearEmpleado(input: { nombre: string; usuario: string; password: string; rol: Rol }) {
    return request<{ employee: ApiEmpleado }>("/api/employees", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  actualizarEmpleado(id: number, input: { activo?: boolean; rol?: Rol; password?: string }) {
    return request<{ employee: ApiEmpleado }>(`/api/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};

export { ApiError };
