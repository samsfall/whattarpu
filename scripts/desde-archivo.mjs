// Genera la tabla de historial desde un archivo de NASA POWER ya descargado.
// Uso: node scripts/desde-archivo.mjs <archivo.json> <id> <distrito> <provincia>
import { readFile, writeFile } from 'node:fs/promises';
import { leerPower, tablaZona } from '../js/clima.js';
const [archivo, id, distrito, provincia] = process.argv.slice(2);
const json = JSON.parse(await readFile(archivo, 'utf8'));
const [lon, lat, alt] = json.geometry.coordinates;
const dias = leerPower(json);
const tabla = tablaZona(dias, { id, distrito, provincia, lat, lon, altitudM: alt }, {
  descargado: '2026-11-15', versionPower: json?.header?.api?.version ?? null,
  fuenteDatos: json?.header?.sources ?? null, origen: 'archivo descargado por el equipo desde la API de NASA POWER',
});
await writeFile(new URL(`../data/historial/${id}.json`, import.meta.url), JSON.stringify(tabla, null, 2));
const faltan = dias.filter((d) => d.tmin === null || d.lluvia === null).length;
console.log(JSON.stringify({ dias: dias.length, faltan, periodo: tabla.periodo, alt, header: json.header }, null, 1));
for (const m of tabla.historial) console.log(m.mes, m.pctAniosConHelada, m.diasHeladaProm, m.lluviaProm);
console.log('tendencia', JSON.stringify(tabla.tendencia.antiguo), JSON.stringify(tabla.tendencia.reciente));
for (const t of tabla.tendencia.meses) console.log(t.mes, t.cambioDiasHelada, t.cambioLluviaMm);
