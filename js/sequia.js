// Riesgo de sequía con el Índice de Precipitación Estandarizado (SPI), el índice que recomienda la
// Organización Meteorológica Mundial (OMM-N.º 1090, 2012). La sequía empieza con un SPI de −1 o menos.
// Funciones puras: reciben la lluvia mensual de NASA POWER y devuelven resultados.

export const UMBRAL_SPI_SECO = -1;

/** Logaritmo de la función gamma (aproximación de Lanczos). */
function lnGamma(z) {
  const g = 7; const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1; let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
/** Función gamma incompleta inferior regularizada P(a, x). */
export function gammaP(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) { // serie
    let suma = 1 / a; let termino = suma;
    for (let n = 1; n < 500; n++) { termino *= x / (a + n); suma += termino; if (Math.abs(termino) < Math.abs(suma) * 1e-12) break; }
    return suma * Math.exp(-x + a * Math.log(x) - lnGamma(a));
  }
  // fracción continua (Lentz)
  let b = x + 1 - a; let c = 1 / 1e-300; let d = 1 / b; let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a); b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
}
/** Inversa de la normal estándar (aproximación de Acklam). */
export function normalInversa(p) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pb = 0.02425;
  if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
  if (p < pb) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - pb) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const q = p - 0.5; const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/** SPI de una serie de totales de lluvia: ajuste gamma (Thom) con probabilidad de ceros, pasado a la normal. */
export function spi(totales) {
  const pos = totales.filter((v) => v > 0);
  if (pos.length < 10) return totales.map(() => null); // muy pocos años para ajustar
  const q = (totales.length - pos.length) / totales.length;
  const media = pos.reduce((s, v) => s + v, 0) / pos.length;
  const A = Math.log(media) - pos.reduce((s, v) => s + Math.log(v), 0) / pos.length;
  const alfa = (1 + Math.sqrt(1 + (4 * A) / 3)) / (4 * A);
  const beta = media / alfa;
  return totales.map((v) => {
    const H = q + (1 - q) * (v > 0 ? gammaP(alfa, v / beta) : 0);
    return Math.round(normalInversa(Math.min(Math.max(H, 1e-6), 1 - 1e-6)) * 100) / 100;
  });
}

/**
 * Riesgo de sequía de un cultivo: de los años con datos, cuántos tuvieron SPI ≤ −1 sumando la lluvia
 * de los meses que el cultivo está en la chacra. meses: lista en orden desde la siembra (p. ej. [11,12,1,2,3]).
 * lluviaMensual: { "1981": [12 totales en mm o null], ... }.
 */
export function riesgoSequia(meses, lluviaMensual) {
  if (!meses?.length || !lluviaMensual) return null;
  const inicio = meses[0];
  const anios = Object.keys(lluviaMensual).map(Number).sort((a, b) => a - b);
  const totales = []; const campanas = [];
  for (const y of anios) {
    let total = 0; let completo = true;
    for (const m of meses) {
      const anio = m >= inicio ? y : y + 1;
      const v = lluviaMensual[anio]?.[m - 1];
      if (v === null || v === undefined) { completo = false; break; }
      total += v;
    }
    if (completo) { totales.push(total); campanas.push(y); }
  }
  if (totales.length < 10) return null;
  const indices = spi(totales);
  const secos = campanas.filter((_, i) => indices[i] !== null && indices[i] <= UMBRAL_SPI_SECO);
  return { anios: campanas.length, aniosSecos: secos.length, pct: Math.round((100 * secos.length) / campanas.length), ultimosSecos: secos.slice(-3) };
}
