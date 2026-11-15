// Arranque y navegación. Las pantallas están en js/pantallas/, las conexiones en js/servicios/ y las reglas en js/rules.js.
import { estado, pila, reiniciarEstado } from './estado.js';
import { PANTALLAS } from './pantallas/index.js';
import { cargarBase, cargarAvisos, cargarHistorial, cargarSuelo, calcular, cargarCentrosPoblados, completarAltura } from './servicios/datos.js';
import { iniciarMapa, iniciarMapaNdvi, cerrarMapa } from './servicios/mapa.js';
import { textoParaLeer, decir, hablando, callar } from './servicios/voz.js';

const $app = document.getElementById('app');

// ---------- Navegación ----------
export function ir(id, { atras = false, mismo = false } = {}) {
  if (!atras && !mismo && estado.pantalla) pila.push(estado.pantalla);
  estado.pantalla = id;
  cerrarMapa();
  $app.innerHTML = PANTALLAS[id]();
  enlazar();
  portada();
  if (id === 'A3') iniciarMapa();
  if (id === 'C3') iniciarMapaNdvi();
  if (!mismo) { $app.focus(); window.scrollTo(0, 0); }
}
const volver = () => { if (pila.length) ir(pila.pop(), { atras: true }); };

// Foto de portada: si carga, ocupa el bloque; si no existe, queda el cielo (sin código en el HTML, para la política de seguridad)
function portada() {
  const img = $app.querySelector('.portada-foto'); if (!img) return;
  const ok = () => img.parentNode?.classList.add('con-foto'); const mal = () => img.remove();
  if (img.complete) { if (img.naturalWidth) ok(); else mal(); } else { img.addEventListener('load', ok); img.addEventListener('error', mal); }
}

// ---------- Botones de cada pantalla ----------
function enlazar() {
  const on = (sel, fn) => { const el = $app.querySelector(sel); if (el) el.addEventListener('click', fn); };
  $app.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.ir === 'B7' && estado.pantalla === 'B6') calcular();
    if (b.dataset.ir === 'B3' && estado.pantalla === 'B1') estado.entrada.tiempoTrabajo = '0'; // viene de descanso: la pregunta B2 no aplica
    ir(b.dataset.ir);
  }));
  $app.querySelectorAll('[data-accion="volver"]').forEach((b) => b.addEventListener('click', volver));
  $app.querySelectorAll('[data-campo]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.valor; const campo = b.dataset.campo;
    estado.entrada[campo] = v;
    const y = window.scrollY; ir(estado.pantalla, { mismo: true }); window.scrollTo(0, y);
  }));
  $app.querySelectorAll('[data-anios]').forEach((b) => b.addEventListener('click', () => {
    estado.entrada.aniosDescanso = Math.min(10, Math.max(1, estado.entrada.aniosDescanso + Number(b.dataset.anios)));
    const y = window.scrollY; ir('B1', { mismo: true }); window.scrollTo(0, y);
  }));
  $app.querySelectorAll('[data-ver]').forEach((b) => b.addEventListener('click', () => { estado.ver = Number(b.dataset.ver); estado.tab = 'requisitos'; ir('B8'); }));
  $app.querySelectorAll('[data-verdet]').forEach((b) => b.addEventListener('click', () => { estado.ver = Number(b.dataset.verdet); estado.tab = 'requisitos'; ir('B9'); }));
  $app.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { estado.tab = b.dataset.tab; ir('B9', { mismo: true }); }));
  $app.querySelectorAll('[data-decir]').forEach((b) => b.addEventListener('click', () => decir(b.dataset.decir)));
  on('#sig-c1', () => ir('C2'));
  on('#guardar-suelo', () => { estado.entrada.ph = $app.querySelector('#ph').value; estado.entrada.textura = $app.querySelector('#textura').value; calcular(); ir('B7'); });
  on('#planificar', () => { estado.entrada.previo = estado.entrada.cultivoC; ir('B2'); });
  on('#enviar', () => enviarOpinion());
  on('#reiniciar', () => { reiniciarEstado(); ir('A1'); });
  on('#gps', usarGps);
  const cambio = (sel, fn) => { const el = $app.querySelector(sel); if (el) el.addEventListener('change', () => fn(el.value)); };
  cambio('#provincia', (v) => { estado.ubic = { provincia: v }; ir('A2', { mismo: true }); });
  cambio('#distrito', async (v) => {
    estado.ubic = { provincia: estado.ubic.provincia, distrito: v, ccppLista: [] }; ir('A2', { mismo: true });
    if (v) { estado.ubic.ccppLista = await cargarCentrosPoblados(v); if (estado.ubic.distrito === v) ir('A2', { mismo: true }); }
  });
  cambio('#ccpp', (v) => { estado.ubic.ccpp = v; });
  on('#ver-mapa', () => elegirDeLista());
}

