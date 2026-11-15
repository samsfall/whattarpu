// Conexión con las fuentes de datos. Cada función devuelve el dato o null si no hay conexión: la app nunca se cae por una fuente.
import { tresRotaciones } from '../rules.js';
import { urlPower, leerPower, tablaZona, urlPowerClimatologia, leerClimatologia } from '../clima.js';
import { lluviaAnualProm } from '../aptitud.js';
import { urlSoilGrids, leerSoilGrids } from '../suelo.js';
import { estado } from '../estado.js';

/** Catálogo de cultivos y lista de zonas (archivos de data/). */
export async function cargarBase() {
  const [cat, zonas] = await Promise.all([
    fetch('data/catalogo.json').then((r) => r.json()),
    fetch('data/zonas.json').then((r) => r.json()).catch(() => ({ zonas: [] })),
  ]);
  estado.catalogo = cat; estado.zonas = zonas.zonas || [];
  estado.distritos = await fetch('data/puno/distritos.json').then((r) => r.json()).then((d) => d.distritos).catch(() => []);
}

export async function cargarHistorial(z) {
  let guardado = null;
  if (z.id) {
    try { const r = await fetch(`data/historial/${z.id}.json`); if (r.ok) guardado = await r.json(); } catch (e) { /* sigue */ }
  }
  // El archivo guardado sirve si ya trae las noches bajo cada temperatura (para el aguante de cada cultivo)
  if (guardado?.historial?.every((m) => m.diasBajo)) return completarTemperatura(guardado, z);
  try { // Si no, consulta directa a la API de NASA POWER
    const r = await fetch(urlPower(z.lat, z.lon));
    if (!r.ok) throw new Error(r.status);
    return tablaZona(leerPower(await r.json()), { lat: z.lat, lon: z.lon }, { descargado: new Date().toISOString(), origen: 'consulta directa' });
  } catch (e) {
    console.warn('POWER no disponible', e);
    return guardado ? completarTemperatura(guardado, z) : null;
  }
}

export async function cargarSuelo(z) {
  estado.suelo = undefined; // undefined = cargando, null = sin conexión
  try {
    const r = await fetch(urlSoilGrids(z.lat, z.lon));
    if (!r.ok) throw new Error(r.status);
    estado.suelo = leerSoilGrids(await r.json());
  } catch (e) { console.warn('SoilGrids no disponible', e); estado.suelo = null; }
}

export async function cargarAvisos() {
  try { const r = await fetch('data/avisos.json', { cache: 'no-cache' }); estado.avisos = r.ok ? await r.json() : { avisos: [] }; }
  catch (e) { estado.avisos = { avisos: [] }; }
}

/** Corre el motor de reglas con lo que respondió el agricultor y el suelo de su zona. */
/** Si el historial guardado no trae temperatura media, la pide a las normales de NASA POWER (una consulta pequeña). */
async function completarTemperatura(h, z) {
  if (!h?.historial || h.historial.some((m) => m.tempMediaProm !== undefined && m.tempMediaProm !== null)) return h;
  try {
    const r = await fetch(urlPowerClimatologia(z.lat, z.lon));
    const t = r.ok ? leerClimatologia(await r.json()) : null;
    if (t) { h.historial.forEach((m, i) => { m.tempMediaProm = t[i]; }); h.fuenteTemperatura = 'NASA POWER, normales mensuales de T2M'; }
  } catch (e) { /* sin temperatura: la app lo dirá como dato que falta */ }
  return h;
}

export function calcular() {
  const phAnalisis = estado.entrada.ph ? Number(String(estado.entrada.ph).replace(',', '.')) : null;
  // Mes que eligió el agricultor, o 'auto' para que la app proponga la fecha de cada cultivo
  const [anio, mes] = (estado.entrada.mesSiembra || 'auto').split('-').map(Number);
  if (mes) { estado.entrada.anioSiembra = anio; } else { delete estado.entrada.anioSiembra; }
  const entrada = { ...estado.entrada, mes: mes || undefined, phSuelo: Number.isFinite(phAnalisis) ? phAnalisis : estado.suelo?.ph ?? null, phEsAnalisis: Number.isFinite(phAnalisis) };
  entrada.altitud = estado.zona?.altitud ?? estado.historial?.zona?.altitudM ?? null;
  // Condiciones de la zona para la aptitud: el análisis del agricultor manda sobre el estimado
  const grupoAnalisis = { Arenosa: 'gruesa', 'Franco arenosa': 'gruesa', Franca: 'media', 'Franco limosa': 'media', 'Franco arcillosa': 'media', Arcillosa: 'fina' }[estado.entrada.textura];
  entrada.condiciones = { lluviaAnual: lluviaAnualProm(estado.historial?.historial), ph: entrada.phSuelo, grupoTextura: grupoAnalisis || estado.suelo?.grupoTextura || null, altitud: entrada.altitud };
  estado.opciones = tresRotaciones(entrada, estado.catalogo, estado.historial?.historial || null, estado.historial?.lluviaMensual || null);
}

/** Centros poblados de un distrito (INEI): [[nombre, lat, lon], ...]. Se piden solo cuando se elige el distrito. */
export async function cargarCentrosPoblados(ubigeo) {
  try { const r = await fetch(`data/puno/ccpp/${ubigeo}.json`); return r.ok ? await r.json() : []; } catch (e) { return []; }
}

/** Altura del punto: primero SRTM de la NASA (30 m, vía OpenTopoData); si no responde, Copernicus DEM (90 m, vía Open-Meteo). */
export async function alturaPunto(lat, lon) {
  const intentos = [
    [`https://api.opentopodata.org/v1/srtm30m?locations=${lat.toFixed(5)},${lon.toFixed(5)}`, (j) => j?.results?.[0]?.elevation, 'Altura del punto según el modelo de elevación SRTM de la NASA (30 m).'],
    [`https://api.open-meteo.com/v1/elevation?latitude=${lat.toFixed(5)}&longitude=${lon.toFixed(5)}`, (j) => j?.elevation?.[0], 'Altura del punto según el modelo de elevación Copernicus (90 m), vía Open-Meteo.'],
  ];
  for (const [url, leer, fuente] of intentos) {
    try {
      const r = await fetch(url); if (!r.ok) throw new Error(r.status);
      const e = leer(await r.json()); if (typeof e === 'number') return { altura: Math.round(e), fuente };
    } catch (e) { console.warn('Altura no disponible en', url.split('/')[2]); }
  }
  return null;
}

/** Altura del punto: SRTM de la NASA; si no responde, la de la capital del distrito (INEI). */
export async function completarAltura(z) {
  if (z.altitud && z.fuenteAltitud) return;
  const a = await alturaPunto(z.lat, z.lon);
  if (a) { z.altitud = a.altura; z.fuenteAltitud = a.fuente; }
  else if (z.altitudDistrito) { z.altitud = z.altitudDistrito; z.fuenteAltitud = 'Altura de la capital del distrito (INEI). No se pudo consultar la altura exacta del punto.'; }
  else { z.altitud = null; z.fuenteAltitud = 'No se pudo calcular la altura.'; }
  const el = document.getElementById('altura-zona'); if (el) el.textContent = z.altitud ? `${z.altitud} m` : 'sin dato';
  const f = document.getElementById('fuente-altura'); if (f) f.textContent = z.fuenteAltitud;
}
