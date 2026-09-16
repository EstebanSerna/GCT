// Descarga CSV genérica, reutilizable en cualquier pantalla que necesite
// exportar una tabla — con BOM para que Excel lea bien las tildes.
export function descargarCsvGenerico(encabezado: string[], filas: (string | number)[][], nombreArchivo: string) {
  const escapar = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lineas = [encabezado.map(escapar).join(","), ...filas.map((f) => f.map(escapar).join(","))];
  const csv = "﻿" + lineas.join("\n");
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
