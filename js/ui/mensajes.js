// Avisos del Senamhi como mensajes de texto, dentro de la app.
import { avisosParaZona, SEVERIDAD } from '../avisos.js';
import { MESES } from '../rules.js';
import { estado } from '../estado.js';
import { esc, IC } from './piezas.js';

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
    ? `<div class="sms sms-sistema"><div class="sms-de">${IC('antena')}<b>Senamhi</b></div><p>Aún no pudimos revisar los avisos de hoy. Cuando haya Internet, aparecerán aquí.</p></div>`
    : `<div class="sms sms-sistema"><div class="sms-de">${IC('antena')}<b>Senamhi</b><span>${hora(datos.actualizado)}</span></div><p>No hay avisos vigentes para tu zona en la última revisión.</p></div>`;
  return `<section class="mensajes" aria-label="Avisos del Senamhi">${lista.length ? lista.map(burbuja).join('') : vacio}</section>`;
}
