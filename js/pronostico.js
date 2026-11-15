// Pronóstico de heladas para los próximos días en el punto exacto de la chacra.
// Fuente: API de pronóstico de Open-Meteo (temperatura mínima del aire a 2 m, ajustada a la altura del punto
// con un modelo de elevación de 90 m). No es un aviso oficial del Senamhi: la app lo dice siempre.

export const DIAS_PRONOSTICO = 7;
export const UMBRAL_HELADA = 0; // misma definición fija que el historial: helada = mínima ≤ 0 °C

/** Dirección de la consulta: mínima diaria, hora de Perú, 7 días. */
export function urlPronostico(lat, lon) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}`
    + `&daily=temperature_2m_min&timezone=America%2FLima&forecast_days=${DIAS_PRONOSTICO}`;
}

/** Respuesta de Open-Meteo → [{ fecha: 'AAAA-MM-DD', tmin }]. Devuelve null si no trae datos. */
export function leerPronostico(j) {
  const t = j?.daily?.time; const v = j?.daily?.temperature_2m_min;
  if (!Array.isArray(t) || !Array.isArray(v) || !t.length) return null;
  return t.map((fecha, i) => ({ fecha, tmin: Number.isFinite(v[i]) ? Math.round(v[i] * 10) / 10 : null }))
    .filter((d) => d.tmin !== null);
}

/**
 * Noches con helada en el pronóstico y, si se sabe, cuáles bajan al frío que daña al cultivo.
 * tMata: temperatura a la que se daña el cultivo en crecimiento (null si no hay fuente).
 */
export function heladasPronostico(dias, tMata = null) {
  if (!dias) return null;
  const heladas = dias.filter((d) => d.tmin <= UMBRAL_HELADA);
  const danan = tMata == null ? [] : dias.filter((d) => d.tmin <= tMata);
  const masFria = dias.reduce((a, d) => (a == null || d.tmin < a.tmin ? d : a), null);
  return { heladas, danan, masFria, tMata, dias: dias.length };
}
