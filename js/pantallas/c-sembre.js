// Camino C · Ya sembré: cultivo y fecha, avance, mapa (pendiente), avisos y próxima campaña.
import { MESES_LARGO } from '../rules.js';
import { estado } from '../estado.js';
import { esc, fuenteHtml, IC, nombreCultivo, cultivos, avance, tiles, acciones, aviso, grafico } from '../ui/piezas.js';
import { mensajesSenamhi, mensajeHelada } from '../ui/mensajes.js';

export const PANTALLAS_C = {
  // C · Ya sembré
  C1: () => {
    const c = estado.catalogo.cultivos[estado.entrada.cultivoC];
    return `${avance(1, 2)}<h1>¿Qué sembraste?</h1>
      ${tiles('cultivoC', cultivos(), estado.entrada.cultivoC)}
      <h2>${IC('calendario')} ¿En qué mes sembraste?</h2>
      <div class="chips">${mesesPasados().map(([m, a]) => { const v = `${a}-${String(m).padStart(2, '0')}`; return `<button class="chip ${estado.entrada.mesC === v ? 'elegida' : ''}" data-campo="mesC" data-valor="${v}" aria-pressed="${estado.entrada.mesC === v}">${MESES_LARGO[m - 1]}<small>${a}</small></button>`; }).join('')}</div>
      ${acciones(null, { id: 'sig-c1', listo: !!c && !!estado.entrada.mesC })}`;
  },

  C2: () => {
    const id = estado.entrada.cultivoC; const c = estado.catalogo.cultivos[id]; const hoy = new Date();
    const [anio, sembro] = estado.entrada.mesC.split('-').map(Number);
    const dias = Math.max(0, Math.round((hoy - new Date(anio, sembro - 1, 15)) / 86400000)); // mitad del mes que dijo el agricultor
    const dur = c.duracionDias?.max; const pct = dur ? Math.min(100, Math.round((dias / dur) * 100)) : 0;
    const m = hoy.getMonth() + 1; const h = estado.historial; const f = h?.historial.find((x) => x.mes === m);
    return `${avance(2, 2)}
      <div class="cabecera">${IC(id)}<div><p class="sub">Tu cultivo</p><h1>${esc(c.nombre)}</h1></div></div>
      <div class="tarjeta"><h2>${IC('reloj')} Avance del ciclo</h2>${dur ? `<div class="progreso"><i style="width:${pct}%"></i></div>
        <b>${dias} de ${dur} días</b> <span class="leyenda">(${esc(c.variedadReferencia)})</span>
        <p class="leyenda">La etapa exacta (floración, etc.) se calculará con grados día: pendiente.</p>`
        : `<b>Lleva unos ${dias} días sembrado</b> <span class="leyenda">(contando desde mediados de ${MESES_LARGO[sembro - 1]}, el mes que nos dijiste)</span>.<p class="leyenda">Aún no tenemos la ficha INIA de ${esc(c.nombre.toLowerCase())} para saber cuánto dura su ciclo. Está en la lista de pendientes del equipo.</p>`}</div>
      ${f ? `<div class="tarjeta"><h2>${IC('helada')} Riesgo histórico</h2><div class="fila-dato"><span>Años con helada en ${MESES_LARGO[m - 1]}</span><b>${f.pctAniosConHelada} %</b></div>
        <p class="leyenda">Cómo ha sido en años anteriores (% de años con helada por mes):</p>${grafico(h.historial)}</div>` : ''}
      ${c.helada ? aviso('info', 'termometro', esc(c.helada.texto) + fuenteHtml(estado.catalogo.fuentes[c.helada.fuente] || {})) : ''}
      ${acciones('C3')}`;
  },

  C3: () => `<h1>¿Qué tan verde está tu zona?</h1><p class="sub">Vigor de las plantas visto desde el satélite (NDVI).</p>
    <div class="tarjeta">
      <div id="mapa-ndvi" class="mapa" role="img" aria-label="Mapa de vigor de la vegetación de tu zona"></div>
      <div class="escala-ndvi" aria-hidden="true"><i></i></div>
      <div class="escala-texto"><span>Suelo seco o desnudo</span><span>Plantas sanas y verdes</span></div>
      <p id="msg-ndvi" class="leyenda">Imagen MODIS de la NASA: junta los mejores días de 8 días seguidos, en cuadros de 250 m. Muestra tu zona, no cada chacra.</p>
    </div>
    ${aviso('info', 'idea', 'Compara con lo que ves en tu chacra. En los primeros meses de lluvia la puna aún se ve marrón; se pone verde con el avance de la campaña.')}
    ${acciones('C4')}`,

  C4: () => `<h1>Avisos para tu zona</h1>${mensajeHelada(estado.entrada.cultivoC, true)}${mensajesSenamhi(true)}
    <div class="tarjeta"><h2>${IC('brote')} Acción recomendada</h2><p class="leyenda">Tabla de acciones con fuente (Agro Rural): pendiente.</p></div>
    ${acciones('C5', { texto: 'Ver alternativa de cultivo' })}`,

  C5: () => `<h1>Próxima campaña</h1>
    <div class="tarjeta centro">${IC(estado.entrada.cultivoC || 'otro', 'ilus-media')}${IC('rotacion', 'ilus-media')}
      <p>¿Qué le toca a esta chacra después de ${esc(nombreCultivo(estado.entrada.cultivoC).toLowerCase())}? Responde las preguntas de siembra y te mostramos 3 opciones.</p></div>
    ${acciones(null, { id: 'planificar', texto: 'Planificar' })}`,
};

/** Los últimos 8 meses hasta hoy (más reciente primero): un cultivo sembrado hace más ya se cosechó. */
function mesesPasados() {
  const hoy = new Date(); const lista = [];
  for (let k = 0; k < 8; k++) { const d = new Date(hoy.getFullYear(), hoy.getMonth() - k, 1); lista.push([d.getMonth() + 1, d.getFullYear()]); }
  return lista;
}
