import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { UserPlus, ShieldCheck, ShieldOff, KeyRound, Download, AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";
import { api, ApiError, type ApiEmpleado, type Rol, type RegistroAsistenciaAdmin } from "../lib/api";
import { agruparPorDiaYEmpleado, descargarCsv } from "../lib/reporte";

type RolAsignable = Exclude<Rol, "super_admin">;

const ROL_LABEL: Record<Rol, string> = {
  super_admin: "Super admin",
  gerente: "Gerente",
  contador: "Contador/a",
  auxiliar: "Auxiliar contable",
};

function NuevoEmpleadoForm({ onCreado }: { onCreado: (e: ApiEmpleado) => void }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<RolAsignable>("contador");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setEnviando(true);
    try {
      const { employee } = await api.crearEmpleado({ nombre, email, password, rol });
      onCreado(employee);
      setNombre("");
      setEmail("");
      setPassword("");
      setRol("contador");
      setOk(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el empleado.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-ink">Nombre completo</span>
        <input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Diana Restrepo"
          className="rounded-lg border border-ash-light/50 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-magenta"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-ink">Correo electrónico</span>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="diana@gct.com.co"
          className="rounded-lg border border-ash-light/50 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-magenta"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-ink">Contraseña inicial</span>
        <input
          required
          type="text"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mayús., minús., número y símbolo"
          className="rounded-lg border border-ash-light/50 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-magenta"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-ink">Rol</span>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value as RolAsignable)}
          className="rounded-lg border border-ash-light/50 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-magenta"
        >
          <option value="contador">Contador/a</option>
          <option value="auxiliar">Auxiliar contable</option>
          <option value="gerente">Gerente</option>
        </select>
      </label>

      {error && <p className="text-xs text-folio-red sm:col-span-2">{error}</p>}
      {ok && <p className="text-xs text-folio-green sm:col-span-2">Empleado creado correctamente.</p>}

      <button
        type="submit"
        disabled={enviando}
        className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-magenta px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-magenta-deep disabled:opacity-60 sm:col-span-2"
      >
        <UserPlus size={16} /> {enviando ? "Creando..." : "Crear empleado"}
      </button>
    </form>
  );
}

function FilaPendiente({ emp, onResuelto }: { emp: ApiEmpleado; onResuelto: (e: ApiEmpleado) => void }) {
  const [rol, setRol] = useState<RolAsignable>("contador");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function aprobar() {
    setOcupado(true);
    setError(null);
    try {
      const { employee } = await api.actualizarEmpleado(emp.id, { activo: true, rol });
      onResuelto(employee);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo aprobar.");
    } finally {
      setOcupado(false);
    }
  }

  async function rechazar() {
    if (!window.confirm(`¿Eliminar el registro de ${emp.nombre}? Esta acción no se puede deshacer.`)) return;
    setOcupado(true);
    try {
      await api.eliminarEmpleado(emp.id);
      onResuelto({ ...emp, activo: false });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-folio-amber/30 bg-folio-amber/5 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {emp.fotoBase64 ? (
          <img src={emp.fotoBase64} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-folio-amber/20 text-[11px] font-semibold text-folio-amber">
            {emp.iniciales}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{emp.nombre}</p>
          <p className="truncate text-xs text-ash">{emp.email} · {emp.documento} · {emp.telefono}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value as RolAsignable)}
          className="rounded-md border border-ash-light/50 bg-white px-2 py-1.5 text-xs text-ink outline-none focus:border-magenta"
        >
          <option value="contador">Contador/a</option>
          <option value="auxiliar">Auxiliar</option>
          <option value="gerente">Gerente</option>
        </select>
        <button
          onClick={aprobar}
          disabled={ocupado}
          className="flex items-center gap-1 rounded-md bg-folio-green px-3 py-1.5 text-xs font-medium text-white hover:bg-folio-green/90 disabled:opacity-50"
        >
          <CheckCircle2 size={13} /> Aprobar
        </button>
        <button
          onClick={rechazar}
          disabled={ocupado}
          className="rounded-md p-1.5 text-ash hover:bg-folio-red/10 hover:text-folio-red disabled:opacity-50"
          title="Eliminar solicitud"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {error && <p className="text-xs text-folio-red sm:col-span-2">{error}</p>}
    </div>
  );
}

function FilaEmpleado({ emp, onCambiado, onEliminado }: { emp: ApiEmpleado; onCambiado: (e: ApiEmpleado) => void; onEliminado: (id: number) => void }) {
  const [ocupado, setOcupado] = useState(false);

  async function toggleActivo() {
    setOcupado(true);
    try {
      const { employee } = await api.actualizarEmpleado(emp.id, { activo: !emp.activo });
      onCambiado(employee);
    } finally {
      setOcupado(false);
    }
  }

  async function cambiarRol(rol: RolAsignable) {
    setOcupado(true);
    try {
      const { employee } = await api.actualizarEmpleado(emp.id, { rol });
      onCambiado(employee);
    } finally {
      setOcupado(false);
    }
  }

  async function resetPassword() {
    const nueva = window.prompt(
      `Nueva contraseña para ${emp.nombre}\n(mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo):`
    );
    if (!nueva) return;
    setOcupado(true);
    try {
      const { employee } = await api.actualizarEmpleado(emp.id, { password: nueva });
      onCambiado(employee);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña.");
    } finally {
      setOcupado(false);
    }
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar la cuenta de ${emp.nombre} definitivamente? Esta acción no se puede deshacer.`)) return;
    setOcupado(true);
    try {
      await api.eliminarEmpleado(emp.id);
      onEliminado(emp.id);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "No se pudo eliminar.");
      setOcupado(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white/60 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {emp.fotoBase64 ? (
          <img src={emp.fotoBase64} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/10 text-[11px] font-semibold text-ink">
            {emp.iniciales}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{emp.nombre}</p>
          <p className="truncate text-xs text-ash">
            {emp.email} {!emp.activo && "· inactivo"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {emp.rol !== "super_admin" && (
          <select
            value={emp.rol ?? "contador"}
            onChange={(e) => cambiarRol(e.target.value as RolAsignable)}
            disabled={ocupado}
            className="rounded-md border border-ash-light/50 bg-white px-2 py-1.5 text-xs text-ink outline-none focus:border-magenta disabled:opacity-50"
          >
            <option value="contador">Contador/a</option>
            <option value="auxiliar">Auxiliar</option>
            <option value="gerente">Gerente</option>
          </select>
        )}
        <button
          onClick={resetPassword}
          disabled={ocupado}
          className="rounded-md p-2 text-ash hover:bg-ink/5 hover:text-magenta-deep disabled:opacity-50"
          title="Restablecer contraseña"
        >
          <KeyRound size={15} />
        </button>
        <button
          onClick={toggleActivo}
          disabled={ocupado}
          className={`rounded-md p-2 disabled:opacity-50 ${
            emp.activo ? "text-folio-green hover:bg-folio-green/10" : "text-ash hover:bg-ink/5"
          }`}
          title={emp.activo ? "Desactivar" : "Reactivar"}
        >
          {emp.activo ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
        </button>
        {emp.rol !== "super_admin" && (
          <button
            onClick={eliminar}
            disabled={ocupado}
            className="rounded-md p-2 text-ash hover:bg-folio-red/10 hover:text-folio-red disabled:opacity-50"
            title="Eliminar cuenta"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Empleados() {
  const [empleados, setEmpleados] = useState<ApiEmpleado[] | null>(null);
  const [registros, setRegistros] = useState<RegistroAsistenciaAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.empleados(), api.asistenciaTodos(100)])
      .then(([e, a]) => {
        setEmpleados(e.employees);
        setRegistros(a.records);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudo cargar la información."));
  }, []);

  const filas = useMemo(() => agruparPorDiaYEmpleado(registros ?? []), [registros]);
  const pendientes = empleados?.filter((e) => !e.activo) ?? [];
  const activos = empleados?.filter((e) => e.activo) ?? [];

  function actualizarEnLista(actualizado: ApiEmpleado) {
    setEmpleados((prev) => prev?.map((e) => (e.id === actualizado.id ? actualizado : e)) ?? null);
  }

  function eliminarDeLista(id: number) {
    setEmpleados((prev) => prev?.filter((e) => e.id !== id) ?? null);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Super admin</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Cuentas y accesos</h1>
      <p className="mt-2 text-sm text-ash">Aprueba registros, asigna roles, y gestiona el equipo.</p>

      {error && (
        <p className="mt-4 rounded-lg border border-folio-red/30 bg-folio-red/10 px-4 py-3 text-sm text-folio-red">
          {error}
        </p>
      )}

      {pendientes.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-1.5 font-display text-lg font-semibold text-ink">
            <AlertTriangle size={16} className="text-folio-amber" /> Pendientes de aprobar ({pendientes.length})
          </h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {pendientes.map((emp) => (
              <FilaPendiente
                key={emp.id}
                emp={emp}
                onResuelto={(actualizado) =>
                  actualizado.activo ? actualizarEnLista(actualizado) : eliminarDeLista(emp.id)
                }
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 rounded-xl border border-ink/10 bg-white/60 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Crear cuenta directamente</h2>
        <p className="mt-1 text-xs text-ash">Para cuando prefieras crear tú la cuenta en vez de que la persona se registre.</p>
        <div className="mt-4">
          <NuevoEmpleadoForm onCreado={(e) => setEmpleados((prev) => (prev ? [...prev, e] : [e]))} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Equipo activo</h2>
        <div className="mt-4 flex flex-col gap-2.5">
          {empleados === null ? (
            <p className="text-sm text-ash">Cargando...</p>
          ) : activos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-ash-light px-5 py-6 text-center text-sm text-ash">
              Todavía no hay cuentas activas.
            </p>
          ) : (
            activos.map((emp) => (
              <FilaEmpleado key={emp.id} emp={emp} onCambiado={actualizarEnLista} onEliminado={eliminarDeLista} />
            ))
          )}
        </div>
      </section>

      <section className="mt-10 mb-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-ink">Informe de asistencia</h2>
          {filas.length > 0 && (
            <button
              onClick={() => descargarCsv(filas, `asistencia-gct-${new Date().toISOString().slice(0, 10)}.csv`)}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ink/5"
            >
              <Download size={13} /> Descargar CSV
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-ash">Entrada, salida y horas trabajadas por persona y día.</p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10 bg-white/60">
          {registros === null ? (
            <p className="p-5 text-sm text-ash">Cargando...</p>
          ) : filas.length === 0 ? (
            <p className="p-6 text-center text-sm text-ash">Todavía no hay marcaciones registradas.</p>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-[11px] uppercase tracking-wide text-ash">
                  <th className="px-4 py-2.5 font-medium">Día</th>
                  <th className="px-4 py-2.5 font-medium">Empleado</th>
                  <th className="px-4 py-2.5 font-medium">Entrada</th>
                  <th className="px-4 py-2.5 font-medium">Salida</th>
                  <th className="px-4 py-2.5 font-medium">Horas</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={`${f.fecha}-${f.employeeId}`} className="border-b border-ink/5 last:border-0">
                    <td className="whitespace-nowrap px-4 py-2.5 text-ash">{f.fechaLegible}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-ink">{f.nombre}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-folio-green">
                      {f.entrada ? new Date(f.entrada.registrado_en).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-magenta-deep">
                      {f.salida ? new Date(f.salida.registrado_en).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ink">
                      {f.horasTrabajadas !== null ? `${f.horasTrabajadas.toFixed(1)} h` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {f.algunoFueraDeRango && (
                        <span className="flex items-center gap-1 text-[11px] text-folio-amber" title="Alguna marca fuera del rango de la oficina">
                          <AlertTriangle size={12} /> fuera de rango
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

// Referencia de etiquetas de rol, usada en otras vistas si hace falta.
export { ROL_LABEL };
