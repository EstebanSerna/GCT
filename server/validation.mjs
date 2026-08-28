// Validaciones compartidas entre registro y restablecimiento de contraseña.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esEmailValido(email) {
  return typeof email === "string" && EMAIL_RE.test(email.trim());
}

/**
 * Contraseña: mínimo 8 caracteres, con al menos una mayúscula, una
 * minúscula, un número y un carácter especial.
 */
export function validarPassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (!/[a-z]/.test(password)) return "La contraseña debe incluir al menos una letra minúscula.";
  if (!/[A-Z]/.test(password)) return "La contraseña debe incluir al menos una letra mayúscula.";
  if (!/[0-9]/.test(password)) return "La contraseña debe incluir al menos un número.";
  if (!/[^A-Za-z0-9]/.test(password)) return "La contraseña debe incluir al menos un carácter especial.";
  return null;
}

export function inicialesDe(nombre) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
