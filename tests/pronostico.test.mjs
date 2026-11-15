// Pruebas del pronóstico de heladas con una respuesta de ejemplo (no son datos reales).
import test from 'node:test';
import assert from 'node:assert/strict';
import { urlPronostico, leerPronostico, heladasPronostico } from '../js/pronostico.js';

const respuesta = { daily: { time: ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19'], temperature_2m_min: [1.24, -0.5, -3.06, null] } };

test('la consulta pide la mínima diaria de 7 días en hora de Perú', () => {
  const u = urlPronostico(-16.08, -69.64);
  assert.match(u, /^https:\/\/api\.open-meteo\.com\/v1\/forecast\?/);
  assert.match(u, /daily=temperature_2m_min/); assert.match(u, /forecast_days=7/); assert.match(u, /America%2FLima/);
});

test('lee la respuesta, redondea a 0,1 °C y descarta días sin dato', () => {
  assert.deepEqual(leerPronostico(respuesta), [{ fecha: '2026-11-16', tmin: 1.2 }, { fecha: '2026-11-17', tmin: -0.5 }, { fecha: '2026-11-18', tmin: -3.1 }]);
  assert.equal(leerPronostico({}), null);
});

test('separa las noches con helada (≤ 0 °C) de las que dañan al cultivo', () => {
  const d = leerPronostico(respuesta);
  const papa = heladasPronostico(d, -2.5);
  assert.equal(papa.heladas.length, 2); assert.equal(papa.danan.length, 1); assert.equal(papa.masFria.tmin, -3.1);
  assert.equal(heladasPronostico(d, -8).danan.length, 0);
  assert.equal(heladasPronostico(d, null).danan.length, 0);
  assert.equal(heladasPronostico(null, -2.5), null);
});
