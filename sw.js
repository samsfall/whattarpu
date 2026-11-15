// Guarda la app en el celular para que funcione sin internet después de la primera visita.
// Las tablas de clima (data/historial) también quedan guardadas cuando se consultan.
const VERSION = 'whattarpu-v17';
// Primero la red y, sin internet, lo guardado: con internet siempre se ve la versión más nueva.
const BASE = ['./', 'index.html', 'css/styles.css', 'js/app.js', 'js/estado.js', 'js/pantallas/index.js', 'js/pantallas/a-entrada.js', 'js/pantallas/b-sembrar.js', 'js/pantallas/c-sembre.js', 'js/pantallas/d-e-cierre.js', 'js/pantallas/f-ayuda.js', 'js/ui/piezas.js', 'js/ui/mensajes.js', 'js/servicios/datos.js', 'js/servicios/mapa.js', 'js/servicios/voz.js', 'js/rules.js', 'js/sequia.js', 'js/aptitud.js', 'js/aguante.js', 'js/pronostico.js', 'js/clima.js', 'js/config.js', 'js/suelo.js', 'js/avisos.js', 'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css',
  'data/catalogo.json', 'data/zonas.json', 'data/puno/distritos.json', 'manifest.webmanifest',
  'fonts/atkinson-hyperlegible-latin-400-normal.woff2', 'fonts/atkinson-hyperlegible-latin-700-normal.woff2',
  'fonts/bricolage-grotesque-latin-700-normal.woff2', 'fonts/bricolage-grotesque-latin-800-normal.woff2'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASE)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // NASA y otros: solo con internet
  // Primero la red (así siempre se ve la versión más nueva); sin internet, lo guardado
  e.respondWith(fetch(e.request, { cache: 'no-cache' })
    .then((r) => { if (r.ok) { const copia = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copia)); } return r; })
    .catch(() => caches.match(e.request)));
});
