// Envía la notificación de asistencia a la gerente por WhatsApp, usando la
// API oficial de Meta (WhatsApp Business Cloud API). Requiere una plantilla
// de mensaje ya aprobada por Meta (ver README.md para el texto exacto y la
// guía de configuración).
const GRAPH_API_VERSION = "v21.0";

function isConfigured() {
  return Boolean(
    process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.MANAGER_WHATSAPP_NUMBER
  );
}

/**
 * Notifica a la gerente que un empleado marcó entrada o salida.
 * No lanza errores hacia arriba: si falla, solo lo registra en el log —
 * un problema notificando por WhatsApp nunca debe impedir que el
 * empleado registre su asistencia.
 */
export async function notificarAsistencia({ nombreEmpleado, tipo, horaTexto, dentroDeRango, logger = console }) {
  if (!isConfigured()) {
    logger.warn(
      "[whatsapp] No configurado (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID / MANAGER_WHATSAPP_NUMBER) — se omite la notificación."
    );
    return;
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "registro_asistencia";
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || "es_CO";
  const accion = tipo === "entrada" ? "llegó a la oficina" : "salió de la oficina";
  const nota = dentroDeRango ? "" : " (fuera del rango esperado)";

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: process.env.MANAGER_WHATSAPP_NUMBER,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLang },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: nombreEmpleado },
                { type: "text", text: `${accion}${nota}` },
                { type: "text", text: horaTexto },
              ],
            },
          ],
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logger.error(`[whatsapp] Error ${res.status} enviando notificación: ${body}`);
    }
  } catch (err) {
    logger.error(`[whatsapp] Error de red enviando notificación: ${String(err)}`);
  }
}
