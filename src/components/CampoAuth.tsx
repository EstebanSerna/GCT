import type { InputHTMLAttributes, ReactNode } from "react";

/**
 * Campo de formulario "burbuja" para las pantallas de login/registro:
 * cápsula redondeada, con un brillo suave al enfocar en vez de un borde
 * fucsia duro.
 */
export function CampoAuth({
  icono,
  label,
  extra,
  className,
  ...inputProps
}: {
  icono: ReactNode;
  label: string;
  extra?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-paper/70">{label}</span>
      <span className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 shadow-inner shadow-black/20 transition-all duration-200 focus-within:border-magenta/25 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_0_5px_rgba(229,19,111,0.13)]">
        <span className="shrink-0 text-paper/40">{icono}</span>
        <input
          {...inputProps}
          className={`campo-auth-input w-full bg-transparent text-sm text-white outline-none placeholder:text-paper/30 ${className ?? ""}`}
        />
        {extra}
      </span>
    </label>
  );
}
