// ¿Aguanta el cultivo el clima de la zona? El clima (heladas y años secos) es el mismo para todos los cultivos;
// lo que cambia es cuánto frío y cuánta falta de lluvia aguanta cada uno (catálogo de requisitos). Funciones puras.
import { riesgoSequia } from './sequia.js';

const TODO_EL_ANIO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const r1 = (x) => Math.round(x * 10) / 10;

/** Clima de la zona, igual para todos: días de helada (0 °C o menos) al año, meses con más heladas y años secos. */
export function climaZona(historial, lluviaMensual) {
  if (!historial) return null;
  const conDato = historial.filter((m) => m.diasHeladaProm !== null && m.diasHeladaProm !== undefined);
  const diasHelada = conDato.length === 12 ? r1(conDato.reduce((s, m) => s + m.diasHeladaProm, 0)) : null;
  const mesesFuertes = [...conDato].filter((m) => m.diasHeladaProm > 0).sort((a, b) => b.diasHeladaProm - a.diasHeladaProm).slice(0, 2).map((m) => m.mes);
  return { diasHelada, mesesFuertes, sequia: riesgoSequia(TODO_EL_ANIO, lluviaMensual) };
}

/**
 * Noches al año, en los meses que el cultivo está en la chacra, con temperatura mínima igual o menor a la que lo mata.
 * Usa el umbral guardado más cercano por encima (más prudente) si el exacto no está.
 */
export function aguanteFrio(meses, historial, tMata) {
  if (tMata === null || tMata === undefined) return { sinDato: 'cultivo' };
  if (!historial || !meses.length) return { sinDato: meses.length ? 'clima' : 'epoca' };
  const conBajo = historial.every((m) => m.diasBajo);
  let clave = null;
  if (conBajo) {
    const ums = Object.keys(historial[0].diasBajo).map(Number).sort((a, b) => a - b);
    const u = ums.find((x) => x >= tMata); if (u === undefined) return { sinDato: 'clima' };
    clave = String(u);
  } else if (tMata >= 0) clave = null; // sin tabla por umbrales: solo sirve el umbral de helada (0 °C)
  else return { sinDato: 'clima', tMata };
  let total = 0;
  for (const m of meses) {
    const f = historial.find((h) => h.mes === m); if (!f) return { sinDato: 'clima', tMata };
    total += clave === null ? f.diasHeladaProm : f.diasBajo[clave];
  }
  return { noches: r1(total), tMata, umbral: clave === null ? 0 : Number(clave) };
}

/** Años (de los que tienen dato completo) en que la lluvia del año no llegó al mínimo que aguanta el cultivo. Con riego, la lluvia no lo limita. */
export function aguanteSequia(lluviaMensual, minimo, conRiego) {
  if (conRiego) return { conRiego: true };
  if (minimo === null || minimo === undefined) return { sinDato: 'cultivo' };
  if (!lluviaMensual) return { sinDato: 'clima' };
  const totales = Object.values(lluviaMensual).filter((a) => a.every((v) => v !== null)).map((a) => a.reduce((s, v) => s + v, 0));
  if (!totales.length) return { sinDato: 'clima' };
  return { aniosBajo: totales.filter((t) => t < minimo).length, anios: totales.length, minimo };
}

/** Nivel simple para mostrar: 'si' (aguanta), 'casi' (pocas veces no), 'cuesta' (seguido no aguanta), null (sin dato). */
export function nivelFrio(a) { if (!a || a.sinDato) return null; return a.noches === 0 ? 'si' : a.noches < 1 ? 'casi' : 'cuesta'; }
export function nivelSequia(a) {
  if (!a || a.sinDato) return null; if (a.conRiego) return 'riego';
  const p = a.aniosBajo / a.anios; return p === 0 ? 'si' : p <= 0.2 ? 'casi' : 'cuesta';
}
