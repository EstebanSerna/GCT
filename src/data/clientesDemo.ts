import type { Cliente } from "./seed";

// Datos de muestra para previsualizar el diseño de la sección "Clientes"
// antes de cargar la base real de 91 clientes (BasedatosGCT.xlsx). Nombres
// ficticios a propósito — ninguno corresponde a un cliente real de la
// firma. Una vez aprobado el diseño, este archivo se reemplaza por datos
// reales servidos desde la base de datos.
export const clientesDemo: Cliente[] = [
  {
    id: "demo-1",
    nombre: "Agropecuaria Vista Hermosa S.A.S",
    obligaciones: [
      { id: "d1-1", tipo: "Retención en la fuente", obligacion: "Retención en la fuente | Agosto de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-09-09", estado: "pagado" },
      { id: "d1-2", tipo: "Planilla de seguridad social", obligacion: "Planilla de seguridad social | Agosto de 2026 | Decreto 1990 de 06-12-2016 Art.3.2.2.1", vencimiento: "2026-09-08", estado: "pagado" },
      { id: "d1-3", tipo: "Nómina electrónica G4 de 1 a 10 empleados", obligacion: "Nómina electrónica | Agosto de 2026 | Resolución DIAN 000013 de 2021", vencimiento: "2026-09-10", estado: "presentado" },
      { id: "d1-4", tipo: "Retención en la fuente", obligacion: "Retención en la fuente | Septiembre de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-10-09", estado: "pendiente" },
      { id: "d1-5", tipo: "Planilla de seguridad social", obligacion: "Planilla de seguridad social | Septiembre de 2026 | Decreto 1990 de 06-12-2016 Art.3.2.2.1", vencimiento: "2026-10-08", estado: "pendiente" },
      { id: "d1-6", tipo: "IVA bimestral", obligacion: "IVA bimestral | Julio - Agosto de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-09-22", estado: "pendiente" },
      { id: "d1-7", tipo: "RUB - Registro único de Beneficiarios Finales", obligacion: "RUB - Registro único de Beneficiarios Finales | Modificaciones a octubre 1 de 2026 | Res. 164 de 27-12-2021", vencimiento: "2026-10-01", estado: "pendiente" },
      { id: "d1-8", tipo: "Renta Persona Jurídica", obligacion: "Renta Persona Jurídica | Año gravable 2025 (2da Cuota) | Decreto 2229 de 22-12-2023", vencimiento: "2026-06-09", estado: "pagado" },
    ],
  },
  {
    id: "demo-2",
    nombre: "Comercializadora Rio Claro S.A.S.",
    obligaciones: [
      { id: "d2-1", tipo: "Retención en la fuente", obligacion: "Retención en la fuente | Agosto de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-09-09", estado: "pagado" },
      { id: "d2-2", tipo: "Nómina electrónica G3 de 11 a 100 empleados", obligacion: "Nómina electrónica | Agosto de 2026 | Resolución DIAN 000013 de 2021", vencimiento: "2026-09-10", estado: "presentado" },
      { id: "d2-3", tipo: "|Medellín - ICA anual", obligacion: "|Medellín - ICA anual | Año gravable 2025 | Resolución 202550100057 de 09-12-2025", vencimiento: "2026-09-24", estado: "pendiente" },
      { id: "d2-4", tipo: "Retención en la fuente", obligacion: "Retención en la fuente | Septiembre de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-10-09", estado: "pendiente" },
      { id: "d2-5", tipo: "Información exógena nacional persona jurídica y natural", obligacion: "Información exógena nacional | Año gravable 2025 | Resolución 188 de 30-10-2024 Art. 65", vencimiento: "2026-10-30", estado: "pendiente" },
    ],
  },
  {
    id: "demo-3",
    nombre: "Julián Restrepo Ceballos",
    obligaciones: [
      { id: "d3-1", tipo: "Retención en la fuente", obligacion: "Retención en la fuente | Agosto de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-09-09", estado: "pagado" },
      { id: "d3-2", tipo: "Renta Persona Natural", obligacion: "Renta Persona Natural | Año gravable 2025 | Decreto de Plazos 2026", vencimiento: "2026-09-18", estado: "pendiente" },
      { id: "d3-3", tipo: "Retención en la fuente", obligacion: "Retención en la fuente | Septiembre de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-10-09", estado: "pendiente" },
    ],
  },
  {
    id: "demo-4",
    nombre: "Edificio Los Almendros - P.H.",
    obligaciones: [
      { id: "d4-1", tipo: "Retención en la fuente", obligacion: "Retención en la fuente | Agosto de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-09-09", estado: "pagado" },
      { id: "d4-2", tipo: "Retención en la fuente", obligacion: "Retención en la fuente | Septiembre de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-10-09", estado: "pendiente" },
      { id: "d4-3", tipo: "Renovación registro mercantil - Cámara de Comercio", obligacion: "Renovación registro mercantil - Cámara de Comercio | Año gravable 2026 | Art. 33 Código de comercio", vencimiento: "2026-03-31", estado: "pagado" },
    ],
  },
  {
    id: "demo-5",
    nombre: "Inversiones Cuatro Vientos S. en C.",
    obligaciones: [
      { id: "d5-1", tipo: "Retención en la fuente", obligacion: "Retención en la fuente | Agosto de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-09-09", estado: "pagado" },
      { id: "d5-2", tipo: "Impuesto al patrimonio P.J.", obligacion: "Impuesto al patrimonio — tercera cuota | Ley 2277 de 2022 | Decreto de Plazos 2026", vencimiento: "2026-09-14", estado: "pendiente" },
      { id: "d5-3", tipo: "Retención en la fuente", obligacion: "Retención en la fuente | Septiembre de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-10-09", estado: "pendiente" },
      { id: "d5-4", tipo: "IVA cuatrimestral", obligacion: "IVA cuatrimestral | Mayo - Agosto de 2026 | Decreto 2229 de 22-12-2023", vencimiento: "2026-09-22", estado: "pendiente" },
      { id: "d5-5", tipo: "Conciliación Fiscal Persona Jurídica (presenta con renta)", obligacion: "Conciliación Fiscal Persona Jurídica | Año gravable 2025 | Decreto 1625 de 2016 Art. 1.7.1", vencimiento: "2026-06-09", estado: "pagado" },
    ],
  },
];
