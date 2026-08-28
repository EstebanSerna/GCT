# Gerencia Contable & Tributaria (demo)

Sitio comercial + portal interno para una firma de contadores. Incluye una
página pública con embudo de captación de clientes y un asistente de IA,
un portal interno de seguimiento de tareas y clientes, y una app (PWA,
instalable en iOS y Android) para que el equipo marque entrada y salida
con verificación de ubicación GPS.

## Cómo correrlo en local

```
npm install
npm run dev
```

Luego abre http://localhost:5173 en el navegador.

### Asistente de IA (opcional)

El botón flotante del sitio público responde con IA real (API de
Anthropic / Claude). Para activarlo:

```
cp .env.example .env
```

Y pega tu clave de https://console.anthropic.com/settings/keys en
`ANTHROPIC_API_KEY`. Reinicia `npm run dev` después de editar `.env`. Sin
clave configurada, el asistente responde con un mensaje de error
amigable en vez de fallar la app — el resto del sitio funciona igual.

La lógica del asistente vive en [server/chatHandler.mjs](server/chatHandler.mjs)
(compartida entre el middleware de Vite para desarrollo,
[server/devPlugin.mjs](server/devPlugin.mjs), y el servidor de producción,
[server/prod.mjs](server/prod.mjs)), e incluye un límite básico de
solicitudes por IP y de longitud de mensajes, pensado para una demo
pública.

## Qué probar

### Sitio público (`/`)

Página comercial con servicios, propuesta de valor, proceso de trabajo,
testimonios y un formulario de captación de leads (sin backend real: solo
confirma la intención de contacto). El botón flotante rosa abre el
asistente de IA para preguntas generales de contabilidad e impuestos en
Colombia.

### Portal de colaboradores (`/portal`)

Login con usuario y contraseña (todos con la misma clave demo):

| Usuario | Rol |
|---|---|
| `yesica.zuluaga` | Gerente |
| `camilo.ruiz`, `valentina.gomez`, `laura.cifuentes` | Contador/a |
| `andres.salazar`, `sebastian.morales` | Auxiliar contable |

Contraseña para todos: `Contable2026`

- **Gerente** → panel de gerencia: semáforo de riesgo por cliente, carga
  de trabajo del equipo, y el resumen que llegaría a WhatsApp al final
  del día.
- **Contador/a o auxiliar** → lista de tareas del día por cliente. Al
  marcar una tarea como hecha, el sistema exige adjuntar un archivo de
  evidencia antes de confirmar.
- Desde cualquier rol, entra a "Clientes" para ver la hoja de vida
  completa de cada empresa (régimen tributario, vencimientos,
  documentos pendientes, historial).
- "Próximamente" muestra la visión de hacia dónde puede crecer el
  portal: alertas de venta cruzada, reporte ejecutivo mensual, y portal
  para que el cliente final suba documentos.

Los datos de clientes y tareas son ficticios (demo, no persisten). Los
**empleados, sesiones y marcaciones de asistencia sí son reales**, guardados
en Postgres — ver la sección de abajo.

## App de asistencia (entrada/salida con GPS)

"Marcar asistencia" (visible para todos los roles tras iniciar sesión) pide
ubicación GPS y registra la hora de entrada/salida, comparando la distancia
a la oficina configurada en el servidor (`OFFICE_LAT`/`OFFICE_LNG`/
`OFFICE_RADIUS_METERS`, ver `.env.example`). El gerente gestiona el equipo
desde "Empleados": crear cuentas (usuario + contraseña), desactivar
accesos, restablecer contraseñas, y ver las marcaciones de todos.

Es una **PWA instalable**: desde el navegador (Safari en iOS, Chrome en
Android) → "Agregar a pantalla de inicio" — queda como una app con ícono
propio, sin pasar por App Store ni Play Store.

Este backend (`server/auth.mjs`, `server/attendance.mjs`,
`server/employees.mjs`, `server/db.mjs`) usa una base de datos Postgres real
y solo corre en producción — el servidor de desarrollo local
(`server/devPlugin.mjs`) no lo incluye, porque no hay una base de datos
local configurada. Para probarlo hay que hacerlo contra el backend
desplegado.

### Notificación por WhatsApp a la gerente

Cada vez que alguien marca entrada o salida, `server/whatsapp.mjs` le manda un
WhatsApp a la gerente con la API oficial de Meta (WhatsApp Business Cloud
API). Si las variables de entorno no están configuradas, simplemente se
omite el envío — nunca bloquea ni rompe el registro de asistencia.

