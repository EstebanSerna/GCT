import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { UserPlus, ShieldCheck, ShieldOff, KeyRound, Download, AlertTriangle } from "lucide-react";
import { api, ApiError, type ApiEmpleado, type Rol, type RegistroAsistenciaAdmin } from "../lib/api";
import { agruparPorDiaYEmpleado, descargarCsv } from "../lib/reporte";

const ROL_LABEL: Record<Rol, string> = {
  admin: "Gerente",
  contador: "Contador/a",
  auxiliar: "Auxiliar contable",
};

function NuevoEmpleadoForm({ onCreado }: { onCreado: (e: ApiEmpleado) => void }) {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("contador");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setEnviando(true);
    try {
      const { employee } = await api.crearEmpleado({ nombre, usuario, password, rol });
      onCreado(employee);
      setNombre("");
      setUsuario("");
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
        <span className="font-medium text-ink">Usuario de acceso</span>
        <input
          required
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="diana.restrepo"
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
          placeholder="mínimo 8 caracteres"
          className="rounded-lg border border-ash-light/50 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-magenta"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-ink">Rol</span>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value as Rol)}
          className="rounded-lg border border-ash-light/50 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-magenta"
        >
          <option value="contador">Contador/a</option>
          <option value="auxiliar">Auxiliar contable</option>
          <option value="admin">Gerente</option>
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

function FilaEmpleado({ emp, onCambiado }: { emp: ApiEmpleado; onCambiado: (e: ApiEmpleado) => void }) {
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

  async function resetPassword() {
    const nueva = window.prompt(`Nueva contraseña para ${emp.nombre} (mínimo 8 caracteres):`);
    if (!nueva) return;
    setOcupado(true);
    try {
      const { employee } = await api.actualizarEmpleado(emp.id, { password: nueva });
      onCambiado(employee);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white/60 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{emp.nombre}</p>
        <p className="truncate text-xs text-ash">
          {emp.usuario} · {ROL_LABEL[emp.rol]} {!emp.activo && "· inactivo"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
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

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Empleados y asistencia</h1>
      <p className="mt-2 text-sm text-ash">Crea colaboradores, gestiona accesos y revisa las marcaciones.</p>

      {error && (
        <p className="mt-4 rounded-lg border border-folio-red/30 bg-folio-red/10 px-4 py-3 text-sm text-folio-red">
          {error}
        </p>
      )}

      <section className="mt-8 rounded-xl border border-ink/10 bg-white/60 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Nuevo empleado</h2>
        <div className="mt-4">
          <NuevoEmpleadoForm onCreado={(e) => setEmpleados((prev) => (prev ? [...prev, e] : [e]))} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Equipo</h2>
        <div className="mt-4 flex flex-col gap-2.5">
          {empleados === null ? (
            <p className="text-sm text-ash">Cargando...</p>
          ) : (
            empleados.map((emp) => (
              <FilaEmpleado
                key={emp.id}
                emp={emp}
                onCambiado={(actualizado) =>
                  setEmpleados((prev) => prev?.map((e) => (e.id === actualizado.id ? actualizado : e)) ?? null)
                }
              />
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
