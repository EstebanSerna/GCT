# Gerencia Contable & Tributaria (demo)

Sitio comercial + portal interno de seguimiento de tareas y clientes para
una firma de contadores. Incluye una página pública con embudo de
captación de clientes y un asistente de IA, además del portal interno
para el equipo.

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

Todos los datos (clientes, tareas, empleados) son ficticios, pensados
para parecerse a una firma de contadores real. Nada se guarda de forma
permanente; al recargar la página, los datos vuelven al estado inicial.

## Despliegue en producción

La arquitectura está dividida en dos partes:

- **Sitio estático** (este build de Vite) → hosting compartido en
  **HostCarriel**, dominio `www.gct.com.co`.
- **Backend del asistente de IA** (`server/prod.mjs`) → **Railway**,
  dominio `api.gct.com.co`. Necesita su propia variable de entorno
  `ANTHROPIC_API_KEY` configurada directamente en el panel de Railway
  (nunca en este repositorio).

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
