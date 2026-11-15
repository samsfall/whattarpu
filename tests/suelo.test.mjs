// Respuesta de ejemplo con la forma de SoilGrids (valores inventados para la prueba).
import test from 'node:test';
import assert from 'node:assert/strict';
import { leerSoilGrids, claseTextura, urlSoilGrids } from '../js/suelo.js';

const ej = { properties: { layers: [
  { name: 'phh2o', unit_measure: { d_factor: 10 }, depths: [{ values: { mean: 62 } }] },
  { name: 'clay', unit_measure: { d_factor: 10 }, depths: [{ values: { mean: 180 } }] },
  { name: 'sand', unit_measure: { d_factor: 10 }, depths: [{ values: { mean: 600 } }] },
  { name: 'silt', unit_measure: { d_factor: 10 }, depths: [{ values: { mean: 220 } }] },
] } };

test('lee pH y textura de SoilGrids', () => {
  const s = leerSoilGrids(ej);
  assert.equal(s.ph, 6.2); assert.equal(s.arena, 60); assert.equal(s.arcilla, 18); assert.equal(s.textura, 'Franco arenosa');
});
test('clases de textura', () => { assert.equal(claseTextura(20, 30, 50), 'Arcillosa'); assert.equal(claseTextura(40, 40, 20), 'Franca'); });
test('la URL pide pH, arcilla, arena y limo', () => { assert.match(urlSoilGrids(-16.1, -69.6), /property=phh2o.*property=clay/); });

test('triángulo textural USDA: las 12 clases con puntos de ejemplo y su grupo', async () => {
  const { trianguloTextural } = await import('../js/suelo.js');
  const casos = [
    [[92, 5, 3], 'Arenosa', 'gruesa'], [[82, 12, 6], 'Areno francosa', 'gruesa'], [[65, 25, 10], 'Franco arenosa', 'gruesa'],
    [[40, 40, 20], 'Franca', 'media'], [[20, 65, 15], 'Franco limosa', 'media'], [[5, 88, 7], 'Limosa', 'media'],
    [[60, 15, 25], 'Franco arcillo arenosa', 'media'], [[33, 34, 33], 'Franco arcillosa', 'media'], [[10, 57, 33], 'Franco arcillo limosa', 'media'],
    [[52, 8, 40], 'Arcillo arenosa', 'fina'], [[8, 47, 45], 'Arcillo limosa', 'fina'], [[20, 20, 60], 'Arcillosa', 'fina'],
  ];
  for (const [[a, l, c], clase, grupo] of casos) assert.deepEqual(trianguloTextural(a, l, c), { clase, grupo }, `${a}/${l}/${c}`);
});
