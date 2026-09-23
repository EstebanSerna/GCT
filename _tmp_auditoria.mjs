import XLSX from "xlsx";

const wb = XLSX.readFile("C:\\Users\\Usuario\\Downloads\\GCT_Plantilla_Clientes (1).xlsx");
const wsClientes = wb.Sheets["Datos por completar"];
const filas = XLSX.utils.sheet_to_json(wsClientes, { header: 1, defval: "" }).slice(1);

const COLS = [
  "Cliente", "NIT", "TipoPersona", "Regimen", "Ciudad", "Responsable",
  "RevisionEmpresa", "ContactoNombre", "ContactoTelefono", "ContactoCorreo",
  "FechaNacimiento", "ClienteDesde", "Honorarios", "EstadoCartera", "Notas",
];

const registros = filas
  .filter((r) => String(r[0]).trim() !== "") // descarta filas fantasma sin nombre de cliente
  .map((r) => Object.fromEntries(COLS.map((c, i) => [c, r[i]])));

console.log("Filas con nombre de cliente:", registros.length, "de", filas.length, "filas totales en la hoja");

// completitud por columna
console.log("\n--- Completitud por columna ---");
for (const col of COLS) {
  const llenas = registros.filter((r) => String(r[col]).trim() !== "").length;
  console.log(`${col}: ${llenas}/${registros.length}`);
}

// valores unicos de columnas categoricas, para detectar variantes/typos
console.log("\n--- Valores unicos: TipoPersona ---");
console.log([...new Set(registros.map((r) => r.TipoPersona))]);
console.log("\n--- Valores unicos: Responsable ---");
console.log([...new Set(registros.map((r) => r.Responsable))]);
console.log("\n--- Valores unicos: RevisionEmpresa ---");
console.log([...new Set(registros.map((r) => r.RevisionEmpresa))]);
console.log("\n--- Valores unicos: EstadoCartera ---");
console.log([...new Set(registros.map((r) => r.EstadoCartera))]);
console.log("\n--- Valores unicos: Regimen ---");
console.log([...new Set(registros.map((r) => r.Regimen))]);
console.log("\n--- Valores unicos: Ciudad ---");
console.log([...new Set(registros.map((r) => r.Ciudad))]);

// comparar nombres de clientes contra hoja Obligaciones
const wsOblig = wb.Sheets["Obligaciones"];
const filasOblig = XLSX.utils.sheet_to_json(wsOblig, { header: 1, defval: "" }).slice(1);
const clientesEnObligaciones = new Set(filasOblig.map((r) => String(r[0]).trim()).filter(Boolean));
const clientesEnDatos = new Set(registros.map((r) => String(r.Cliente).trim()));

console.log("\nClientes unicos en 'Obligaciones':", clientesEnObligaciones.size);
console.log("Clientes unicos en 'Datos por completar':", clientesEnDatos.size);

const faltanEnDatos = [...clientesEnObligaciones].filter((c) => !clientesEnDatos.has(c));
console.log("\n--- Clientes en Obligaciones pero NO en Datos por completar (" + faltanEnDatos.length + ") ---");
console.log(faltanEnDatos);

const sobranEnDatos = [...clientesEnDatos].filter((c) => !clientesEnObligaciones.has(c));
console.log("\n--- Clientes en Datos por completar pero NO en Obligaciones (" + sobranEnDatos.length + ") ---");
console.log(sobranEnDatos);
