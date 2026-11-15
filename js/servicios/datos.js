// Conexión con las fuentes de datos. Cada función devuelve el dato o null si no hay conexión: la app nunca se cae por una fuente.
import { tresRotaciones, armarOpcion } from '../rules.js';
import { urlPower, leerPower, tablaZona, urlPowerClimatologia, leerClimatologia } from '../clima.js';
import { lluviaAnualProm } from '../aptitud.js';
import { urlSoilGrids, leerSoilGrids } from '../suelo.js';
import { estado } from '../estado.js';
import { urlPronostico, leerPronostico } from '../pronostico.js';

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

/** Pronóstico de mínimas de los próximos 7 días en el punto de la chacra (Open-Meteo). null = sin conexión. */
export async function cargarPronostico(z) {
  estado.pronostico = undefined; // undefined = cargando
  try {
    const r = await fetch(urlPronostico(z.lat, z.lon));
    if (!r.ok) throw new Error(r.status);
    estado.pronostico = leerPronostico(await r.json());
  } catch (e) { console.warn('Pronóstico no disponible', e); estado.pronostico = null; }
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

/** Lo que el motor necesita: respuestas del agricultor + condiciones de la zona (suelo, lluvia, altura). Sin el mes. */
function entradaMotor() {
  const phAnalisis = estado.entrada.ph ? Number(String(estado.entrada.ph).replace(',', '.')) : null;
  const entrada = { ...estado.entrada, mes: undefined, phSuelo: Number.isFinite(phAnalisis) ? phAnalisis : estado.suelo?.ph ?? null, phEsAnalisis: Number.isFinite(phAnalisis) };
  entrada.altitud = estado.zona?.altitud ?? estado.historial?.zona?.altitudM ?? null;
  // Condiciones de la zona para la aptitud: el análisis del agricultor manda sobre el estimado
  const grupoAnalisis = { Arenosa: 'gruesa', 'Franco arenosa': 'gruesa', Franca: 'media', 'Franco limosa': 'media', 'Franco arcillosa': 'media', Arcillosa: 'fina' }[estado.entrada.textura];
  entrada.condiciones = { lluviaAnual: lluviaAnualProm(estado.historial?.historial), ph: entrada.phSuelo, grupoTextura: grupoAnalisis || estado.suelo?.grupoTextura || null, altitud: entrada.altitud };
  return entrada;
}

export function calcular() {
  // Mes que eligió el agricultor, o 'auto' para que la app proponga la fecha de cada cultivo
  const [anio, mes] = (estado.entrada.mesSiembra || 'auto').split('-').map(Number);
  if (mes) { estado.entrada.anioSiembra = anio; } else { delete estado.entrada.anioSiembra; }
  const entrada = { ...entradaMotor(), mes: mes || undefined };
  estado.opciones = tresRotaciones(entrada, estado.catalogo, estado.historial?.historial || null, estado.historial?.lluviaMensual || null);
}

/** Meses de la época de siembra de un cultivo (fichas INIA), de 1 a 12. */
export function mesesVentana(c) {
  if (!c.siembra) return [];
  const a = Number(c.siembra.desde.slice(0, 2)); const b = Number(c.siembra.hasta.slice(0, 2)); const lista = [];
  for (let m = a; ; m = m % 12 + 1) { lista.push(m); if (m === b) break; }
  return lista;
}

/**
 * Cruce para cada mes (1–12): qué cultivos se pueden sembrar en ESTA chacra.
 * Un cultivo cuenta si (1) el INIA dice que se siembra ese mes en Puno, (2) la zona es apta para él
 * (altura, lluvia o riego, pH y textura; ECOCROP/INIA) y (3) sembrado ese mes no le caen heladas fuertes
 * según el historial de la zona (nivel "cuesta" del aguante). Devuelve { mes: { cultivos, inia, noApto, helada, motivos } } (motivos: requisitos que la zona no cumple).
 */
export function mesesParaSembrar() {
  const base = entradaMotor(); const cat = estado.catalogo;
  const h = estado.historial?.historial || null; const ll = estado.historial?.lluviaMensual || null;
  const res = {};
  for (let m = 1; m <= 12; m++) res[m] = { cultivos: [], inia: [], noApto: [], helada: [], motivos: {} };
  for (const [id, c] of Object.entries(cat.cultivos)) {
    if (!c.duracionDias) continue;
    for (const m of mesesVentana(c)) {
      const r = res[m]; r.inia.push(id);
      const op = armarOpcion('alternativa', id, { ...base, mes: m }, cat, h, ll);
      if (op.aptitud?.resultado === 'no_apto') { r.noApto.push(id); r.motivos[id] = op.aptitud.items.filter((i) => i.estado === 'fuera').map((i) => i.nombre.toLowerCase()); }
      else if (op.nivelFrio === 'cuesta') r.helada.push(id);
      else r.cultivos.push(id);
    }
  }
  return res;
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