// La zona elegida en la lista: capital del distrito o un centro poblado. Si es una de las zonas piloto, se usa
// su punto (estación del Senamhi), su historial guardado y su nota.
function elegirDeLista() {
  const u = estado.ubic; const d = estado.distritos.find((x) => x.id === u.distrito); if (!d) return;
  const piloto = estado.zonas.find((z) => z.ubigeo === d.id);
  const cp = u.ccpp ? u.ccppLista?.[Number(u.ccpp)] : null;
  const base = { ubigeo: d.id, region: 'sierra', provincia: d.provincia, distrito: d.distrito };
  if (cp) return elegirZona({ ...base, id: null, nombre: `${cp[0]}, ${d.distrito} (${d.provincia})`, lat: cp[1], lon: cp[2], altitud: null, altitudDistrito: d.altitud, nota: piloto?.nota });
  if (piloto) return elegirZona({ ...base, ...piloto, altitudDistrito: d.altitud, nombre: `${piloto.distrito}, ${piloto.provincia}`, fuenteAltitud: `Altura de la estación del Senamhi (${piloto.fuenteCoordenada || 'zona piloto'}).` });
  return elegirZona({ ...base, id: null, nombre: `${d.distrito} (${d.provincia})`, lat: d.lat, lon: d.lon, altitud: null, altitudDistrito: d.altitud });
}


// ---------- Zona ----------
function usarGps() {
  const msg = $app.querySelector('#msg-zona');
  if (!navigator.geolocation) { msg.textContent = 'Tu celular no permite ubicación. Elige tu provincia y distrito de la lista.'; return; }
  msg.textContent = 'Buscando tu ubicación…';
  navigator.geolocation.getCurrentPosition(
    (p) => elegirZona({ id: null, nombre: 'Mi ubicación', region: 'sierra', lat: p.coords.latitude, lon: p.coords.longitude, altitud: null }),
    () => { msg.textContent = 'No se pudo obtener tu ubicación. Elige tu provincia y distrito de la lista.'; },
    { timeout: 15000 },
  );
}

async function elegirZona(z) {
  estado.zona = z; estado.historial = null;
  ir('A3');
  cargarSuelo(z); completarAltura(z);
  estado.historial = await cargarHistorial(z);
  ir('A3', { mismo: true });
  if (!estado.historial) { const m = document.getElementById('msg-hist'); if (m) m.textContent = 'No se pudo cargar el historial de clima. La app seguirá, pero sin el clima de la zona.'; }
}

function enviarOpinion() {
  const datos = { sirvio: estado.entrada.sirvio || '', comentario: $app.querySelector('#comentario').value };
  console.info('Opinión', datos); // aún no se envía a ningún lado
  ir('E1ok');
}

// ---------- Inicio ----------
document.querySelectorAll('header [data-ir]').forEach((b) => b.addEventListener('click', () => ir(b.dataset.ir)));
const $voz = document.getElementById('btn-voz');
const etiquetaVoz = (habla) => { $voz.querySelector('.txt').textContent = habla ? 'Parar' : 'Escuchar'; $voz.setAttribute('aria-pressed', String(habla)); $voz.classList.toggle('activo', habla); };
$voz.addEventListener('click', () => {
  if (hablando()) { callar(); etiquetaVoz(false); return; }
  etiquetaVoz(true); decir(textoParaLeer($app), () => etiquetaVoz(false));
});
window.textoDePantalla = () => textoParaLeer($app); // para revisar qué se leerá

await cargarBase();
cargarAvisos();
ir('A1');

// Modo sin internet (GitHub Pages). Dentro de Claude no está permitido y se ignora.
try {
  if ('serviceWorker' in navigator) {
    // Si llega una versión nueva de la app, se recarga una sola vez para mostrarla
    const habia = !!navigator.serviceWorker.controller; let recargada = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (habia && !recargada) { recargada = true; location.reload(); } });
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
  }
} catch (e) { /* sin modo sin internet */ }
