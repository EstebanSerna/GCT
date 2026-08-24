export type Rol = "admin" | "contador" | "auxiliar";

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  iniciales: string;
  usuario: string; // handle de acceso al portal
  password: string; // demo: contraseña en texto plano, no usar así en producción
}

export interface Cliente {
  id: string;
  nombre: string;
  nit: string;
  regimen: string;
  contactoNombre: string;
  contactoTelefono: string;
  contadorId: string;
  proximoVencimiento: string; // fecha legible
  vencimientoDias: number; // dias restantes
  documentosPendientes: string[];
  historial: { fecha: string; accion: string }[];
  notas: string;
}

export interface Tarea {
  id: string;
  clienteId: string;
  contadorId: string;
  titulo: string;
  fechaLimite: string;
  estado: "pendiente" | "en_progreso" | "completada";
  evidenciaNombre?: string;
  evidenciaUrl?: string;
  completadaHora?: string;
}

const DEMO_PASSWORD = "Contable2026";

export const usuarios: Usuario[] = [
  { id: "u-yesica", nombre: "Yesica Zuluaga", rol: "admin", iniciales: "YZ", usuario: "yesica.zuluaga", password: DEMO_PASSWORD },
  { id: "u-camilo", nombre: "Camilo Ruiz", rol: "contador", iniciales: "CR", usuario: "camilo.ruiz", password: DEMO_PASSWORD },
  { id: "u-valentina", nombre: "Valentina Gómez", rol: "contador", iniciales: "VG", usuario: "valentina.gomez", password: DEMO_PASSWORD },
  { id: "u-laura", nombre: "Laura Cifuentes", rol: "contador", iniciales: "LC", usuario: "laura.cifuentes", password: DEMO_PASSWORD },
  { id: "u-andres", nombre: "Andrés Salazar", rol: "auxiliar", iniciales: "AS", usuario: "andres.salazar", password: DEMO_PASSWORD },
  { id: "u-sebastian", nombre: "Sebastián Morales", rol: "auxiliar", iniciales: "SM", usuario: "sebastian.morales", password: DEMO_PASSWORD },
];

export const clientesSeed: Cliente[] = [
  {
    id: "c-textiles",
    nombre: "Textiles La Piel S.A.S.",
    nit: "901.234.567-1",
    regimen: "Régimen ordinario, responsable de IVA",
    contactoNombre: "Marcela Uribe",
    contactoTelefono: "+57 300 555 1122",
    contadorId: "u-camilo",
    proximoVencimiento: "Declaración de IVA — 28 ago",
    vencimientoDias: 6,
    documentosPendientes: ["Certificado bancario julio", "Soportes retención en la fuente"],
    historial: [
      { fecha: "2026-07-15", accion: "Declaración de renta presentada" },
      { fecha: "2026-08-10", accion: "Conciliación bancaria de julio entregada" },
    ],
    notas: "Cliente prefiere comunicación por WhatsApp, no por correo.",
  },
  {
    id: "c-ferreteria",
    nombre: "Ferretería El Tornillo Ltda.",
    nit: "830.112.998-4",
    regimen: "Régimen simple de tributación",
    contactoNombre: "Jorge Peláez",
    contactoTelefono: "+57 301 442 8890",
    contadorId: "u-valentina",
    proximoVencimiento: "Pago bimestral régimen simple — 25 ago",
    vencimientoDias: 3,
    documentosPendientes: ["Extractos bancarios agosto"],
    historial: [
      { fecha: "2026-06-20", accion: "Renovación de matrícula mercantil" },
      { fecha: "2026-08-01", accion: "Nómina de julio procesada" },
    ],
    notas: "Local cambió de sede en julio, actualizar dirección en RUT.",
  },
  {
    id: "c-clinica",
    nombre: "Clínica Sonrisa Plena",
    nit: "900.887.221-6",
    regimen: "Régimen ordinario, gran contribuyente",
    contactoNombre: "Dra. Paula Nieto",
    contactoTelefono: "+57 312 678 2201",
    contadorId: "u-camilo",
    proximoVencimiento: "Autorretención de renta — 30 ago",
    vencimientoDias: 8,
    documentosPendientes: [],
    historial: [
      { fecha: "2026-07-30", accion: "Autorretención de renta presentada a tiempo" },
      { fecha: "2026-08-14", accion: "Revisión de nómina sin novedades" },
    ],
    notas: "Historial impecable, cliente de bajo riesgo.",
  },
  {
    id: "c-restaurante",
    nombre: "Restaurante Sabores del Valle",
    nit: "812.556.330-2",
    regimen: "Régimen simple de tributación",
    contactoNombre: "Esperanza Molina",
    contactoTelefono: "+57 304 221 9087",
    contadorId: "u-laura",
    proximoVencimiento: "Pago bimestral régimen simple — 25 ago",
    vencimientoDias: 3,
    documentosPendientes: ["Facturación de caja agosto", "Planilla seguridad social"],
    historial: [
      { fecha: "2026-06-25", accion: "Pago bimestral anterior presentado con 4 días de retraso" },
      { fecha: "2026-08-05", accion: "Solicitud de soportes enviada, sin respuesta" },
    ],
    notas: "Cliente suele atrasarse en enviar soportes, requiere recordatorios.",
  },
  {
    id: "c-constructora",
    nombre: "Constructora Andes Vivo S.A.S.",
    nit: "900.334.771-9",
    regimen: "Régimen ordinario, responsable de IVA",
    contactoNombre: "Iván Zapata",
    contactoTelefono: "+57 315 990 4432",
    contadorId: "u-valentina",
    proximoVencimiento: "Información exógena — 5 sep",
    vencimientoDias: 14,
    documentosPendientes: ["Contratos de obra firmados", "Detalle de proveedores"],
    historial: [
      { fecha: "2026-05-10", accion: "Exógena del año anterior presentada" },
      { fecha: "2026-07-22", accion: "Reunión de planeación tributaria" },
    ],
    notas: "Solo tiene servicio de declaración de renta, no maneja nómina con nosotros.",
  },
];

