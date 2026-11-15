// Piezas de interfaz reutilizables: cada pantalla se arma con estas funciones.
import { CONFIG } from '../config.js';
import { MESES } from '../rules.js';
import { estado } from '../estado.js';

/** Escapa texto antes de ponerlo en la página (evita que un dato externo meta código). */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fuenteHtml = (e) => (e.url ? ` <span class="fuente">(<a href="${esc(e.url)}" target="_blank" rel="noopener">fuente</a>)</span>` : '');

export const IC = (n, cls = 'ic', alt = '') => `<img class="${cls}" src="img/iconos/${n}.svg" alt="${esc(alt)}">`;
export const icCultivo = (id) => (estado.catalogo.cultivos[id] || id === 'descanso' ? id : 'otro');
export const nombreCultivo = (id) => (id === 'descanso' ? 'Descanso' : estado.catalogo.cultivos[id]?.nombre ?? id);
/** Cultivos del catálogo que corresponden a la región de la zona elegida. */
export const cultivos = () => Object.entries(estado.catalogo.cultivos)
  .filter(([, c]) => !estado.zona?.region || !c.regiones || c.regiones.includes(estado.zona.region))
  .map(([id, c]) => [id, id, c.nombre]);

export const paisaje = (titulo = '', sub = '') => `
  <div class="paisaje">
    ${CONFIG.portada?.src ? `<img class="portada-foto" src="${CONFIG.portada.src}" alt="">
      ${CONFIG.portada.generadaConIA ? '<span class="marca-ia">Imagen generada con IA</span>' : ''}` : ''}
    <svg class="orbita" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 190 C120 40 300 10 420 40" fill="none" stroke="#1c4e80" stroke-opacity=".22" stroke-dasharray="3 7"/></svg>
    <img class="sol" src="img/iconos/satelite.svg" alt="">
    ${titulo ? `<div class="titulo-paisaje"><h1>${titulo}</h1>${sub ? `<div>${sub}</div>` : ''}</div>` : ''}
  </div>`;
export const avance = (n, total = 5) => `<div class="avance" aria-label="Paso ${n} de ${total}">${Array.from({ length: total }, (_, i) => `<i class="${i < n ? 'ok' : ''}"></i>`).join('')}<b>${n} de ${total}</b></div>`;
export const actividad = (txt) => `<div class="actividad">${IC('agricultora')}<div><b>Actividad:</b> ${txt}</div></div>`;
export const tiles = (campo, lista, elegido, cols = '') => `<div class="cuadricula ${cols}" role="group">${lista.map(([v, ic, txt, sub]) =>
  `<button class="tile ${String(elegido) === String(v) ? 'elegida' : ''}" data-campo="${campo}" data-valor="${esc(v)}" aria-pressed="${String(elegido) === String(v)}">${IC(ic)}<span>${esc(txt)}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`).join('')}</div>`;
export const acciones = (siguiente, { texto = 'Continuar', listo = true, volver = true, id = '' } = {}) => `<div class="acciones">
  ${volver ? `<button class="btn btn-secundario" data-accion="volver">${IC('ui-caret-left-bold')} Volver</button>` : ''}
  ${siguiente || id ? `<button class="btn btn-principal" ${id ? `id="${id}"` : `data-ir="${siguiente}"`} ${listo ? '' : 'disabled'}>${texto} ${IC('ui-caret-right-bold')}</button>` : ''}</div>`;
export const aviso = (tipo, icono, html) => `<div class="aviso ${tipo}">${IC(icono)}<div>${html}</div></div>`;

/** Época de siembra en texto corto: "16 oct – 30 nov". */
export function ventana(c) {
  if (!c.siembra) return 'sin fuente aún';
  const f = (s) => { const [m, d] = s.split('-').map(Number); return `${d} ${MESES[m - 1]}`; };
  return `${f(c.siembra.desde)} – ${f(c.siembra.hasta)}`;
}
/** Línea del % de años con helada por mes. */
export function grafico(hist) {
  const pts = hist.map((x, i) => `${24 + i * 23.5},${110 - (x.pctAniosConHelada ?? 0)}`).join(' ');
  return `<svg viewBox="0 0 300 130" width="100%" role="img" aria-label="Porcentaje de años con helada por mes">
    <line x1="24" y1="110" x2="285" y2="110" stroke="#cfdcd9"/><line x1="24" y1="10" x2="285" y2="10" stroke="#cfdcd9" stroke-dasharray="4 4"/>
    <text x="0" y="14" font-size="10" fill="#4b6072">100%</text><text x="10" y="113" font-size="10" fill="#4b6072">0</text>
    <polyline points="${pts}" fill="none" stroke="#3e9bd1" stroke-width="3" stroke-linejoin="round"/>
    ${hist.map((x, i) => `<text x="${24 + i * 23.5}" y="125" font-size="10" text-anchor="middle" fill="#4b6072">${MESES[i][0].toUpperCase()}</text>`).join('')}
  </svg>`;
}
