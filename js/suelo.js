// Suelo estimado de la zona con SoilGrids (ISRIC), API pública sin cuenta.
// pH en agua y porcentaje de arcilla, arena y limo de 0 a 5 cm. Son estimados de un modelo, no medidos.
export function urlSoilGrids(lat, lon) {
  const p = new URLSearchParams({ lon: String(lon), lat: String(lat), depth: '0-5cm', value: 'mean' });
  ['phh2o', 'clay', 'sand', 'silt'].forEach((x) => p.append('property', x));
  return `https://rest.isric.org/soilgrids/v2.0/properties/query?${p}`;
}

/** Convierte la respuesta de SoilGrids en { ph, arcilla, arena, limo, textura } (null si falta). */
export function leerSoilGrids(json) {
  const val = (nombre) => {
    const capa = json?.properties?.layers?.find((l) => l.name === nombre);
    const v = capa?.depths?.[0]?.values?.mean; const d = capa?.unit_measure?.d_factor || 1;
    return v === null || v === undefined ? null : v / d;
  };
  const ph = val('phh2o'); const arcilla = redondo(val('clay')); const arena = redondo(val('sand')); const limo = redondo(val('silt'));
  const t = trianguloTextural(arena, limo, arcilla);
  return { ph: ph === null ? null : Math.round(ph * 10) / 10, arcilla, arena, limo, textura: t?.clase ?? null, grupoTextura: t?.grupo ?? null };
}
function redondo(x) { return x === null ? null : Math.round(x); } // con d_factor ya queda en %

/**
 * Triángulo textural del USDA (12 clases), con los límites oficiales del Soil Survey Manual.
 * Devuelve la clase en castellano y su grupo, que es como ECOCROP (FAO) describe la textura que pide cada cultivo:
 * gruesa = "light", media = "medium", fina = "heavy".
 */
export function trianguloTextural(arena, limo, arcilla) {
  if ([arena, limo, arcilla].some((x) => x === null || x === undefined)) return null;
  const t = arena + limo + arcilla; if (!t) return null;
  const [s, si, c] = [arena, limo, arcilla].map((x) => (100 * x) / t); // normaliza a 100 %
  let clase;
  if (si + 1.5 * c < 15) clase = 'Arenosa';
  else if (si + 2 * c < 30) clase = 'Areno francosa';
  else if ((c >= 7 && c < 20 && s > 52) || (c < 7 && si < 50)) clase = 'Franco arenosa';
  else if (c >= 7 && c < 27 && si >= 28 && si < 50 && s <= 52) clase = 'Franca';
  else if (si >= 80 && c < 12) clase = 'Limosa';
  else if (si >= 50 && c < 27) clase = 'Franco limosa';
  else if (c >= 20 && c < 35 && si < 28 && s > 45) clase = 'Franco arcillo arenosa';
  else if (c >= 27 && c < 40 && s > 20 && s <= 45) clase = 'Franco arcillosa';
  else if (c >= 27 && c < 40 && s <= 20) clase = 'Franco arcillo limosa';
  else if (c >= 35 && s > 45) clase = 'Arcillo arenosa';
  else if (c >= 40 && si >= 40) clase = 'Arcillo limosa';
  else clase = 'Arcillosa';
  const grupo = ['Arenosa', 'Areno francosa', 'Franco arenosa'].includes(clase) ? 'gruesa'
    : ['Arcillo arenosa', 'Arcillo limosa', 'Arcillosa'].includes(clase) ? 'fina' : 'media';
  return { clase, grupo };
}

/** Compatibilidad: solo el nombre de la clase. */
export function claseTextura(arena, limo, arcilla) { return trianguloTextural(arena, limo, arcilla)?.clase ?? null; }
