// Avisos del Senamhi en formato CAP (Common Alerting Protocol, estándar de la OMM).
// Funciones puras: sirven en el navegador y en el script que descarga los avisos.

const tag = (xml, t) => { const m = xml.match(new RegExp(`<(?:\\w+:)?${t}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${t}>`)); return m ? limpiar(m[1]) : ''; };
const tags = (xml, t) => [...xml.matchAll(new RegExp(`<(?:\\w+:)?${t}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${t}>`, 'g'))].map((m) => m[1]);
function limpiar(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
}

/** Enlaces a cada aviso CAP desde el canal RSS. */
export function enlacesRss(xml) {
  return tags(xml, 'item').map((it) => tag(it, 'link')).filter(Boolean);
}

/** Lee un aviso CAP 1.2. Prefiere el bloque <info> en español. */
export function leerCap(xml, url = '') {
  const infos = tags(xml, 'info');
  const info = infos.find((i) => /^es/i.test(tag(i, 'language'))) || infos[0] || '';
  return {
    id: tag(xml, 'identifier'),
    enviado: tag(xml, 'sent'),
    evento: tag(info, 'event'),
    titular: tag(info, 'headline'),
    descripcion: tag(info, 'description'),
    instruccion: tag(info, 'instruction'),
    severidad: tag(info, 'severity'),
    desde: tag(info, 'onset') || tag(info, 'effective'),
    hasta: tag(info, 'expires'),
    areas: tags(info, 'areaDesc').map(limpiar),
    url: tag(info, 'web') || url,
  };
}

const sinTilde = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Avisos vigentes que mencionan el departamento o la provincia de la zona. */
export function avisosParaZona(avisos, zona, ahora = new Date()) {
  const claves = [zona?.departamento, zona?.provincia].filter(Boolean).map(sinTilde);
  return avisos.filter((a) => (!a.hasta || new Date(a.hasta) >= ahora)
    && (!claves.length || a.areas.some((ar) => claves.some((k) => sinTilde(ar).includes(k)))));
}

export const SEVERIDAD = { Minor: 'menor', Moderate: 'moderado', Severe: 'severo', Extreme: 'extremo', Unknown: 'sin dato' };
