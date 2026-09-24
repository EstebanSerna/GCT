// Cliente para el backend real (auth, asistencia, empleados). En local
// (Vite dev) no hay backend con base de datos, así que estas llamadas
// fallarán ahí — funcionan contra el backend desplegado en Railway.
// Ver server/prod.mjs para las rutas.

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "gct_token";

export type Rol = "super_admin" | "gerente" | "lider_equipo" | "contador" | "auxiliar";

export interface ApiEmpleado {
  id: number;
  nombre: string;
  email: string;
  rol: Rol | null;
  iniciales: string;
  documento: string | null;
  telefono: string | null;
  fotoBase64: string | null;
  activo: boolean;
  coordinadorId: number | null;
}

// El propio empleado nunca ve distancia/rango de la oficina — eso es solo
// para el informe de gerencia (ver RegistroAsistenciaAdmin), para no dar la
// sensación de estar vigilándolo.
export interface RegistroAsistencia {
  id: number;
  tipo: "entrada" | "salida";
  registrado_en: string;
}

export interface RegistroAsistenciaAdmin extends RegistroAsistencia {
  employee_id: number;
  nombre: string;
  iniciales: string;
  rol: Rol;
  dentro_de_rango: boolean;
  distancia_oficina_metros: number;
}

export type EstadoObligacion = "pendiente" | "presentado" | "pagado";

export interface ApiDocumento {
  id: string;
  clienteId: string;
  obligacionId: string | null;
  nombreArchivo: string;
  tipoMime: string | null;
  tamanoBytes: number | null;
  subidoPor: string | null;
  subidoEn: string;
}

export interface ApiObligacion {
  id: string;
  clienteId: string;
  tipo: string;
  obligacion: string;
  vencimiento: string;
  estado: EstadoObligacion;
  documentos: ApiDocumento[];
}

export interface ApiCliente {
  id: string;
  nombre: string;
  nit: string;
  tipoPersona: "natural" | "juridica";
  regimen: string;
  ciudad: string;
  contacto: { nombre: string; telefono: string; correo: string; fechaNacimiento: string };
  clienteDesde: string;
  responsableId: string | null;
  revisorId: string | null;
  honorariosMensuales: number;
  estadoCartera: "al_dia" | "en_mora";
  notas: string;
  obligaciones: ApiObligacion[];
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
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

// Para subir archivos: sin Content-Type manual, el navegador arma el
// boundary del multipart solo (por eso no reutiliza request()).
async function requestFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body: formData });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError((data && data.error) || "No se pudo conectar con el servidor.");
  }
  return data as T;
}

export interface DatosRegistro {
  nombre: string;
  documento: string;
  telefono: string;
  email: string;
  password: string;
  fotoBase64?: string | null;
}

export const api = {
  async registro(datos: DatosRegistro) {
    const data = await request<
      { pendiente: true; mensaje: string } | { pendiente: false; token: string; employee: ApiEmpleado }
    >("/api/auth/registro", { method: "POST", body: JSON.stringify(datos) });
    if (!data.pendiente) setToken(data.token);
    return data;
  },

  async login(email: string, password: string) {
    const data = await request<{ token: string; employee: ApiEmpleado }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
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

  /** Super admin: todos, incluidos pendientes de aprobar. */
  empleados() {
    return request<{ employees: ApiEmpleado[] }>("/api/employees");
  },

  /** Gerente/super admin: todo el equipo activo. Líder de equipo: solo quienes coordina. */
  equipo() {
    return request<{ employees: ApiEmpleado[] }>("/api/employees/equipo");
  },

  crearEmpleado(input: { nombre: string; email: string; password: string; rol: Exclude<Rol, "super_admin">; documento?: string; telefono?: string }) {
    return request<{ employee: ApiEmpleado }>("/api/employees", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  actualizarEmpleado(
    id: number,
    input: { activo?: boolean; rol?: Exclude<Rol, "super_admin">; password?: string; coordinadorId?: number | null }
  ) {
    return request<{ employee: ApiEmpleado }>(`/api/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  /** Super admin: abre una sesión real como otro empleado, para auditar el sistema. */
  impersonar(id: number) {
    return request<{ token: string; employee: ApiEmpleado }>(`/api/employees/${id}/impersonate`, { method: "POST" });
  },

  eliminarEmpleado(id: number) {
    return request<{ ok: true }>(`/api/employees/${id}`, { method: "DELETE" });
  },

  /** Gerente/super admin: todos los clientes. Contador/auxiliar: solo los que tiene asignados. */
  clientes() {
    return request<{ clientes: ApiCliente[] }>("/api/clientes");
  },

  actualizarObligacion(id: string, estado: EstadoObligacion) {
    return request<{ obligacion: ApiObligacion }>(`/api/obligaciones/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });
  },

  /** Reasigna el responsable de un cliente (repartir carga de trabajo). */
  reasignarCliente(id: string, responsableId: number | null) {
    return request<{ cliente: ApiCliente }>(`/api/clientes/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ responsableId }),
    });
  },

  /** Marca una obligación como presentada/pagada Y sube el soporte que lo respalda, en un solo paso. */
  subirSoporte(obligacionId: string, estado: "presentado" | "pagado", archivo: File) {
    const formData = new FormData();
    formData.append("estado", estado);
    formData.append("archivo", archivo);
    return requestFormData<{ obligacion: ApiObligacion }>(`/api/obligaciones/${obligacionId}/soporte`, formData);
  },

  /** URL firmada temporal (5 min) para descargar un documento ya subido. */
  urlDescargaDocumento(documentoId: string) {
    return request<{ url: string }>(`/api/documentos/${documentoId}/descargar`);
  },
};

export { ApiError };
