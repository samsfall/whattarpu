import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { leerCap, enlacesRss, avisosParaZona } from '../js/avisos.js';

const xml = readFileSync(new URL('./fixtures/cap-ejemplo.xml', import.meta.url), 'utf8');

test('lee los campos de un aviso CAP', () => {
  const a = leerCap(xml);
  assert.equal(a.evento, 'Descenso de temperatura nocturna');
  assert.equal(a.severidad, 'Moderate');
  assert.deepEqual(a.areas, ['Puno - El Collao', 'Cusco - Canchis']);
});

test('filtra por departamento y por vigencia', () => {
  const a = leerCap(xml);
  const zona = { departamento: 'Puno', provincia: 'El Collao' };
  assert.equal(avisosParaZona([a], zona, new Date('2026-11-17')).length, 1);
  assert.equal(avisosParaZona([a], zona, new Date('2026-11-20')).length, 0);
  assert.equal(avisosParaZona([a], { departamento: 'Loreto' }, new Date('2026-11-17')).length, 0);
});

test('saca los enlaces del canal RSS', () => {
  assert.deepEqual(enlacesRss('<rss><channel><item><link>https://a/1.xml</link></item><item><link>https://a/2.xml</link></item></channel></rss>'), ['https://a/1.xml', 'https://a/2.xml']);
});
