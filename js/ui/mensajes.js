// Avisos del Senamhi como mensajes de texto, dentro de la app.
import { avisosParaZona, SEVERIDAD } from '../avisos.js';
import { MESES } from '../rules.js';
import { estado } from '../estado.js';
import { esc, IC, fuenteHtml } from './piezas.js';
import { heladasPronostico, DIAS_PRONOSTICO } from '../pronostico.js';

export function mensajesSenamhi(siempre) {
  const datos = estado.avisos;
  const lista = datos ? avisosParaZona(datos.avisos || [], estado.zona) : [];
  if (!lista.length && !siempre) return '';
  const hora = (iso) => { const d = new Date(iso); return Number.isNaN(+d) ? '' : `${d.getDate()} ${MESES[d.getMonth()]}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const burbuja = (a, k) => `<div class="sms sev-${esc((a.severidad || 'Unknown').toLowerCase())}" style="animation-delay:${k * 120}ms">
      <div class="sms-de">${IC('antena')}<b>Senamhi</b><span>${hora(a.enviado || a.desde)}</span></div>
      <p><b>${esc(a.evento || a.titular)}</b>${a.severidad ? ` · nivel ${esc(SEVERIDAD[a.severidad] || a.severidad)}` : ''}</p>
      ${a.desde || a.hasta ? `<p class="sms-fecha">Del ${hora(a.desde)} al ${hora(a.hasta)}</p>` : ''}
      ${a.descripcion ? `<details><summary>Leer el aviso completo</summary><p>${esc(a.descripcion)}</p>${a.instruccion ? `<p>${esc(a.instruccion)}</p>` : ''}</details>` : ''}
    </div>`;
  const vacio = !datos?.actualizado
    ? `<div class="sms sms-sistema"><div class="sms-de">${IC('antena')}<b>Senamhi</b></div><p>Los avisos de helada y lluvia del Senamhi todavía no llegan solos a la app. Revísalos en su página.</p><p><a class="btn btn-secundario" href="https://www.senamhi.gob.pe/?&amp;p=aviso-meteorologico" target="_blank" rel="noopener">Ver avisos del Senamhi</a></p></div>`
    : `<div class="sms sms-sistema"><div class="sms-de">${IC('antena')}<b>Senamhi</b><span>${hora(datos.actualizado)}</span></div><p>No hay avisos vigentes para tu zona en la última revisión.</p></div>`;
  return `<section class="mensajes" aria-label="Avisos del Senamhi">${lista.length ? lista.map(burbuja).join('') : vacio}</section>`;
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const grados = (t) => `${t.toFixed(1).replace('.', ',').replace('-', '−')} °C`;
function diaTexto(fecha) {
  const [a, m, d] = fecha.split('-').map(Number); const f = new Date(a, m - 1, d);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const dif = Math.round((f - hoy) / 86400000);
  if (dif === 0) return 'esta noche';
  if (dif === 1) return 'mañana';
  return `el ${DIAS[f.getDay()]} ${d}`;
}
const PIE = `<p class="sms-fecha">Pronóstico de Open-Meteo para el punto de tu chacra (aire a 2 m del suelo). No es un aviso oficial del Senamhi.</p>`;

/**
 * Aviso de helada de los próximos 7 días con el pronóstico del punto de la chacra.
 * cultivoId: si se da, compara con el frío que daña a ese cultivo (fichas INIA / ECOCROP).
 * siempre: si es false, solo aparece cuando se pronostica helada.
 */
export function mensajeHelada(cultivoId = null, siempre = false) {
  const dias = estado.pronostico;
  if (dias === undefined) return siempre ? `<section class="mensajes"><div class="sms sms-sistema"><div class="sms-de">${IC('termometro')}<b>Pronóstico de heladas</b></div><p>Consultando el pronóstico de tu chacra…</p></div></section>` : '';
  if (!dias) return siempre ? `<section class="mensajes"><div class="sms sms-sistema"><div class="sms-de">${IC('termometro')}<b>Pronóstico de heladas</b></div><p>Sin internet no pudimos traer el pronóstico de los próximos días.</p></div></section>` : '';
  const c = cultivoId ? estado.catalogo?.cultivos?.[cultivoId] : null;
  const mata = c?.requisitos?.heladaMata;
  const r = heladasPronostico(dias, mata?.enCrecimiento ?? null);
  if (!r.heladas.length && !r.danan.length && !siempre) return '';
  const nombre = c ? esc(c.nombre.toLowerCase()) : '';
  const fuente = mata?.fuente ? fuenteHtml(estado.catalogo.fuentes?.[mata.fuente] || {}) : '';
  let sev; let texto;
  if (r.danan.length) {
    const d = r.danan.reduce((a, x) => (x.tmin < a.tmin ? x : a));
    sev = 'extreme';
    texto = `<b>Helada fuerte para tu ${nombre}.</b> ${diaTexto(d.fecha)[0].toUpperCase() + diaTexto(d.fecha).slice(1)} puede bajar a <b>${grados(d.tmin)}</b> en tu chacra. Tu ${nombre} se daña desde ${grados(r.tMata)}${fuente}.`
      + (r.danan.length > 1 ? ` Son ${r.danan.length} noches así en los próximos ${DIAS_PRONOSTICO} días.` : '');
  } else if (r.heladas.length) {
    const d = r.heladas.reduce((a, x) => (x.tmin < a.tmin ? x : a));
    sev = 'moderate';
    texto = `<b>Puede helar ${diaTexto(d.fecha)}:</b> hasta ${grados(d.tmin)} en tu chacra`
      + (r.heladas.length > 1 ? ` (${r.heladas.length} noches con helada en los próximos ${DIAS_PRONOSTICO} días)` : '') + '.'
      + (c && r.tMata != null ? ` Tu ${nombre} aguanta hasta ${grados(r.tMata)}${fuente}, pero vigila.` : '')
      + (c && r.tMata == null ? ` Aún no tenemos una fuente de cuánto frío aguanta tu ${nombre}.` : '');
  } else {
    sev = 'minor-ok';
    texto = `<b>No se esperan heladas</b> en los próximos ${DIAS_PRONOSTICO} días. La noche más fría: ${grados(r.masFria.tmin)}, ${diaTexto(r.masFria.fecha)}.`;
  }
  const celdas = dias.map((d) => {
    const [a, m, dd] = d.fecha.split('-').map(Number); const dia = DIAS[new Date(a, m - 1, dd).getDay()].slice(0, 3);
    const cls = r.tMata != null && d.tmin <= r.tMata ? 'dana' : d.tmin <= 0 ? 'hiela' : '';
    return `<li class="${cls}"><span>${dia} ${dd}</span><b>${grados(d.tmin).replace(' °C', '°')}</b></li>`;
  }).join('');
  return `<section class="mensajes" aria-label="Pronóstico de heladas"><div class="sms sev-${sev}">
      <div class="sms-de">${IC('termometro')}<b>Pronóstico de heladas</b><span>próximos ${DIAS_PRONOSTICO} días</span></div>
      <p>${texto}</p>
      <ul class="dias-pron" aria-label="Temperatura mínima de cada noche">${celdas}</ul>
      ${PIE}</div></section>`;
}
