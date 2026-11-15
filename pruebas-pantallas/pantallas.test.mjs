// Pruebas de pantallas: abren la app en Chrome y la recorren como un agricultor.
// Las fuentes externas (NASA, SoilGrids) se reemplazan por respuestas fijas, para que la prueba no dependa de Internet.
// Correr con: npm run probar-pantallas   (usa el Chrome instalado; otra ruta: CHROME_PATH=/ruta/a/chrome)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.webp': 'image/webp', '.png': 'image/png' };
const SUELO = { properties: { layers: ['phh2o:63', 'clay:220', 'sand:450', 'silt:330'].map((x) => { const [name, v] = x.split(':'); return { name, unit_measure: { d_factor: 10 }, depths: [{ values: { mean: Number(v) } }] }; }) } };
const AVISO_PRUEBA = { fuente: 'prueba', actualizado: '2026-11-15T06:00:00-05:00', avisos: [{ id: 'p1', enviado: '2026-11-15T06:00:00-05:00', evento: 'Aviso de prueba', descripcion: 'Texto de prueba.', severidad: 'Moderate', desde: '2026-11-15T00:00:00-05:00', hasta: '2099-01-01T00:00:00-05:00', areas: ['Puno - El Collao'] }] };

let servidor; let navegador; let base;
before(async () => {
  servidor = createServer(async (req, res) => {
    const ruta = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '') || 'index.html';
    if (ruta.startsWith('..')) { res.writeHead(403); res.end(); return; }
    try { const cuerpo = await readFile(join(RAIZ, ruta)); res.writeHead(200, { 'Content-Type': TIPOS[extname(ruta)] || 'application/octet-stream' }); res.end(cuerpo); }
    catch { res.writeHead(404); res.end(); }
  }).listen(0);
  base = `http://localhost:${servidor.address().port}/`;
  navegador = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' });
});
after(async () => { await navegador?.close(); servidor?.close(); });

async function abrir({ avisos = null, pronostico = null } = {}) {
  const contexto = await navegador.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const pg = await contexto.newPage(); const errores = [];
  pg.on('pageerror', (e) => errores.push(e.message));
  await pg.route('https://rest.isric.org/**', (r) => r.fulfill({ json: SUELO }));
  await pg.route('https://gibs.earthdata.nasa.gov/**', (r) => r.abort());
  await pg.route('https://power.larc.nasa.gov/**', (r) => r.abort());
  await pg.route('https://tile.openstreetmap.org/**', (r) => r.abort());
  await pg.route('https://api.opentopodata.org/**', (r) => r.abort());
  await pg.route('https://api.open-meteo.com/**', (r) => r.abort());
  if (pronostico) await pg.route('https://api.open-meteo.com/v1/forecast**', (r) => r.fulfill({ json: pronostico }));
  if (avisos) await pg.route('**/data/avisos.json', (r) => r.fulfill({ json: avisos }));
  await pg.goto(base);
  return { pg, errores, cerrar: () => contexto.close() };
}
async function irAIlave(pg) {
  await pg.click('text=Empezar');
  await pg.selectOption('#provincia', 'El Collao');
  await pg.selectOption('#distrito', '210501');
  await pg.click('#ver-mapa');
  await pg.waitForSelector('text=Historial listo');
  await pg.click('text=Sí, es mi zona');
}
async function responder(pg, ...opciones) {
  for (const t of opciones) { await pg.click(`.tile:has-text("${t}")`); await pg.click('.acciones .btn-principal'); }
}

test('Voy a sembrar: llega a las 3 opciones con suelo, fecha y aguante de cada cultivo', async () => {
  const { pg, errores, cerrar } = await abrir();
  await irAIlave(pg);
  await pg.click('text=Voy a sembrar');
  await responder(pg, 'Papa', '1 año', 'Solo lluvia', 'A mano', 'Comida');
  await pg.click('.chip:has-text("Que la app me sugiera")'); await pg.click('text=Ver opciones');
  await pg.waitForSelector('text=Rotación de cultivos');
  assert.equal(await pg.locator('.tarjeta.rotacion').count(), 3);
  assert.match(await pg.textContent('main'), /6\.3 \(estimado\)/);
  assert.match(await pg.textContent('main'), /Cuándo sembrar/);
  assert.match(await pg.textContent('main'), /¿Aguanta el frío\?/);
  assert.match(await pg.textContent('main'), /Años secos/);
  assert.match(await pg.textContent('main'), /¿Cuál aguanta mejor el clima de tu zona\?/);
  assert.deepEqual(errores, []);
  await cerrar();
});

