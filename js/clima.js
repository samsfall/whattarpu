// Cálculos de clima a partir de datos diarios de NASA POWER.
// Se usa igual en el navegador y en Node (script de GitHub Actions).
// Umbral de helada meteorológica: temperatura mínima del aire <= 0 °C (FAO-Senamhi).

export const UMBRAL_HELADA_C = 0;
export const UMBRAL_DIA_SECO_MM = 1;
// Temperaturas para medir el aguante de cada cultivo: días con mínima igual o menor a cada una
export const UMBRALES_FRIO = [0, -1, -2, -2.5, -3, -4, -5, -6, -8, -10]; // día "sin lluvia": menos de 1 mm (criterio provisional del equipo)
const FILL = -999;

/** URL de la API diaria de NASA POWER para un punto. */
export function urlPower(lat, lon, inicio = '19810101', fin = null) {
  const hoy = new Date();
  const finAnio = fin || `${hoy.getUTCFullYear() - 1}1231`; // último año completo
  const p = new URLSearchParams({
    parameters: 'T2M_MIN,T2M,PRECTOTCORR',
    community: 'AG',
    latitude: String(lat),
    longitude: String(lon),
    start: inicio,
    end: finAnio,
    format: 'JSON',
  });
  return `https://power.larc.nasa.gov/api/temporal/daily/point?${p}`;
}

/** Convierte la respuesta JSON de POWER en una lista de días {anio, mes, tmin, lluvia}. */
export function leerPower(json) {
  const par = json?.properties?.parameter;
  if (!par || !par.T2M_MIN) throw new Error('Respuesta de NASA POWER sin T2M_MIN');
  const tmin = par.T2M_MIN;
  const lluvia = par.PRECTOTCORR || {};
  const media = par.T2M || {};
  const dias = [];
  for (const fecha of Object.keys(tmin)) {
    const t = tmin[fecha];
    const ll = lluvia[fecha];
    dias.push({
      anio: Number(fecha.slice(0, 4)),
      mes: Number(fecha.slice(4, 6)),
      tmin: t === FILL || t === undefined ? null : t,
      lluvia: ll === FILL || ll === undefined ? null : ll,
      tmed: media[fecha] === FILL || media[fecha] === undefined ? null : media[fecha],
    });
  }
  return dias;
}

/**
 * Resumen por mes para un periodo de años.
 * - pctAniosConHelada: % de años con al menos un día de helada en ese mes
 * - diasHeladaProm: promedio de días con helada en ese mes
 * - lluviaProm: lluvia promedio del mes (mm)
 * - diasSecosProm: promedio de días con menos de 1 mm
 */
export function resumenMensual(dias, desde, hasta) {
  const porAnioMes = new Map();
  for (const d of dias) {
    if (d.anio < desde || d.anio > hasta) continue;
    const k = `${d.anio}-${d.mes}`;
    if (!porAnioMes.has(k)) porAnioMes.set(k, { anio: d.anio, mes: d.mes, helada: 0, seco: 0, lluvia: 0, nT: 0, nL: 0, tmed: 0, nM: 0, bajo: UMBRALES_FRIO.map(() => 0) });
    const r = porAnioMes.get(k);
    if (d.tmin !== null) { r.nT++; if (d.tmin <= UMBRAL_HELADA_C) r.helada++; UMBRALES_FRIO.forEach((u, i) => { if (d.tmin <= u) r.bajo[i]++; }); }
    if (d.tmed !== null && d.tmed !== undefined) { r.nM++; r.tmed += d.tmed; }
    if (d.lluvia !== null) { r.nL++; r.lluvia += d.lluvia; if (d.lluvia < UMBRAL_DIA_SECO_MM) r.seco++; }
  }
  const meses = [];
  for (let m = 1; m <= 12; m++) {
    const filas = [...porAnioMes.values()].filter((r) => r.mes === m && r.nT > 0);
    const n = filas.length;
    const conL = filas.filter((r) => r.nL > 0);
    meses.push({
      mes: m,
      anios: n,
      pctAniosConHelada: n ? redondear((100 * filas.filter((r) => r.helada > 0).length) / n) : null,
      diasHeladaProm: n ? redondear(filas.reduce((s, r) => s + r.helada, 0) / n) : null,
      lluviaProm: conL.length ? redondear(conL.reduce((s, r) => s + r.lluvia, 0) / conL.length) : null,
      diasSecosProm: conL.length ? redondear(conL.reduce((s, r) => s + r.seco, 0) / conL.length) : null,
      diasBajo: n ? Object.fromEntries(UMBRALES_FRIO.map((u, i) => [String(u), redondear(filas.reduce((s, r) => s + r.bajo[i], 0) / n)])) : null,
      tempMediaProm: filas.some((r) => r.nM > 0) ? redondear(filas.filter((r) => r.nM > 0).reduce((s, r) => s + r.tmed / r.nM, 0) / filas.filter((r) => r.nM > 0).length) : null,
    });
  }
  return meses;
}

