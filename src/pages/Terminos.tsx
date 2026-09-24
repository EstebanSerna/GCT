import { Link } from "react-router-dom";
import { LegalLayout, Pendiente, Seccion } from "../components/marketing/LegalLayout";

export default function Terminos() {
  return (
    <LegalLayout titulo="Términos y Condiciones" actualizado="24 de septiembre de 2026">
      <Seccion titulo="1. Identificación">
        <p>
          Este sitio es operado por Gerencia Contable &amp; Tributaria ("GCT"). Razón social:{" "}
          <Pendiente>razón social completa</Pendiente>. NIT: <Pendiente>NIT</Pendiente>. Domicilio: Cra. 48 #12
          Sur-148, Centro Profesional El Crucero, Torre 2, Oficina 102, El Poblado, Medellín, Colombia.
        </p>
      </Seccion>

      <Seccion titulo="2. Objeto del sitio">
        <p>
          Este sitio tiene dos partes: (a) una parte pública, que informa sobre los servicios contables y
          tributarios de GCT y permite solicitar contacto con un asesor; y (b) una plataforma de acceso
          restringido para el equipo de GCT (y, en el futuro, para clientes con cuenta propia), donde se
          gestionan clientes, obligaciones tributarias y documentos de soporte.
        </p>
      </Seccion>

      <Seccion titulo="3. Uso permitido">
        <p>
          No está permitido usar este sitio para fines ilícitos, intentar vulnerar su seguridad, acceder sin
          autorización a cuentas ajenas, ni usar la plataforma interna para un propósito distinto al servicio
          contable y tributario para el que fue creada. Las cuentas de acceso a la plataforma interna son
          personales e intransferibles.
        </p>
      </Seccion>

      <Seccion titulo="4. Propiedad intelectual">
        <p>
          La marca, el logotipo, los textos y el diseño de este sitio son propiedad de GCT, salvo que se indique
          expresamente lo contrario. No está permitido reproducirlos, copiarlos o usarlos sin autorización previa
          y escrita.
        </p>
      </Seccion>

      <Seccion titulo="5. Servicios y precios">
        <p>
          Los servicios descritos en este sitio (contabilidad, nómina, planeación tributaria y afines) son una
          descripción general. El alcance, las tarifas y las condiciones específicas de cada servicio se definen
          mediante una propuesta comercial particular con cada cliente — este sitio no publica precios ni permite
          realizar compras o pagos en línea.
        </p>
      </Seccion>

      <Seccion titulo="6. Proceso de contratación">
        <p>
          El proceso de contratación no ocurre dentro de este sitio: se inicia cuando nos escribes por el
          formulario de contacto o por WhatsApp, seguimos con un diagnóstico inicial sin costo, y formalizamos el
          servicio mediante una propuesta y un contrato aparte de este sitio web.
        </p>
      </Seccion>

      <Seccion titulo="7. Disponibilidad">
        <p>
          El sitio y la plataforma pueden no estar disponibles de forma ininterrumpida por mantenimiento,
          actualizaciones o causas fuera de nuestro control. No garantizamos disponibilidad continua.
        </p>
      </Seccion>

      <Seccion titulo="8. Responsabilidad">
        <p>
          El contenido de este sitio es de carácter informativo y no constituye asesoría tributaria, contable o
          legal vinculante por sí sola — la asesoría formal se presta en el marco del contrato de servicios que
          se firme con cada cliente. GCT no garantiza resultados específicos frente a la DIAN u otras autoridades
          más allá de lo expresamente pactado en cada contrato.
        </p>
      </Seccion>

      <Seccion titulo="9. Enlaces externos">
        <p>
          Este sitio puede enlazar a servicios de terceros (por ejemplo, WhatsApp). GCT no controla ni se hace
          responsable por el contenido o las prácticas de esos servicios externos.
        </p>
      </Seccion>

      <Seccion titulo="10. Modificaciones">
        <p>
          Podemos actualizar estos Términos y Condiciones cuando cambien las condiciones del sitio o del servicio.
          La fecha de la última actualización siempre aparece al inicio de esta página.
        </p>
      </Seccion>

      <Seccion titulo="11. Legislación aplicable y jurisdicción">
        <p>
          Estos términos se rigen por las leyes de la República de Colombia. Para cualquier controversia, las
          partes se someten a los jueces y tribunales competentes de Medellín, domicilio de GCT — la redacción
          exacta de esta cláusula <Pendiente>debe confirmarse con un abogado</Pendiente> antes de considerarla
          definitiva.
        </p>
      </Seccion>

      <Seccion titulo="12. Contacto">
        <p>
          Para cualquier pregunta sobre estos términos, escríbenos a través del{" "}
          <a href="/#contacto" className="text-magenta-deep underline underline-offset-2 hover:text-magenta">
            formulario de contacto
          </a>{" "}
          de este sitio.
        </p>
      </Seccion>

      <p className="text-xs text-ash">
        Este sitio no procesa pagos ni ventas en línea, por lo que no publicamos una Política de Reembolsos o
        Cancelación — si eso cambia, esta página y una política específica se actualizarán en consecuencia. Ver
        también nuestra{" "}
        <Link to="/privacidad" className="text-magenta-deep underline underline-offset-2 hover:text-magenta">
          Política de Privacidad
        </Link>{" "}
        y nuestra{" "}
        <Link to="/cookies" className="text-magenta-deep underline underline-offset-2 hover:text-magenta">
          Política de Cookies
        </Link>
        .
      </p>
    </LegalLayout>
  );
}