**Configurar Meta desde cero:**

1. Entra a https://developers.facebook.com/ con tu cuenta de Facebook →
   **Mis apps** → **Crear app** → tipo **"Negocios"** → nómbrala, por
   ejemplo, "GCT Asistencia".
2. Dentro de la app, agrega el producto **WhatsApp**.
3. En **WhatsApp → Configuración de la API**, Meta te da automáticamente un
   **número de prueba gratuito** (no hace falta verificar un negocio para
   empezar). Ahí mismo:
   - Agrega el número de WhatsApp de la gerente como destinatario de
     prueba y verifícalo con el código que le llega por SMS/llamada.
   - Copia el **Phone Number ID** que aparece en el panel.
4. El token que se ve ahí por defecto **vence en 24 horas** — no sirve para
   el servidor. Genera uno permanente: **Configuración del negocio** (Meta
   Business Suite) → **Usuarios → Usuarios del sistema** → crear uno nuevo
   → asígnale la app de WhatsApp con permiso de administrar → **Generar
   token**, marcando el permiso `whatsapp_business_messaging`, sin fecha
   de vencimiento.
5. Crea la plantilla de mensaje (obligatoria para poder escribirle primero
   a alguien, sin que ellos te hayan escrito antes): en **WhatsApp
   Manager** → **Plantillas de mensajes** → **Crear plantilla**:
   - Categoría: **Utilidad**
   - Nombre: `registro_asistencia` (si usas otro nombre, ajusta
     `WHATSAPP_TEMPLATE_NAME` más abajo)
   - Idioma: Español (CO)
   - Cuerpo del mensaje, con 3 variables:
     ```
     Registro de asistencia: {{1}} {{2}} a las {{3}}.
     ```
   - Envíala a revisión. Con categoría "Utilidad" y este texto tan simple,
     normalmente la aprueban en minutos u horas.
6. Con todo aprobado, agrega estas variables en el panel de Railway
   (**nunca** en este repositorio):

   | Variable | Valor |
   |---|---|
   | `WHATSAPP_TOKEN` | el token permanente del paso 4 |
   | `WHATSAPP_PHONE_NUMBER_ID` | el Phone Number ID del paso 3 |
   | `WHATSAPP_TEMPLATE_NAME` | `registro_asistencia` (o el nombre que usaste) |
   | `MANAGER_WHATSAPP_NUMBER` | número de la gerente en formato internacional sin "+" ni espacios, ej. `573001234567` |

El número de prueba de Meta solo puede escribirle a los destinatarios que
agregues y verifiques manualmente en la consola (perfecto para este caso,
ya que solo se notifica a la gerente). Si en el futuro se necesita enviar
a más números o de forma abierta, hay que verificar un número de WhatsApp
Business real dentro de un Portafolio de Negocios verificado en Meta.

## Despliegue en producción

La arquitectura está dividida en dos partes:

- **Sitio estático** (este build de Vite) → hosting compartido en
  **HostCarriel**, dominio `www.gct.com.co`.
- **Backend** (`server/prod.mjs`: asistente de IA + auth/asistencia/
  empleados) → **Railway**, dominio `api.gct.com.co`, con una base de
  datos Postgres (también en Railway). Variables de entorno configuradas
  directamente en el panel de Railway (nunca en este repositorio):
  `ANTHROPIC_API_KEY`, `DATABASE_URL` (se genera sola al vincular la base
  de datos), `OFFICE_LAT`, `OFFICE_LNG`, `OFFICE_RADIUS_METERS`.

El sitio estático se publica automáticamente con
[.github/workflows/deploy.yml](.github/workflows/deploy.yml): cada `git
push` a `main` compila el proyecto y lo sube por SFTP a `public_html/`
en HostCarriel. Requiere estos secretos configurados en **Settings →
Secrets and variables → Actions** del repositorio de GitHub:

| Secreto | Valor |
|---|---|
| `FTP_SERVER` | `ftp.us.stackcp.com` |
| `FTP_USERNAME` | el usuario FTP de la cuenta de HostCarriel |
| `FTP_PASSWORD` | la contraseña FTP de esa cuenta |

Se usa SFTP por el puerto 22 (no FTP por el 21) porque StackCP corta las
conexiones FTP normales que vienen de IPs de datacenter como las de
GitHub Actions.
