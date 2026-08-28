import type { RegistroAsistenciaAdmin } from "./api";

export interface FilaReporte {
  fecha: string; // YYYY-MM-DD
  fechaLegible: string;
  employeeId: number;
  nombre: string;
  rol: string;
  entrada: RegistroAsistenciaAdmin | null;
  salida: RegistroAsistenciaAdmin | null;
  horasTrabajadas: number | null;
  algunoFueraDeRango: boolean;
}

export function agruparPorDiaYEmpleado(registros: RegistroAsistenciaAdmin[]): FilaReporte[] {
  const grupos = new Map<string, FilaReporte>();

  for (const r of registros) {
    const fechaISO = r.registrado_en.slice(0, 10);
    const clave = `${fechaISO}__${r.employee_id}`;

    if (!grupos.has(clave)) {
      grupos.set(clave, {
        fecha: fechaISO,
        fechaLegible: new Date(r.registrado_en).toLocaleDateString("es-CO", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        employeeId: r.employee_id,
        nombre: r.nombre,
        rol: r.rol,
        entrada: null,
        salida: null,
        horasTrabajadas: null,
        algunoFueraDeRango: false,
      });
    }

    const fila = grupos.get(clave)!;
    if (r.tipo === "entrada" && (!fila.entrada || r.registrado_en < fila.entrada.registrado_en)) {
      fila.entrada = r;
    }
    if (r.tipo === "salida" && (!fila.salida || r.registrado_en > fila.salida.registrado_en)) {
      fila.salida = r;
    }
    if (!r.dentro_de_rango) fila.algunoFueraDeRango = true;
  }

  for (const fila of grupos.values()) {
    if (fila.entrada && fila.salida) {
      const ms = new Date(fila.salida.registrado_en).getTime() - new Date(fila.entrada.registrado_en).getTime();
      fila.horasTrabajadas = Math.max(0, ms / 1000 / 60 / 60);
    }
  }

  return Array.from(grupos.values()).sort((a, b) => (a.fecha === b.fecha ? a.nombre.localeCompare(b.nombre) : b.fecha.localeCompare(a.fecha)));
}

function horaDe(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
}

export function aCsv(filas: FilaReporte[]): string {
  const encabezado = ["Fecha", "Empleado", "Rol", "Entrada", "Salida", "Horas trabajadas", "Fuera de rango"];
  const lineas = filas.map((f) =>
    [
      f.fecha,
      f.nombre,
      f.rol,
      f.entrada ? horaDe(f.entrada.registrado_en) : "",
      f.salida ? horaDe(f.salida.registrado_en) : "",
      f.horasTrabajadas !== null ? f.horasTrabajadas.toFixed(2) : "",
      f.algunoFueraDeRango ? "Sí" : "No",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [encabezado.join(","), ...lineas].join("\n");
}

export function descargarCsv(filas: FilaReporte[], nombreArchivo: string) {
  const csv = "﻿" + aCsv(filas); // BOM para que Excel lea bien las tildes
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
