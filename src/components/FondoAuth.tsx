import logo from "../assets/logo-mark.png";

// Fondo decorativo compartido por las pantallas de acceso (login y registro).
// Un fondo oscuro con textura de grano muy sutil, el resplandor magenta de
// marca y el propio isotipo de GCT como marca de agua gigante — nada de
// formas inventadas que no se parezcan al logo real.
export function FondoAuth() {
  return (
    <>
      {/* Grano de papel — textura fina, casi imperceptible, que le quita
          la planitud al negro sólido sin ensuciar el fondo */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay" aria-hidden>
        <filter id="granoAuth">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#granoAuth)" />
      </svg>

      {/* Resplandores de marca */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-magenta opacity-20 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-magenta-soft opacity-10 blur-[100px]"
        aria-hidden
      />

      {/* El isotipo real de GCT, gigante y tenue, como marca de agua */}
      <img
        src={logo}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -right-28 h-[440px] w-[440px] object-contain opacity-[0.07] sm:h-[560px] sm:w-[560px]"
      />

      {/* Viñeta suave para que el ojo se vaya al centro, hacia la tarjeta */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(31,29,30,0.55) 100%)" }}
        aria-hidden
      />
    </>
  );
}
