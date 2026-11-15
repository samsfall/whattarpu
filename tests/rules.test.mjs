import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tresRotaciones, fechaSiembra, mesesCiclo, campanaActual, siguienteAynoka } from '../js/rules.js';

const cat = JSON.parse(readFileSync(new URL('../data/catalogo.json', import.meta.url)));
// Historial de ejemplo hecho a mano (no es dato real): más heladas en invierno.
const hist = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, diasHeladaProm: [5, 4, 8, 15, 25, 28, 29, 27, 18, 10, 6, 5][i], pctAniosConHelada: 100 }));
const base = { previo: 'papa', tiempoTrabajo: '1', agua: 'lluvia', manoObra: 'mano', prioridad: 'forraje', mes: 11 };

test('campaña agosto–julio', () => {
  assert.equal(campanaActual(new Date(2026, 10, 14)), '2026–2027');
  assert.equal(campanaActual(new Date(2027, 2, 1)), '2026–2027');
});

test('fecha de siembra dentro de la ventana INIA', () => {
  const f = fechaSiembra(cat.cultivos.quinua, 11);
  assert.equal(f.coincide, false); // quinua: 15 set–15 oct
  assert.equal(f.fecha.getUTCMonth(), 9);
  const p = fechaSiembra(cat.cultivos.papa, 10);
  assert.equal(p.fecha.getUTCDate(), 16);
});

test('el ciclo de la papa ocupa ~4 meses', () => {
  const m = mesesCiclo(cat.cultivos.papa, new Date(Date.UTC(2001, 10, 1)));
  assert.deepEqual(m, [11, 12, 1, 2, 3]);
});

test('aynoka: papa → quinua → avena → descanso', () => {
  assert.equal(siguienteAynoka('descanso', cat), 'papa');
  assert.equal(siguienteAynoka('papa', cat), 'quinua');
  assert.equal(siguienteAynoka('avena', cat), 'descanso');
});

test('siempre devuelve 3 opciones con los 5 campos del reto', () => {
  const ops = tresRotaciones(base, cat, hist);
  assert.equal(ops.length, 3);
  for (const o of ops) for (const k of ['porque', 'evidencia', 'beneficios', 'vacios', 'riesgos']) assert.ok(Array.isArray(o[k]));
});

test('papa después de papa avisa del nematodo y ninguna alternativa es papa', () => {
  const ops = tresRotaciones(base, cat, hist);
  assert.ok(ops[0].riesgos.some((r) => r.includes('nematodo')));
  assert.ok(ops.slice(1).every((o) => o.cultivoId !== 'papa'));
});

test('las 3 opciones son distintas, también después de un descanso', () => {
  for (const previo of ['descanso', 'papa', 'quinua', 'avena', 'cebada']) {
    const ops = tresRotaciones({ ...base, previo, aniosDescanso: 4 }, cat, hist);
    assert.equal(new Set(ops.map((o) => o.cultivoId)).size, 3, previo);
  }
});

test('con 4 o más campañas sin descanso, la primera alternativa es descanso', () => {
  const ops = tresRotaciones({ ...base, tiempoTrabajo: '4+' }, cat, hist);
  assert.equal(ops[1].cultivoId, 'descanso');
});

test('sin historial no inventa riesgo', () => {
  const ops = tresRotaciones(base, cat, null);
  assert.ok(ops.every((o) => o.riesgoHelada === null));
});

test('toda evidencia tiene enlace a su fuente', () => {
  const ops = tresRotaciones({ ...base, previo: 'descanso', aniosDescanso: 4, prioridad: 'comida' }, cat, hist);
  for (const o of ops) for (const e of o.evidencia) assert.match(e.url, /^https:\/\//);
});

test('sin mes elegido, la app propone la fecha dentro de la época INIA', () => {
  const dentro = fechaSiembra(cat.cultivos.papa, null, new Date(2026, 10, 15)); // 15 nov: dentro de 16 oct – 30 nov
  assert.equal(dentro.fecha.getUTCMonth(), 10); assert.equal(dentro.fecha.getUTCDate(), 15);
  const fuera = fechaSiembra(cat.cultivos.quinua, null, new Date(2026, 10, 15)); // quinua: 15 sep – 15 oct, ya pasó
  assert.equal(fuera.fecha.getUTCMonth(), 8); assert.equal(fuera.fecha.getUTCDate(), 15);
  assert.ok(fuera.coincide);
});

test('diferencias pequeñas de sequía cuentan como parecidas', async () => {
  const { compararNivel } = await import('../js/rules.js');
  const lista = [{ v: 11 }, { v: 14 }, { v: 11 }];
  compararNivel(lista, (o) => o.v, 'n', 5);
  assert.deepEqual(lista.map((o) => o.n), ['igual', 'igual', 'igual']);
  compararNivel(lista, (o) => o.v, 'n', 0);
  assert.deepEqual(lista.map((o) => o.n), ['menor', 'mayor', 'menor']);
});
