// Formato consistente para nombres de personas en toda la app — inicial en
// mayúscula, resto en minúscula, sin importar cómo se haya escrito
// originalmente (todo en mayúsculas, todo en minúsculas, mezclado). Los
// conectores ("de", "del", "la"...) van en minúscula salvo al inicio, y las
// siglas de razón social conocidas (S.A.S, LTDA, P.H...) se preservan tal
// cual — convertirlas a "S.a.s" se vería peor, no mejor.
const CONECTORES = new Set(["de", "del", "la", "las", "los", "y", "en"]);

const SIGLAS_CONOCIDAS = new Set([
  "SAS", "SA", "LTDA", "CIA", "LLC", "INC", "PH", "EU", "SCA", "SENC",
]);

function esSiglaConocida(palabra: string) {
  return SIGLAS_CONOCIDAS.has(palabra.replace(/\./g, "").toUpperCase());
}

export function formatoNombre(nombre: string): string {
  if (!nombre) return nombre;
  return nombre
    .trim()
    .split(/\s+/)
    .map((palabra, i) => {
      if (esSiglaConocida(palabra)) return palabra.toUpperCase();
      const limpio = palabra.toLowerCase();
      if (i > 0 && CONECTORES.has(limpio)) return limpio;
      return limpio.replace(/^\p{L}/u, (letra) => letra.toUpperCase());
    })
    .join(" ");
}
