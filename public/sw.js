// Service worker mínimo — solo lo necesario para que el navegador considere
// la app "instalable" como PWA (ícono en el home, pantalla completa). No
// cachea nada: esta app siempre necesita conexión (API en vivo, GPS), así
// que un modo offline no tendría sentido aquí.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // no-op: deja pasar todas las peticiones directo a la red
});
