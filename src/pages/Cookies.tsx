import { Link } from "react-router-dom";
import { LegalLayout, Seccion } from "../components/marketing/LegalLayout";

export default function CookiesPolicy() {
  return (
    <LegalLayout titulo="Política de Cookies" actualizado="24 de septiembre de 2026">
      <p>
        Esta página describe, de forma exacta y verificada directamente en el código de la plataforma, qué
        tecnologías de almacenamiento y qué scripts de terceros usa este sitio. No incluye nada que no exista hoy.
      </p>

      <Seccion titulo="1. Este sitio no usa cookies">
        <p>
          Revisamos todo el código del sitio y la plataforma y confirmamos que{" "}
          <strong>no se usa ninguna cookie</strong> (ni propia ni de terceros, ni de análisis, ni publicitarias, ni
          de redes sociales). No existe ningún banner de "aceptar cookies" en este sitio porque no habría nada que
          gestionar con él — mostrar uno sin cookies reales detrás sería, en sí mismo, engañoso.
        </p>
      </Seccion>

      <Seccion titulo="2. Lo que sí usamos: almacenamiento local técnico (localStorage)">
        <p>
          Para que puedas iniciar sesión y permanecer conectado sin escribir tu contraseña en cada página, la
          plataforma guarda algunos valores en el <code>localStorage</code> de tu navegador — una tecnología
          distinta a las cookies, que nunca se envía automáticamente a ningún servidor; solo la lee el propio
          sitio cuando lo necesitas. Estos son exactamente los valores que se guardan:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left font-mono text-[11px] uppercase tracking-wide text-ash">
                <th className="py-2 pr-4">Clave</th>
                <th className="py-2 pr-4">Dónde se usa</th>
                <th className="py-2">Para qué sirve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">gct_token</td>
                <td className="py-2 pr-4">Portal de colaboradores</td>
                <td className="py-2">Mantiene tu sesión activa después de iniciar sesión. Estrictamente necesario.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">gct_admin_token</td>
                <td className="py-2 pr-4">Función "Ver como" del super administrador</td>
                <td className="py-2">
                  Guarda temporalmente la sesión propia de un super administrador mientras audita el sistema desde
                  el perfil de otro colaborador, para poder volver a su cuenta. Estrictamente necesario.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">gct_cliente_demo_id</td>
                <td className="py-2 pr-4">Portal de clientes (vista previa)</td>
                <td className="py-2">
                  Recuerda qué cuenta de demostración quedó "abierta" en la vista previa del portal de clientes.
                  Estrictamente necesario para esa vista previa.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Estos tres valores son <strong>estrictamente necesarios</strong> para que el inicio de sesión funcione —
          por eso, tanto bajo la Resolución 32126 de 2022 de la Superintendencia de Industria y Comercio como bajo
          cualquier otro estándar de consentimiento, no requieren pedirte autorización previa: sin ellos, el
          sitio simplemente no podría mantenerte conectado. Puedes borrarlos en cualquier momento desde la
          configuración de tu navegador; si lo haces, tu sesión se cerrará.
        </p>
      </Seccion>

      <Seccion titulo="3. Recursos externos que sí se cargan al visitar el sitio">
        <p>
          Aunque no son cookies, para ser transparentes: este sitio carga las tipografías de la marca desde{" "}
          <strong>Google Fonts</strong> (<code>fonts.googleapis.com</code> y <code>fonts.gstatic.com</code>). Esto
          hace que tu navegador se conecte a los servidores de Google para descargar esos archivos de fuente cada
          vez que visitas el sitio, de la misma forma en que lo haría al cargar cualquier imagen externa. No se usa
          ningún otro script, pixel, herramienta de analítica, mapa embebido ni chat de terceros — el asistente de
          conversación del sitio es propio y conversa directamente con nuestro servidor.
        </p>
      </Seccion>

      <Seccion titulo="4. Si esto cambia">
        <p>
          Si en el futuro agregamos alguna herramienta que sí use cookies no esenciales (por ejemplo, analítica de
          visitas), actualizaremos esta página con el detalle exacto (proveedor, finalidad, duración) y
          agregaremos el mecanismo correspondiente para que puedas aceptarlas, rechazarlas o configurarlas por
          categoría antes de que se activen.
        </p>
      </Seccion>

      <p className="text-xs text-ash">
        Ver también nuestra{" "}
        <Link to="/privacidad" className="text-magenta-deep underline underline-offset-2 hover:text-magenta">
          Política de Privacidad
        </Link>
        .
      </p>
    </LegalLayout>
  );
}
