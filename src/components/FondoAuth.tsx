// Fondo decorativo compartido por las pantallas de acceso (login y registro).
// En vez del bg-ink plano de antes, capa varias texturas sutiles para darle
// cuerpo: grano de papel, una cuadrícula fina tipo hoja contable, el resplandor
// magenta de marca y el anillo del logo como marca de agua gigante.
export function FondoAuth() {
  return (
    <>
      {/* Grano de papel — capa de textura fina, casi imperceptible, que le quita
          la planitud al negro sólido */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay" aria-hidden>
        <filter id="granoAuth">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#granoAuth)" />
      </svg>

      {/* Cuadrícula fina, como el papel milimetrado de una hoja de trabajo contable */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(247,244,239,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(247,244,239,0.6) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(ellipse at center, black 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 75%)",
        }}
        aria-hidden
      />

      {/* Resplandores de marca */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-magenta opacity-20 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-magenta-soft opacity-10 blur-[100px]"
        aria-hidden
      />

      {/* Anillo del logo, en grande, como marca de agua en la esquina */}
      <svg
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -bottom-24 -right-24 h-[520px] w-[520px] text-paper/[0.06] sm:h-[620px] sm:w-[620px]"
        aria-hidden
      >
        <path d="M154.2 70.8A62.5 62.5 0 1 0 165 125" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </svg>
      <svg
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -left-20 -top-20 hidden h-72 w-72 text-magenta-soft/[0.07] sm:block"
        aria-hidden
      >
        <path d="M154.2 70.8A62.5 62.5 0 1 0 165 125" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </svg>

      {/* Viñeta suave para que el ojo se vaya al centro, hacia la tarjeta */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(31,29,30,0.55) 100%)" }}
        aria-hidden
      />
    </>
  );
}