test('En cada pregunta solo se puede marcar una opción', async () => {
  const { pg, cerrar } = await abrir();
  await irAIlave(pg);
  await pg.click('text=Voy a sembrar');
  await pg.click('.tile:has-text("Papa")'); await pg.click('.tile:has-text("Quinua")'); await pg.click('.tile:has-text("Avena")');
  assert.equal(await pg.locator('.tile.elegida').count(), 1);
  assert.match(await pg.textContent('.tile.elegida'), /Avena/);
  await cerrar();
});

test('El mes: los 12 meses desde hoy; los que no tienen siembra salen apagados con el motivo', async () => {
  const { pg, errores, cerrar } = await abrir();
  await irAIlave(pg);
  await pg.click('text=Voy a sembrar');
  await responder(pg, 'Papa', '1 año', 'Solo lluvia', 'A mano', 'Comida');
  assert.match(await pg.textContent('h1'), /Cuándo quieres sembrar/);
  assert.equal(await pg.locator('.chips .chip:not(.ancho)').count(), 12);
  if (await pg.locator('.chips .chip:disabled').count()) assert.match(await pg.textContent('main'), /no se pueden elegir/);
  const meses = await pg.locator('.chip[data-valor^="20"]').evaluateAll((bs) => bs.map((b) => b.dataset.valor));
  assert.deepEqual([...meses].sort(), meses, 'los meses van hacia adelante');
  await pg.click(`.chip[data-valor="${meses[0]}"]`); await pg.click('text=Ver opciones');
  await pg.waitForSelector('text=Rotación de cultivos');
  assert.match(await pg.textContent('main'), /Cuándo sembrar/);
  assert.deepEqual(errores, []);
  await cerrar();
});

test('Ya sembré pide el mes de siembra (sin uno marcado de antemano)', async () => {
  const { pg, cerrar } = await abrir();
  await irAIlave(pg);
  await pg.click('text=Ya sembré');
  await pg.click('.tile:has-text("Quinua")');
  assert.equal(await pg.isEnabled('#sig-c1'), false);
  assert.equal(await pg.locator('.chips .chip.elegida').count(), 0);
  await pg.click('.chips .chip >> nth=2'); assert.equal(await pg.isEnabled('#sig-c1'), true);
  await cerrar();
});

test('Descanso salta la pregunta de tiempo trabajando la tierra', async () => {
  const { pg, cerrar } = await abrir();
  await irAIlave(pg);
  await pg.click('text=Voy a sembrar');
  await responder(pg, 'Descanso');
  assert.match(await pg.textContent('h1'), /riegas/);
  await cerrar();
});

test('Ya sembré muestra los mismos cultivos y funciona sin ficha INIA', async () => {
  const { pg, errores, cerrar } = await abrir();
  await irAIlave(pg);
  await pg.click('text=Voy a sembrar');
  const enSembrar = await pg.locator('.tile').count() - 1; // sin "Descanso"
  await pg.click('[data-accion="volver"]');
  await pg.click('text=Ya sembré');
  assert.equal(await pg.locator('.tile').count(), enSembrar);
  await pg.click('.tile:has-text("Oca")'); await pg.click('.chips .chip >> nth=1'); await pg.click('#sig-c1');
  assert.match(await pg.textContent('main'), /Aún no tenemos la ficha INIA/);
  assert.deepEqual(errores, []);
  await cerrar();
});

