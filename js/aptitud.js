// Aptitud de la zona para un cultivo: compara lo que la app sabe de la zona con los requisitos del cultivo
// (catálogo de requisitos: ECOCROP de la FAO, con datos locales del INIA cuando existen). Funciones puras.

const NOMBRES = { temperatura: 'Temperatura media en los meses de cultivo', lluviaAnual: 'Lluvia al año', ph: 'pH del suelo', textura: 'Textura del suelo', altitud: 'Altura' };
const UNIDAD = { temperatura: '°C', lluviaAnual: 'mm', ph: '', altitud: 'm' };
const GRUPO = { gruesa: 'gruesa (arenosa)', media: 'media (franca)', fina: 'fina (arcillosa)' };

/** Estado de un valor frente a un rango óptimo y uno aceptable (absoluto). */
export function estadoRango(v, r) {
  if (v === null || v === undefined || !r) return 'sin_dato';
  const dentro = (a, b) => (a === null || a === undefined || v >= a) && (b === null || b === undefined || v <= b);
  if (r.optMin !== undefined && dentro(r.optMin, r.optMax)) return 'optimo';
  if (dentro(r.absMin, r.absMax)) return 'aceptable';
  return 'fuera';
}

/**
 * zona: { temperatura, lluviaAnual, ph, grupoTextura, altitud } (null si no se sabe).
 * Devuelve { resultado: 'apto' | 'limitado' | 'no_apto' | 'sin_datos', items: [...] }.
 */
export function evaluarAptitud(req, zona) {
  if (!req) return { resultado: 'sin_datos', items: [] };
  const items = [];
  const fmt = (x) => (x === null || x === undefined ? '—' : `${Math.round(x * 10) / 10}`);
  const rangoTxt = (r, u) => `${r.optMin !== undefined ? `ideal ${fmt(r.optMin)} a ${fmt(r.optMax)}${u ? ` ${u}` : ''}; ` : ''}aguanta ${fmt(r.absMin)} a ${fmt(r.absMax)}${u ? ` ${u}` : ''}`;
  for (const k of ['temperatura', 'lluviaAnual', 'ph']) {
    if (!req[k]) continue;
    let estado = estadoRango(zona[k], req[k]); let nota = req[k].nota;
    // Con riego, la lluvia deja de limitar al cultivo (criterio de la agrónoma del equipo)
    if (k === 'lluviaAnual' && zona.conRiego && estado !== 'sin_dato') { if (estado !== 'optimo') nota = 'tienes riego: la falta de lluvia no limita al cultivo'; estado = 'optimo'; }
    items.push({ clave: k, nombre: NOMBRES[k], zona: zona[k] === null || zona[k] === undefined ? null : `${fmt(zona[k])}${UNIDAD[k] ? ` ${UNIDAD[k]}` : ''}`, rango: rangoTxt(req[k], UNIDAD[k]), estado, fuente: req[k].fuente, fuenteAbs: req[k].fuenteAbs, nota });
  }
  if (req.textura) {
    const g = zona.grupoTextura;
    const estado = !g ? 'sin_dato' : req.textura.optima.includes(g) ? 'optimo' : req.textura.aceptable.includes(g) ? 'aceptable' : 'fuera';
    items.push({ clave: 'textura', nombre: NOMBRES.textura, zona: g ? GRUPO[g] : null, rango: `ideal ${req.textura.optima.map((x) => GRUPO[x]).join(' o ') || '—'}`, estado, fuente: req.textura.fuente });
  }
  if (req.altitud) {
    const a = req.altitud; const v = zona.altitud;
    const estado = v === null || v === undefined ? 'sin_dato' : (a.min === null || a.min === undefined || v >= a.min) && v <= a.max ? 'optimo' : 'fuera';
    items.push({ clave: 'altitud', nombre: NOMBRES.altitud, zona: v === null || v === undefined ? null : `${Math.round(v)} m`, rango: a.min ? `de ${a.min} a ${a.max} m` : `hasta ${a.max} m`, estado, fuente: a.fuente, nota: a.nota });
  }
  const con = items.filter((i) => i.estado !== 'sin_dato');
  const resultado = !con.length ? 'sin_datos' : con.some((i) => i.estado === 'fuera') ? 'no_apto' : con.some((i) => i.estado === 'aceptable') ? 'limitado' : 'apto';
  return { resultado, items };
}

/** Temperatura media de los meses del ciclo, con las normales mensuales de la zona. */
export function temperaturaCiclo(meses, historial) {
  const v = meses.map((m) => historial?.[m - 1]?.tempMediaProm).filter((x) => x !== null && x !== undefined);
  return v.length === meses.length && v.length ? Math.round((v.reduce((s, x) => s + x, 0) / v.length) * 10) / 10 : null;
}
/** Lluvia de un año normal: suma de los promedios mensuales. */
export function lluviaAnualProm(historial) {
  const v = (historial || []).map((m) => m.lluviaProm);
  return v.length === 12 && v.every((x) => x !== null && x !== undefined) ? Math.round(v.reduce((s, x) => s + x, 0)) : null;
}
