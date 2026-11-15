// Genera el "libro catálogo" de requisitos (CSV y Markdown) desde data/catalogo.json,
// el mismo archivo que usa la app. Uso: npm run catalogo
import { readFileSync, writeFileSync } from 'node:fs';
const c = JSON.parse(readFileSync(new URL('../data/catalogo.json', import.meta.url)));
const F = c.fuentes;
const NOM = { temperatura: 'Temperatura media del ciclo (°C)', lluviaAnual: 'Lluvia al año (mm)', ph: 'pH del suelo', textura: 'Textura del suelo', altitud: 'Altura (m)', heladaMata: 'Temperatura que mata (°C)' };
const cita = (k) => (F[k]?.cita || k);
const corto = { ecocrop: 'ECOCROP (FAO)', calendarioSierra: 'Calendario INIA 2025', salcedo: 'Salcedo (quinua)' };
const corta = (k) => corto[k] || (k.startsWith('inia') || /\d/.test(k) ? `Ficha INIA (${k})` : k);
const filas = [];
for (const cu of Object.values(c.cultivos)) {
  const r = cu.requisitos; if (!r) continue;
  for (const [k, v] of Object.entries(r)) {
    if (!NOM[k] || !v) continue;
    let ideal = ''; let aguanta = '';
    if (k === 'textura') { ideal = v.optima.join(', '); aguanta = v.aceptable.join(', '); }
    else if (k === 'heladaMata') { ideal = ''; aguanta = Object.entries(v).filter(([kk, x]) => typeof x === 'number').map(([kk, x]) => `${kk === 'enCrecimiento' ? 'en crecimiento' : 'en reposo'}: ${x}`).join('; '); }
    else if (k === 'altitud') { ideal = v.min != null ? `${v.min} a ${v.max}` : ''; aguanta = v.min == null && v.max != null ? `hasta ${v.max}` : ''; }
    else { ideal = v.optMin != null ? `${v.optMin} a ${v.optMax}` : ''; aguanta = v.absMin != null ? `${v.absMin} a ${v.absMax}` : ''; }
    const claves = [v.fuente, v.fuenteAbs].filter(Boolean); if (!claves.length) claves.push('ecocrop');
    const fuente = claves.map(cita).join(' | '); const fuenteCorta = claves.map(corta).join(' + ');
    filas.push({ fuenteCorta, cultivo: cu.nombre, especie: r.especie, requisito: NOM[k], ideal, aguanta, nota: v.nota || '', fuente, url: k === 'altitud' || !r.fichaEcocrop ? (F[v.fuente]?.url || '') : r.fichaEcocrop });
  }
}
const cols = ['cultivo', 'especie', 'requisito', 'ideal', 'aguanta', 'nota', 'fuenteCorta', 'fuente', 'url'];
const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
writeFileSync(new URL('../docs/catalogo-requisitos.csv', import.meta.url), '﻿' + [cols.join(','), ...filas.map((f) => cols.map((k) => q(f[k])).join(','))].join('\n'));
const md = ['# Libro catálogo de requisitos por cultivo', '', 'Generado desde `data/catalogo.json` con `npm run catalogo`. La app compara tu zona con estos rangos («ideal» = óptimo, «aguanta» = límite absoluto). ECOCROP da rangos de la especie en el mundo; si hay dato local INIA, ese manda.', '',
  '| Cultivo | Requisito | Ideal | Aguanta | Fuente |', '|---|---|---|---|---|',
  ...filas.map((f) => `| ${f.cultivo} (*${f.especie}*) | ${f.requisito} | ${f.ideal} | ${f.aguanta} | ${f.url ? `[${f.fuenteCorta}](${f.url})` : f.fuenteCorta}${f.nota ? ` — ${f.nota}` : ''} |`),
  '', '## ¿Por qué estos cultivos?', '', 'Son los cultivos del altiplano que aparecen en las estadísticas oficiales de siembra de Puno (MIDAGRI / Dirección Regional Agraria). Los de ceja de selva (café, arroz, yuca, maíz amarillo duro) no entran en el MVP del altiplano.', '',
  ...Object.values(c.cultivos).filter((cu) => cu.seSiembraEnPuno).map((cu) => `- **${cu.nombre}**: ${cu.seSiembraEnPuno.dato} (${cu.seSiembraEnPuno.fuentes.join(', ')})${cu.pendiente ? `. Pendiente: ${cu.pendiente.join(' ')}` : ''}`),
  '', '## Fuentes', '', ...Object.entries(F).map(([k, f]) => `- **${k}**: ${f.cita || ''}${f.url ? ` ${f.url}` : ''}`)];
writeFileSync(new URL('../docs/catalogo-requisitos.md', import.meta.url), md.join('\n') + '\n');
console.log(`${filas.length} requisitos de ${new Set(filas.map((f) => f.cultivo)).size} cultivos`);
