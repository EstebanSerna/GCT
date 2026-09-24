import { Link } from "react-router-dom";
import { LegalLayout, Pendiente, Seccion } from "../components/marketing/LegalLayout";

export default function Privacidad() {
  return (
    <LegalLayout titulo="Política de Privacidad y Tratamiento de Datos Personales" actualizado="24 de septiembre de 2026">
      <p>
        Esta política explica qué información recopila la plataforma de Gerencia Contable &amp; Tributaria ("GCT"),
        para qué la usa, con quién la comparte y qué derechos tienes sobre ella. Está redactada para coincidir
        exactamente con lo que el sitio y la plataforma hacen hoy — no describe funcionalidades futuras ni
        tratamientos que no ocurren actualmente.
      </p>

      <Seccion titulo="1. Responsable del tratamiento">
        <p>
          Razón social: <Pendiente>razón social completa de GCT</Pendiente>. NIT: <Pendiente>NIT</Pendiente>.
          Domicilio: Cra. 48 #12 Sur-148, Centro Profesional El Crucero, Torre 2, Oficina 102, El Poblado, Medellín,
          Colombia. Representante legal:{" "}
          <Pendiente>nombre del representante legal</Pendiente>. Mientras se confirma un correo dedicado para temas
          de datos personales, puedes escribirnos a través del{" "}
          <a href="/#contacto" className="text-magenta-deep underline underline-offset-2 hover:text-magenta">
            formulario de contacto
          </a>{" "}
          de este sitio.
        </p>
      </Seccion>

      <Seccion titulo="2. Qué datos recopilamos, para qué y con qué fundamento">
        <p>
          <strong>Cuenta de colaborador (equipo interno de GCT).</strong> Al registrarse en el portal interno
          (<code>/registro</code>), un colaborador entrega nombre completo, número de documento, teléfono, correo
          electrónico, una contraseña y, opcionalmente, una foto de perfil. La contraseña se guarda cifrada
          (bcrypt), nunca en texto plano. Finalidad: crear y administrar su cuenta, verificar su identidad y
          asignarle el rol que le corresponde dentro de la plataforma. Fundamento: la relación contractual/laboral
          con GCT y el consentimiento otorgado al registrarse. Todos estos datos son obligatorios, salvo la foto de
          perfil, que es opcional.
        </p>
        <p>
          <strong>Registro de asistencia (equipo interno).</strong> Al marcar entrada o salida desde{" "}
          <code>/asistencia</code>, se recopila la ubicación GPS (latitud y longitud), la precisión reportada por el
          dispositivo y la hora. Finalidad: llevar el control interno de asistencia laboral. Fundamento: la
          relación laboral y el permiso de ubicación que el propio colaborador autoriza en su navegador. El
          colaborador nunca ve en su propia pantalla la distancia calculada a la oficina — ese dato solo lo ve la
          gerencia, en su reporte interno. Un resumen automático (nombre del colaborador, si la marcación quedó
          dentro o fuera del rango esperado, y la hora) se envía por WhatsApp a la gerente general a través de la
          API de WhatsApp Business de Meta — nunca se envían las coordenadas exactas por ese medio.
        </p>
        <p>
          <strong>Información de clientes de la firma.</strong> Dentro de la plataforma interna, los colaboradores
          autorizados de GCT registran y consultan datos de los clientes de la firma (NIT, régimen tributario,
          ciudad, datos de contacto, honorarios, estado de cartera, notas) y suben documentos de soporte (PDF o
          imágenes) que respaldan sus obligaciones tributarias. Finalidad: prestar el servicio contable y
          tributario contratado por cada cliente y darle seguimiento. Fundamento: la ejecución del contrato de
          servicios con cada cliente. Esta información no es pública; solo la ve el personal autorizado de GCT
          según su rol, y los documentos se descargan mediante enlaces temporales que vencen a los 5 minutos.
        </p>
        <p>
          <strong>Formulario de contacto de la página principal.</strong> El formulario que aparece en la portada
          pide nombre, empresa, correo, teléfono, el servicio de interés y un mensaje opcional.{" "}
          <strong>
            Actualmente este formulario no envía esta información a ningún servidor ni la almacena en ningún
            lugar
          </strong>{" "}
          — solo muestra una confirmación en pantalla. Esta política se actualizará el día en que ese formulario
          quede conectado a un sistema real de contacto.
        </p>
        <p>
          <strong>Asistente de conversación (chat).</strong> El texto que escribes en el asistente virtual del
          sitio se envía a Anthropic, el proveedor de la tecnología de inteligencia artificial que genera la
          respuesta, únicamente para producir esa respuesta en el momento. GCT no guarda un historial de estas
          conversaciones en su base de datos.
        </p>
        <p>
          <strong>Portal de clientes (<code>/portal-clientes</code>).</strong> Esta sección es, por ahora, una{" "}
          <strong>vista previa de diseño</strong>: no está conectada a cuentas ni datos reales de clientes. Toda la
          información que se ve ahí es ilustrativa. Esta política se actualizará cuando el portal empiece a operar
          con datos reales.
        </p>
      </Seccion>

      <Seccion titulo="3. A quién compartimos información y transferencias internacionales">
        <ul className="list-disc pl-5">
          <li>
            <strong>Anthropic</strong> (Estados Unidos) — procesa el texto que escribes en el asistente de
            conversación para generar la respuesta.
          </li>
          <li>
            <strong>Meta / WhatsApp Business Cloud API</strong> (Estados Unidos) — recibe el nombre del colaborador
            y si su marcación de asistencia quedó dentro o fuera del rango esperado, para notificar a la gerencia.
          </li>
          <li>
            <strong>Railway</strong> — proveedor de infraestructura en la nube que aloja la base de datos y el
            almacenamiento de documentos de la plataforma. Ubicación exacta del centro de datos:{" "}
            <Pendiente>región de alojamiento a confirmar</Pendiente>.
          </li>
          <li>
            <strong>HostCarriel / StackCP</strong> — aloja el sitio web público.
          </li>
        </ul>
        <p>
          Dado que Anthropic y Meta procesan datos fuera de Colombia, esto puede constituir una transferencia
          internacional de datos personales en los términos del artículo 26 de la Ley 1581 de 2012. El mecanismo
          legal aplicable a esa transferencia (por ejemplo, consentimiento expreso del titular u otra causal
          prevista en la ley) <Pendiente>requiere revisión jurídica</Pendiente> antes de darse por resuelto.
        </p>
      </Seccion>

      <Seccion titulo="4. Cómo protegemos la información">
        <p>
          Las contraseñas se guardan cifradas (bcrypt), la conexión con la plataforma va cifrada (HTTPS), las
          sesiones usan tokens aleatorios que expiran a los 14 días, el acceso a la información de clientes está
          restringido según el rol de cada colaborador, y los documentos de soporte se guardan en un
          almacenamiento privado con enlaces de descarga temporales.
        </p>
      </Seccion>

      <Seccion titulo="5. Cuánto tiempo conservamos la información">
        <p>
          Conservamos la información de colaboradores y clientes mientras la cuenta o la relación de servicio esté
          activa. Un criterio específico de conservación tras la terminación de esa relación{" "}
          <Pendiente>debe definirse, considerando además las obligaciones contables que exige la ley colombiana de
          conservar ciertos documentos por años determinados</Pendiente>.
        </p>
      </Seccion>

      <Seccion titulo="6. Tus derechos">
        <p>
          Como titular de tus datos personales, tienes derecho a conocerlos, actualizarlos, rectificarlos,
          solicitar su supresión y revocar la autorización que hayas otorgado, en los términos del artículo 8 de
          la Ley 1581 de 2012.
        </p>
        <p>
          Para ejercer estos derechos, escríbenos a través del{" "}
          <a href="/#contacto" className="text-magenta-deep underline underline-offset-2 hover:text-magenta">
            formulario de contacto
          </a>{" "}
          de este sitio. Un canal dedicado para solicitudes de datos personales{" "}
          <Pendiente>está por definirse</Pendiente>.
        </p>
      </Seccion>

      <Seccion titulo="7. Menores de edad">
        <p>Este sitio y esta plataforma no están dirigidos a menores de edad, y no recopilamos intencionalmente datos de menores.</p>
      </Seccion>

      <Seccion titulo="8. Cambios a esta política">
        <p>
          Podemos actualizar esta política cuando cambie lo que la plataforma realmente hace. La fecha de la
          última actualización siempre aparece al inicio de esta página.
        </p>
      </Seccion>

      <p className="text-xs text-ash">
        Ver también nuestra{" "}
        <Link to="/cookies" className="text-magenta-deep underline underline-offset-2 hover:text-magenta">
          Política de Cookies
        </Link>{" "}
        y nuestros{" "}
        <Link to="/terminos" className="text-magenta-deep underline underline-offset-2 hover:text-magenta">
          Términos y Condiciones
        </Link>
        .
      </p>
    </LegalLayout>
  );
}
