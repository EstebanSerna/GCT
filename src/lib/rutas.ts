import type { Rol } from "./api";

/** A dónde va cada rol al iniciar sesión (o si intenta entrar a una ruta que no le corresponde). */
export function rutaInicioPara(rol: Rol): string {
  if (rol === "gerente" || rol === "super_admin") return "/admin";
  if (rol === "lider_equipo") return "/equipo";
  return "/asistencia";
}
