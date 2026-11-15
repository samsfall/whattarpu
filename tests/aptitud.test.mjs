// Pruebas de la aptitud con valores de ejemplo (no son datos reales de una zona).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { estadoRango, evaluarAptitud, temperaturaCiclo, lluviaAnualProm } from '../js/aptitud.js';

const cat = JSON.parse(readFileSync(new URL('../data/catalogo.json', import.meta.url)));

test('estado de un valor frente al rango ideal y al que aguanta', () => {
  const r = { optMin: 15, optMax: 25, absMin: 7, absMax: 30 };
  assert.equal(estadoRango(20, r), 'optimo');
  assert.equal(estadoRango(9, r), 'aceptable');
  assert.equal(estadoRango(5, r), 'fuera');
  assert.equal(estadoRango(null, r), 'sin_dato');
});

test('la papa amarga es apta a 4100 m y la papa INIA 317 no', () => {
  const zona = { temperatura: 9, lluviaAnual: 650, ph: 6.3, grupoTextura: 'media', altitud: 4100 };
  assert.equal(evaluarAptitud(cat.cultivos.papa.requisitos, zona).resultado, 'no_apto');
  assert.notEqual(evaluarAptitud(cat.cultivos.papaAmarga.requisitos, zona).resultado, 'no_apto');
});

test('el análisis de textura cuenta: textura fina no es la ideal para la oca', () => {
  const r = evaluarAptitud(cat.cultivos.oca.requisitos, { grupoTextura: 'fina' });
  assert.equal(r.items.find((i) => i.clave === 'textura').estado, 'aceptable');
});

test('temperatura del ciclo y lluvia anual desde el historial', () => {
  const h = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, tempMediaProm: i < 3 ? 10 : 6, lluviaProm: 50 }));
  assert.equal(temperaturaCiclo([1, 2, 3], h), 10);
  assert.equal(lluviaAnualProm(h), 600);
  assert.equal(temperaturaCiclo([1], [{}]), null);
});

test('cultivos agregados desde las estadísticas de Puno: fuente de siembra y requisitos honestos', async () => {
  const { readFileSync } = await import('node:fs');
  const cat = JSON.parse(readFileSync(new URL('../data/catalogo.json', import.meta.url)));
  for (const id of ['olluco', 'trigo', 'arveja', 'maizAmilaceo', 'alfalfa']) {
    const c = cat.cultivos[id];
    assert.ok(c.seSiembraEnPuno.fuentes.every((f) => cat.fuentes[f]), `${id}: fuente de siembra en Puno`);
    assert.ok(c.requisitos.temperatura && c.requisitos.ph, `${id}: requisitos ECOCROP`);
  }
  assert.equal(cat.cultivos.arveja.requisitos.altitud, undefined, 'arveja: no se usa el tope de ECOCROP sin ficha local');
  assert.equal(cat.cultivos.maizAmilaceo.requisitos.textura, undefined, 'maíz: ECOCROP no trae textura');
});
