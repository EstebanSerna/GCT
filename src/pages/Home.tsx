import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Quote,
  UserCheck,
  ShieldCheck,
  LayoutDashboard,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { MarketingNav } from "../components/marketing/MarketingNav";
import { MarketingFooter } from "../components/marketing/MarketingFooter";
import { ChatWidget } from "../components/marketing/ChatWidget";
import { RingMark } from "../components/Stamp";
import { serviciosSeed } from "../data/servicios";
import logoMark from "../assets/logo-mark.png";

const STATS = [
  { valor: "+120", etiqueta: "empresas asesoradas" },
  { valor: "12 años", etiqueta: "de experiencia" },
  { valor: "94%", etiqueta: "declaraciones a tiempo" },
];

const CLIENTES_LOGO = [
  "Textiles La Piel",
  "Ferretería El Tornillo",
  "Clínica Sonrisa Plena",
  "Sabores del Valle",
  "Constructora Andes Vivo",
];

const VALORES = [
  {
    icon: BadgeCheck,
    titulo: "Experiencia comprobada",
    descripcion: "Más de una década acompañando empresas de comercio, servicios e industria en Colombia.",
  },
  {
    icon: ShieldCheck,
    titulo: "Cumplimiento sin sobresaltos",
    descripcion: "Te avisamos de cada vencimiento antes de que llegue, para que nunca pagues una sanción evitable.",
  },
  {
    icon: UserCheck,
    titulo: "Acompañamiento cercano",
    descripcion: "Un contador asignado a tu cuenta, disponible por WhatsApp, no un buzón genérico.",
  },
  {
    icon: LayoutDashboard,
    titulo: "Portal digital propio",
    descripcion: "Sigue el estado de tus trámites y documentos en tiempo real desde nuestra plataforma.",
  },
];

const PASOS = [
  {
    numero: "01",
    titulo: "Cuéntanos tu necesidad",
    descripcion: "Escríbenos por el formulario o WhatsApp y cuéntanos en qué punto está tu empresa.",
  },
  {
    numero: "02",
    titulo: "Diagnóstico gratuito",
    descripcion: "Revisamos tu situación contable y tributaria actual, sin costo ni compromiso.",
  },
  {
    numero: "03",
    titulo: "Propuesta a la medida",
    descripcion: "Te presentamos un plan claro, con alcance y tarifa definidos desde el inicio.",
  },
  {
    numero: "04",
    titulo: "Acompañamiento continuo",
    descripcion: "Empiezas con un contador asignado y visibilidad total desde el primer día.",
  },
];

const TESTIMONIOS = [
  {
    cita: "Desde que Gerencia Contable & Tributaria lleva nuestra contabilidad, nunca más se nos ha pasado un vencimiento.",
    nombre: "Marcela Uribe",
    empresa: "Textiles La Piel S.A.S.",
  },
  {
    cita: "El acompañamiento es cercano: entienden nuestro negocio y responden rápido por WhatsApp cuando los necesitamos.",
    nombre: "Jorge Peláez",
    empresa: "Ferretería El Tornillo Ltda.",
  },
  {
    cita: "La planeación tributaria que nos hicieron nos ayudó a tomar mejores decisiones durante todo el año.",
    nombre: "Dra. Paula Nieto",
    empresa: "Clínica Sonrisa Plena",
  },
];