/** Pronóstico de ejemplo: 7 noches desde hoy; la tercera baja a −3,1 °C (no es un dato real). */
function pronosticoPrueba() {
  const time = []; const hoy = new Date();
  for (let k = 0; k < 7; k++) { const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + k); time.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`); }
  return { daily: { time, temperature_2m_min: [2.1, 0.4, -3.1, -0.6, 1.5, 3, 2.2] } };
}

test('Pronóstico de heladas: aviso en la zona y comparado con el frío que daña al cultivo', async () => {
  const { pg, errores, cerrar } = await abrir({ pronostico: pronosticoPrueba() });
  await irAIlave(pg);
  await pg.waitForSelector('.sms:has-text("Pronóstico de heladas")');
  assert.match(await pg.textContent('.mensajes'), /Puede helar .* −3,1 °C/);
  assert.match(await pg.textContent('.mensajes'), /No es un aviso oficial del Senamhi/);
  await pg.click('text=Ya sembré');
  await pg.click('.tile:has-text("Papa") >> nth=0'); await pg.click('.chips .chip >> nth=1'); await pg.click('#sig-c1');
  await pg.click('.acciones .btn-principal'); await pg.click('.acciones .btn-principal');
  assert.match(await pg.textContent('h1'), /Avisos/);
  const txt = await pg.textContent('.mensajes');
  assert.match(txt, /Helada fuerte para tu papa/); assert.match(txt, /se daña desde −2,5 °C/);
  assert.equal(await pg.locator('.dias-pron li').count(), 7);
  assert.equal(await pg.locator('.dias-pron li.dana').count(), 1);
  assert.deepEqual(errores, []);
  await cerrar();
});

test('Sin pronóstico (sin internet), Avisos lo dice y deja el enlace al Senamhi', async () => {
  const { pg, cerrar } = await abrir();
  await irAIlave(pg);
  await pg.click('text=Ya sembré');
  await pg.click('.tile:has-text("Quinua")'); await pg.click('.chips .chip >> nth=1'); await pg.click('#sig-c1');
  await pg.click('.acciones .btn-principal'); await pg.click('.acciones .btn-principal');
  const txt = await pg.textContent('main');
  assert.match(txt, /no pudimos traer el pronóstico/); assert.match(txt, /Ver avisos del Senamhi/);
  await cerrar();
});

test('Los avisos del Senamhi aparecen como mensaje cuando hay uno para la zona', async () => {
  const { pg, cerrar } = await abrir({ avisos: AVISO_PRUEBA });
  await irAIlave(pg);
  await pg.waitForSelector('.sms');
  assert.match(await pg.textContent('.sms'), /Aviso de prueba/);
  await cerrar();
});

test('Sin datos simulados: provincias y distritos de Puno (INEI) y centros poblados al elegir el distrito', async () => {
  const { pg, cerrar } = await abrir();
  await pg.click('text=Empezar');
  assert.equal(await pg.locator('#simulado').count(), 0);
  assert.equal(await pg.locator('#provincia option').count(), 14); // «Elige…» + 13 provincias
  await pg.selectOption('#provincia', 'El Collao');
  const distritos = await pg.locator('#distrito option').allTextContents();
  for (const d of ['Ilave', 'Santa Rosa', 'Pilcuyo']) assert.ok(distritos.includes(d), d);
  await pg.selectOption('#distrito', '210501');
  await pg.waitForFunction(() => globalThis.document.querySelectorAll('#ccpp option').length > 10);
  assert.equal(await pg.isEnabled('#ver-mapa'), true);
  await cerrar();
});

test('Sin mapa satelital, no queda un cuadro vacío', async () => {
  const { pg, cerrar } = await abrir();
  await pg.click('text=Empezar');
  await pg.selectOption('#provincia', 'El Collao');
  await pg.selectOption('#distrito', '210501');
  await pg.click('#ver-mapa');
  // Al llegar el historial la pantalla se vuelve a dibujar: se espera eso y luego a que el mapa quede oculto con su aviso
  await pg.waitForSelector('text=Historial listo');
  await pg.waitForFunction(() => globalThis.document.getElementById('mapa')?.hidden && globalThis.document.querySelector('.sin-foto'));
  assert.equal(await pg.isVisible('#mapa'), false);
  await cerrar();
});

test('Ya sembré muestra el mapa de vigor (NDVI) o un aviso claro si no carga', async () => {
  const { pg, errores, cerrar } = await abrir();
  await irAIlave(pg);
  await pg.click('text=Ya sembré');
  await pg.click('.tile:has-text("Quinua")'); await pg.click('.chips .chip >> nth=1'); await pg.click('#sig-c1');
  await pg.click('text=Continuar');
  assert.match(await pg.textContent('h1'), /verde/);
  await pg.waitForSelector('#msg-ndvi.sin-foto');
  assert.deepEqual(errores, []);
  await cerrar();
});

test('Empezar de nuevo vuelve al inicio y borra la consulta', async () => {
  const { pg, cerrar } = await abrir();
  await irAIlave(pg);
  await pg.click('text=Tuve una pérdida');
  await pg.click('text=Terminar');
  await pg.click('.tile:has-text("Sí")'); await pg.click('#enviar');
  await pg.click('#reiniciar');
  assert.match(await pg.textContent('main'), /¿Qué sembrar y cuándo\?/);
  await pg.click('text=Empezar');
  assert.equal(await pg.inputValue('#provincia'), '');
  await cerrar();
});
