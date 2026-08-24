import React from "react";
import { RingMark } from "../components/Stamp";

function TarjetaFutura({
  titulo,
  eyebrow,
  children,
}: {
  titulo: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-magenta/30 bg-white/40 p-5">
      <span className="absolute right-4 top-4 rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-paper">
        Próximamente
      </span>
      <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-magenta-deep">
        <RingMark size={11} /> {eyebrow}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-ink">{titulo}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Futuro() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ash">La visión completa</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
        Hacia dónde puede crecer el portal
      </h1>
      <p className="mt-2 max-w-xl text-sm text-ash">
        Estas piezas se construyen sobre la misma base de datos de tareas y clientes que ya está funcionando.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TarjetaFutura eyebrow="Asistente interno" titulo="Dudas de normativa al instante">
          <div className="flex flex-col gap-2 rounded-lg bg-ink/5 p-3">
            <div className="max-w-[85%] self-end rounded-lg rounded-br-sm bg-magenta px-3 py-2 text-xs text-white">
              ¿Cuál es el plazo para el pago bimestral del régimen simple este mes?
            </div>
            <div className="max-w-[85%] self-start rounded-lg rounded-bl-sm bg-white px-3 py-2 text-xs text-ink">
              Vence el 25 de agosto para los NIT terminados en número par.
            </div>
          </div>
        </TarjetaFutura>

        <TarjetaFutura eyebrow="Crecimiento" titulo="Alertas de venta cruzada">
          <div className="rounded-lg border border-folio-amber/30 bg-folio-amber/5 p-3">
            <p className="text-xs font-medium text-ink">Textiles La Piel S.A.S.</p>
            <p className="mt-1 text-xs text-ash">
              Tiene declaración de renta con nosotros, pero procesa su nómina por fuera. Podría interesarle el servicio de nómina.
            </p>
          </div>
        </TarjetaFutura>

        <TarjetaFutura eyebrow="Gerencia" titulo="Reporte ejecutivo mensual">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-ink/5 p-2.5 text-center">
              <p className="font-mono text-lg font-semibold text-ink">32</p>
              <p className="text-[10px] text-ash">clientes atendidos</p>
            </div>
            <div className="rounded-lg bg-ink/5 p-2.5 text-center">
              <p className="font-mono text-lg font-semibold text-folio-green">94%</p>
              <p className="text-[10px] text-ash">a tiempo</p>
            </div>
            <div className="rounded-lg bg-ink/5 p-2.5 text-center">
              <p className="font-mono text-lg font-semibold text-magenta-deep">+18%</p>
              <p className="text-[10px] text-ash">carga vs. mes anterior</p>
            </div>
          </div>
        </TarjetaFutura>

        <TarjetaFutura eyebrow="Cliente final" titulo="Portal para tus clientes">
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-medium text-ink">Ferretería El Tornillo Ltda.</p>
            <p className="mt-1 text-[11px] text-ash">Sube tus extractos bancarios de agosto</p>
            <div className="mt-2 rounded-md border-2 border-dashed border-ash-light px-3 py-3 text-center text-[11px] text-ash">
              Arrastrar archivo aquí
            </div>
          </div>
        </TarjetaFutura>
      </div>
    </div>
  );
}