function LeadForm() {
  const [enviado, setEnviado] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Demo: no hay backend conectado; solo confirmamos la intención de contacto.
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-folio-green/30 bg-folio-green/5 px-6 py-14 text-center">
        <CheckCircle2 size={34} className="text-folio-green" />
        <h3 className="mt-4 font-display text-xl font-semibold text-ink">¡Listo, recibimos tu solicitud!</h3>
        <p className="mt-2 max-w-sm text-sm text-ash">
          Un asesor te contactará en menos de 24 horas hábiles para agendar tu diagnóstico gratuito.
        </p>
        <button
          onClick={() => setEnviado(false)}
          className="mt-5 text-sm font-medium text-magenta-deep hover:underline"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">Nombre completo</span>
        <input
          required
          type="text"
          placeholder="Tu nombre"
          className="rounded-lg border border-ash-light/50 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-magenta"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">Empresa</span>
        <input
          type="text"
          placeholder="Nombre de tu empresa"
          className="rounded-lg border border-ash-light/50 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-magenta"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">Correo electrónico</span>
        <input
          required
          type="email"
          placeholder="tucorreo@empresa.com"
          className="rounded-lg border border-ash-light/50 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-magenta"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">Teléfono</span>
        <input
          required
          type="tel"
          placeholder="+57 300 000 0000"
          className="rounded-lg border border-ash-light/50 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-magenta"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="font-medium text-ink">¿Qué necesitas?</span>
        <select className="rounded-lg border border-ash-light/50 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-magenta">
          {serviciosSeed.map((s) => (
            <option key={s.id}>{s.titulo}</option>
          ))}
          <option>Otro</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="font-medium text-ink">Cuéntanos un poco más (opcional)</span>
        <textarea
          rows={3}
          placeholder="¿En qué podemos ayudarte?"
          className="resize-none rounded-lg border border-ash-light/50 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-magenta"
        />
      </label>
      <button
        type="submit"
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-magenta to-magenta-deep px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-magenta/25 transition-transform hover:scale-[1.01] hover:shadow-magenta/35 sm:col-span-2"
      >
        Solicitar diagnóstico gratuito <ArrowRight size={16} />
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div id="inicio" className="min-h-screen overflow-x-clip bg-paper">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink px-6 pb-16 pt-16 text-paper md:pb-24 md:pt-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #F7F4EF 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-magenta opacity-25 blur-[130px]" />
        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-magenta-soft opacity-[0.12] blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-magenta-deep opacity-20 blur-[110px]" />
        <img
          src={logoMark}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[32rem] w-[32rem] rotate-12 object-contain opacity-[0.05] md:-right-16 md:-top-32"
        />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
          <span className="flex items-center gap-1.5 rounded-full border border-paper/15 bg-white/[0.06] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-paper/60 backdrop-blur">
            <Sparkles size={12} className="text-magenta-soft" /> Contabilidad &amp; impuestos, sin dolores de cabeza
          </span>

          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.1] text-white sm:text-5xl md:text-6xl">
            Tu contabilidad al día, tus impuestos en orden y{" "}
            <span className="bg-gradient-to-r from-magenta via-magenta to-magenta-soft bg-clip-text text-transparent">
              un equipo que responde
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base text-paper/60 md:text-lg">
            Acompañamos a empresas colombianas en contabilidad, nómina y planeación tributaria,
            con un contador asignado y visibilidad total de cada trámite.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-magenta to-magenta-deep px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-magenta/25 transition-transform hover:scale-[1.02]"
            >
              Agenda tu diagnóstico gratuito <ArrowRight size={16} />
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-paper/20 px-6 py-3.5 text-sm font-semibold text-paper/80 backdrop-blur transition-colors hover:bg-white/5 hover:text-white"
            >
              Ver servicios
            </a>
          </div>

          <div className="mt-16 grid w-full max-w-lg grid-cols-3 gap-4 border-t border-paper/10 pt-8">
            {STATS.map((s) => (
              <div key={s.etiqueta}>
                <p className="bg-gradient-to-br from-white to-paper/70 bg-clip-text font-display text-2xl font-semibold text-transparent sm:text-3xl">
                  {s.valor}
                </p>
                <p className="mt-1 text-[11px] text-paper/45 sm:text-xs">{s.etiqueta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tira de confianza */}
      <section className="border-b border-ash-light/20 bg-paper px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-ash">
            Empresas que ya confían en nosotros
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {CLIENTES_LOGO.map((c) => (
              <span key={c} className="font-display text-sm font-semibold text-ash-light">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="relative overflow-hidden px-6 py-20">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-magenta-soft opacity-25 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-magenta-deep">
              <RingMark size={11} /> Lo que hacemos
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Servicios contables y tributarios</h2>
            <p className="mt-3 text-sm text-ash">
              Todo lo que tu empresa necesita para operar tranquila frente a la DIAN, en un solo equipo.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {serviciosSeed.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className="group rounded-xl bg-gradient-to-br from-ash-light/30 via-ash-light/10 to-transparent p-[1px] transition-transform hover:-translate-y-1"
                >
                  <div className="h-full rounded-[11px] bg-white p-5 transition-shadow duration-300 group-hover:shadow-[0_20px_45px_-20px_rgba(229,19,111,0.35)]">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-magenta/15 to-magenta-soft/40 text-magenta-deep transition-colors group-hover:from-magenta group-hover:to-magenta-deep group-hover:text-white">
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-4 font-display text-base font-semibold text-ink">{s.titulo}</h3>
                    <p className="mt-1.5 text-sm text-ash">{s.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Por qué nosotros */}
      <section id="nosotros" className="relative overflow-hidden bg-ink-soft px-6 py-20 text-paper">
        <div className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-magenta opacity-[0.15] blur-[120px]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-magenta">
              <RingMark size={11} /> Por qué elegirnos
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white">
              Menos trámites en tu cabeza, más tiempo para tu negocio
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALORES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.titulo}
                  className="relative overflow-hidden rounded-xl border border-paper/10 bg-white/[0.03] p-5 transition-colors hover:border-magenta/30 hover:bg-white/[0.05]"
                >
                  <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magenta-soft/70 to-transparent" />
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-magenta/25 to-magenta-soft/20 text-magenta-soft">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-white">{v.titulo}</h3>
                  <p className="mt-1.5 text-sm text-paper/55">{v.descripcion}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section id="proceso" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-magenta-deep">
              <RingMark size={11} /> Cómo trabajamos
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">De la primera conversación al acompañamiento continuo</h2>
          </div>

          <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-magenta/30 to-transparent lg:block" />
            {PASOS.map((p) => (
              <div key={p.numero} className="relative">
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-magenta to-magenta-deep font-display text-sm font-semibold text-white shadow-lg shadow-magenta/25">
                  {p.numero}
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{p.titulo}</h3>
                <p className="mt-1.5 text-sm text-ash">{p.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="relative overflow-hidden bg-ink px-6 py-20 text-paper">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-magenta-soft opacity-[0.1] blur-[130px]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-magenta">
              <RingMark size={11} /> Clientes que confían en nosotros
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white">Empresas que ya duermen tranquilas</h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {TESTIMONIOS.map((t) => (
              <div
                key={t.nombre}
                className="relative overflow-hidden rounded-xl border border-paper/10 bg-white/[0.03] p-6 transition-colors hover:border-magenta/25"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-magenta opacity-10 blur-2xl" />
                <Quote size={20} className="text-magenta-soft" />
                <p className="mt-4 text-sm leading-relaxed text-paper/75">&ldquo;{t.cita}&rdquo;</p>
                <p className="mt-5 text-sm font-medium text-white">{t.nombre}</p>
                <p className="text-xs text-paper/45">{t.empresa}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto / captación */}
      <section id="contacto" className="relative overflow-hidden bg-paper-dim px-6 py-20">
        <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-magenta-soft opacity-40 blur-[130px]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-magenta-deep">
              <RingMark size={11} /> Hablemos
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
              Agenda un diagnóstico gratuito de tu empresa
            </h2>
            <p className="mt-3 max-w-md text-sm text-ash">
              Cuéntanos en qué punto está tu contabilidad y tus impuestos. Te respondemos en menos de 24 horas
              hábiles con una propuesta clara, sin letra pequeña.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {[
                "Diagnóstico inicial sin costo",
                "Propuesta a la medida de tu empresa",
                "Contador asignado desde el primer día",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-ink">
                  <CheckCircle2 size={17} className="shrink-0 text-folio-green" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-magenta/25 via-ash-light/20 to-transparent p-[1px] shadow-xl shadow-magenta/10">
            <div className="rounded-[15px] bg-white p-6 sm:p-8">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />

      <ChatWidget />
    </div>
  );
}
