// Pruebas del aguante con valores de ejemplo (no son datos reales de una zona).
import test from 'node:test';
import assert from 'node:assert/strict';
import { aguanteFrio, aguanteSequia, climaZona, nivelFrio, nivelSequia } from '../js/aguante.js';
import { resumenMensual } from '../js/clima.js';

const hist = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, diasHeladaProm: i === 5 ? 10 : 0, diasBajo: { 0: i === 5 ? 10 : 0, '-2.5': i === 5 ? 4 : 0, '-3': i === 5 ? 2 : 0, '-8': 0 } }));

test('frío: cuenta noches bajo la temperatura que mata al cultivo, solo en sus meses', () => {
  assert.deepEqual(aguanteFrio([5, 6, 7], hist, -2.5), { noches: 4, tMata: -2.5, umbral: -2.5 });
  assert.equal(aguanteFrio([5, 6, 7], hist, -8).noches, 0);
  assert.equal(aguanteFrio([1, 2], hist, 0).noches, 0);
  assert.equal(aguanteFrio([5, 6], hist, null).sinDato, 'cultivo');
  assert.equal(aguanteFrio([], hist, -3).sinDato, 'epoca');
  assert.equal(nivelFrio({ noches: 0 }), 'si'); assert.equal(nivelFrio({ noches: 0.4 }), 'casi'); assert.equal(nivelFrio({ noches: 4 }), 'cuesta');
});

test('frío: sin tabla por temperaturas solo se puede usar el umbral de 0 °C', () => {
  const viejo = hist.map(({ diasBajo, ...m }) => m);
  assert.equal(aguanteFrio([6], viejo, 0).noches, 10);
  assert.equal(aguanteFrio([6], viejo, -3).sinDato, 'clima');
});

test('sequía: años bajo el mínimo del cultivo; con riego no limita', () => {
  const lluvia = { 2001: Array(12).fill(50), 2002: Array(12).fill(30), 2003: [null, ...Array(11).fill(80)] };
  assert.deepEqual(aguanteSequia(lluvia, 500, false), { aniosBajo: 1, anios: 2, minimo: 500 });
  assert.deepEqual(aguanteSequia(lluvia, 500, true), { conRiego: true });
  assert.equal(nivelSequia({ aniosBajo: 1, anios: 2 }), 'cuesta'); assert.equal(nivelSequia({ conRiego: true }), 'riego');
});

test('clima de la zona: días de helada al año y meses con más heladas', () => {
  const z = climaZona(hist, null);
  assert.equal(z.diasHelada, 10); assert.deepEqual(z.mesesFuertes, [6]); assert.equal(z.sequia, null);
});

test('el historial guarda los días bajo cada temperatura', () => {
  const dias = [{ anio: 2000, mes: 7, tmin: -3, lluvia: 0, tmed: 2 }, { anio: 2000, mes: 7, tmin: 1, lluvia: 0, tmed: 5 }];
  const julio = resumenMensual(dias, 2000, 2000)[6];
  assert.equal(julio.diasBajo['0'], 1); assert.equal(julio.diasBajo['-3'], 1); assert.equal(julio.diasBajo['-4'], 0);
});
