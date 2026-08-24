import type { LucideIcon } from "lucide-react";
import {
  Calculator,
  FileText,
  Receipt,
  Users,
  TrendingUp,
  Building2,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";

export interface Servicio {
  id: string;
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
}

export const serviciosSeed: Servicio[] = [
  {
    id: "s-contabilidad",
    icon: Calculator,
    titulo: "Contabilidad general y outsourcing",
    descripcion:
      "Llevamos tu contabilidad al día, con estados financieros claros y disponibles cuando los necesites.",
  },
  {
    id: "s-renta",
    icon: FileText,
    titulo: "Declaración de renta",
    descripcion:
      "Personas naturales y jurídicas, con planeación previa para que no pagues más de lo que corresponde.",
  },
  {
    id: "s-iva",
    icon: Receipt,
    titulo: "IVA y régimen simple",
    descripcion:
      "Presentación oportuna de IVA, retenciones y pagos del régimen simple de tributación.",
  },
  {
    id: "s-nomina",
    icon: Users,
    titulo: "Nómina y seguridad social",
    descripcion:
      "Liquidación de nómina, prestaciones sociales y aportes a seguridad social sin errores ni atrasos.",
  },
  {
    id: "s-planeacion",
    icon: TrendingUp,
    titulo: "Planeación tributaria",
    descripcion:
      "Estrategias legales para optimizar tu carga fiscal y tomar decisiones informadas durante el año.",
  },
  {
    id: "s-constitucion",
    icon: Building2,
    titulo: "Constitución de empresas",
    descripcion:
      "Formalizamos tu negocio de principio a fin: cámara de comercio, RUT y registros ante la DIAN.",
  },
  {
    id: "s-revisoria",
    icon: ShieldCheck,
    titulo: "Revisoría fiscal y auditoría",
    descripcion:
      "Acompañamiento independiente que da tranquilidad a socios, juntas directivas e inversionistas.",
  },
  {
    id: "s-exogena",
    icon: ClipboardCheck,
    titulo: "Información exógena",
    descripcion:
      "Preparamos y validamos tus reportes exógenos ante la DIAN, sin sorpresas de último momento.",
  },
];
