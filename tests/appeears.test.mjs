// Prueba con un CSV de ejemplo hecho a mano (no son datos reales).
import test from 'node:test';
import assert from 'node:assert/strict';
import { leerCsv, resumenHeladasModis } from '../scripts/lib/appeears.mjs';

const csv = `ID,Latitude,Longitude,Date,MODIS_Tile,MOD11A1_061_LST_Night_1km
ilave,-16.1,-69.6,2020-07-01,h11v10,268.15
ilave,-16.1,-69.6,2020-07-02,h11v10,275.15
ilave,-16.1,-69.6,2020-07-03,h11v10,0
ilave,-16.1,-69.6,2021-01-01,h11v10,280.15`;

test('resume las noches con helada de MODIS por mes', () => {
  const r = resumenHeladasModis(leerCsv(csv));
  assert.equal(r.meses[6].noches, 2);          // el 0 es "sin dato"
  assert.equal(r.meses[6].pctNochesConHelada, 50);
  assert.equal(r.meses[6].tempNocturnaProm, -1.5);
  assert.equal(r.meses[0].pctNochesConHelada, 0);
  assert.deepEqual(r.periodo, [2020, 2021]);
});
