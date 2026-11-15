// Pruebas del SPI con datos de ejemplo hechos a mano (no son datos reales de Puno).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spi, gammaP, normalInversa, riesgoSequia } from '../js/sequia.js';

test('funciones de apoyo: normal inversa y gamma incompleta', () => {
  assert.ok(Math.abs(normalInversa(0.5)) < 1e-9);
  assert.ok(Math.abs(normalInversa(0.158655) + 1) < 1e-3); // P(Z <= -1) ≈ 0.1587
  assert.ok(Math.abs(gammaP(1, 1) - (1 - Math.exp(-1))) < 1e-9); // gamma(1) = exponencial
});

test('el SPI marca como seco el año con mucha menos lluvia', () => {
  const totales = [500, 520, 480, 510, 495, 505, 490, 515, 485, 500, 250, 530];
  const indices = spi(totales);
  assert.ok(indices[10] <= -1, `año seco: ${indices[10]}`);
  assert.ok(indices.filter((v) => v <= -1).length === 1);
});

test('riesgo de sequía suma los meses del ciclo y cruza el año (nov a mar)', () => {
  const lluvia = {};
  for (let y = 2000; y <= 2015; y++) lluvia[y] = Array(12).fill(100);
  lluvia[2008] = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 10, 10]; // nov-dic 2008 muy secos
  lluvia[2009] = [10, 10, 10, ...Array(9).fill(100)]; // ene-mar 2009 muy secos
  const r = riesgoSequia([11, 12, 1, 2, 3], lluvia);
  assert.equal(r.aniosSecos, 1);
  assert.deepEqual(r.ultimosSecos, [2008]);
});

test('con la lluvia real de NASA POWER en Ilave, da un resultado entre 0 y 100 %', () => {
  const h = JSON.parse(readFileSync(new URL('../data/historial/ilave.json', import.meta.url)));
  const r = riesgoSequia([11, 12, 1, 2, 3], h.lluviaMensual);
  assert.ok(r.anios >= 40);
  assert.ok(r.pct >= 0 && r.pct <= 100);
});