export const tareasSeed: Tarea[] = [
  {
    id: "t-1",
    clienteId: "c-textiles",
    contadorId: "u-camilo",
    titulo: "Radicar declaración de IVA bimestral",
    fechaLimite: "Hoy, 5:00 p. m.",
    estado: "pendiente",
  },
  {
    id: "t-2",
    clienteId: "c-clinica",
    contadorId: "u-camilo",
    titulo: "Enviar certificado de retención a la clínica",
    fechaLimite: "Hoy, 3:00 p. m.",
    estado: "completada",
    evidenciaNombre: "certificado_retencion_agosto.pdf",
    completadaHora: "1:47 p. m.",
  },
  {
    id: "t-3",
    clienteId: "c-ferreteria",
    contadorId: "u-valentina",
    titulo: "Consolidar extractos bancarios de agosto",
    fechaLimite: "Hoy, 4:30 p. m.",
    estado: "en_progreso",
  },
  {
    id: "t-4",
    clienteId: "c-constructora",
    contadorId: "u-valentina",
    titulo: "Solicitar contratos de obra firmados",
    fechaLimite: "Mañana, 12:00 p. m.",
    estado: "pendiente",
  },
  {
    id: "t-5",
    clienteId: "c-restaurante",
    contadorId: "u-laura",
    titulo: "Recordar a cliente envío de facturación de caja",
    fechaLimite: "Hoy, 2:00 p. m.",
    estado: "pendiente",
  },
  {
    id: "t-6",
    clienteId: "c-restaurante",
    contadorId: "u-laura",
    titulo: "Presentar pago bimestral régimen simple",
    fechaLimite: "Hoy, 6:00 p. m.",
    estado: "pendiente",
  },
  {
    id: "t-8",
    clienteId: "c-textiles",
    contadorId: "u-andres",
    titulo: "Escanear y organizar soportes de retención de julio",
    fechaLimite: "Hoy, 4:00 p. m.",
    estado: "pendiente",
  },
  {
    id: "t-9",
    clienteId: "c-ferreteria",
    contadorId: "u-sebastian",
    titulo: "Cargar extractos bancarios al sistema contable",
    fechaLimite: "Hoy, 3:30 p. m.",
    estado: "pendiente",
  },
  {
    id: "t-10",
    clienteId: "c-constructora",
    contadorId: "u-sebastian",
    titulo: "Archivar contratos de obra recibidos",
    fechaLimite: "Mañana, 10:00 a. m.",
    estado: "en_progreso",
  },
  {
    id: "t-7",
    clienteId: "c-textiles",
    contadorId: "u-camilo",
    titulo: "Actualizar conciliación bancaria",
    fechaLimite: "Ayer, 5:00 p. m.",
    estado: "completada",
    evidenciaNombre: "conciliacion_julio_textiles.xlsx",
    completadaHora: "Ayer, 4:12 p. m.",
  },
];