/** Tendencia: diferencia entre dos periodos (reciente − antiguo) por mes. */
export function tendencia(dias, antiguo, reciente) {
  const a = resumenMensual(dias, antiguo[0], antiguo[1]);
  const b = resumenMensual(dias, reciente[0], reciente[1]);
  return a.map((x, i) => ({
    mes: x.mes,
    cambioDiasHelada: dif(b[i].diasHeladaProm, x.diasHeladaProm),
    cambioLluviaMm: dif(b[i].lluviaProm, x.lluviaProm),
  }));
}

/** Lluvia total de cada mes de cada año (mm). null si al mes le faltan más de 3 días de dato. Sirve para el SPI. */
export function lluviaMensual(dias) {
  const tabla = {}; const cuenta = {};
  for (const d of dias) {
    const k = d.anio; tabla[k] ??= Array(12).fill(0); cuenta[k] ??= Array(12).fill(0);
    if (d.lluvia !== null) { tabla[k][d.mes - 1] += d.lluvia; cuenta[k][d.mes - 1]++; }
  }
  const largo = (a, m) => new Date(Date.UTC(a, m, 0)).getUTCDate();
  for (const k of Object.keys(tabla)) tabla[k] = tabla[k].map((v, i) => (cuenta[k][i] >= largo(Number(k), i + 1) - 3 ? redondear(v) : null));
  return tabla;
}

/** Arma la tabla de historial y tendencias de una zona (lo que guarda el repositorio). */
export function tablaZona(dias, zona, meta = {}) {
  const anios = dias.map((d) => d.anio);
  const primero = Math.min(...anios);
  const ultimo = Math.max(...anios);
  const mitad = Math.min(20, Math.floor((ultimo - primero + 1) / 2));
  const antiguo = [primero, primero + mitad - 1];
  const reciente = [ultimo - mitad + 1, ultimo];
  return {
    zona,
    fuente: 'NASA POWER, API diaria (T2M_MIN, T2M, PRECTOTCORR), comunidad AG',
    umbralesFrioC: UMBRALES_FRIO,
    umbralHeladaC: UMBRAL_HELADA_C,
    umbralDiaSecoMm: UMBRAL_DIA_SECO_MM,
    periodo: [primero, ultimo],
    historial: resumenMensual(dias, primero, ultimo),
    tendencia: { antiguo, reciente, meses: tendencia(dias, antiguo, reciente) },
    lluviaMensual: lluviaMensual(dias),
    ...meta,
  };
}

function redondear(x) { return Math.round(x * 10) / 10; }
function dif(a, b) { return a === null || b === null ? null : redondear(a - b); }

/** Normales mensuales de temperatura media (T2M) de NASA POWER: una sola consulta pequeña. */
export function urlPowerClimatologia(lat, lon) {
  const p = new URLSearchParams({ parameters: 'T2M', community: 'AG', latitude: String(lat), longitude: String(lon), format: 'JSON' });
  return `https://power.larc.nasa.gov/api/temporal/climatology/point?${p}`;
}
/** Lee la respuesta de climatología: lista de 12 temperaturas medias (enero a diciembre). */
export function leerClimatologia(json) {
  const t = json?.properties?.parameter?.T2M; if (!t) return null;
  return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map((m) => (t[m] === FILL || t[m] === undefined ? null : t[m]));
}
