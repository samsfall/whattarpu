// Pruebas con datos de ejemplo hechos a mano (no son datos reales de Puno).
import test from 'node:test';
import assert from 'node:assert/strict';
import { leerPower, resumenMensual, tablaZona, urlPower } from '../js/clima.js';

function powerFalso() {
  const T = {}; const P = {};
  for (const anio of [2000, 2001]) {
    for (let d = 1; d <= 31; d++) {
      const dd = String(d).padStart(2, '0');
      T[`${anio}06${dd}`] = d <= (anio === 2000 ? 10 : 0) ? -2 : 3; // junio: 10 heladas en 2000, 0 en 2001
      P[`${anio}06${dd}`] = 0;
      T[`${anio}01${dd}`] = 5; P[`${anio}01${dd}`] = d === 1 ? -999 : 4; // enero: un dato faltante
    }
  }
  return { properties: { parameter: { T2M_MIN: T, PRECTOTCORR: P } } };
}

test('lee la respuesta de POWER e ignora el valor faltante -999', () => {
  const dias = leerPower(powerFalso());
  assert.equal(dias.filter((d) => d.lluvia === null).length, 2);
});

test('cuenta heladas (<= 0 °C) por mes', () => {
  const r = resumenMensual(leerPower(powerFalso()), 2000, 2001);
  const junio = r[5];
  assert.equal(junio.pctAniosConHelada, 50);
  assert.equal(junio.diasHeladaProm, 5);
  assert.equal(r[0].diasHeladaProm, 0);
  assert.equal(r[0].lluviaProm, 120); // 30 días x 4 mm
});

test('arma la tabla de zona con periodo y tendencia', () => {
  const t = tablaZona(leerPower(powerFalso()), { id: 'x' });
  assert.deepEqual(t.periodo, [2000, 2001]);
  assert.equal(t.tendencia.meses[5].cambioDiasHelada, -10);
});

test('la URL pide temperatura mínima, media y lluvia', () => {
  const u = urlPower(-15.8, -70, '19810101', '20251231');
  assert.match(u, /T2M_MIN%2CT2M%2CPRECTOTCORR/);
  assert.match(u, /start=19810101/);
});
