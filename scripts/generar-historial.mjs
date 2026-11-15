// Descarga el clima diario de NASA POWER para cada zona de data/zonas.json
// y guarda la tabla de historial y tendencias en data/historial/<id>.json.
// Uso: node scripts/generar-historial.mjs
// Corre solo en GitHub Actions (botón "Run workflow") o en cualquier computadora con Node 18+.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { urlPower, leerPower, tablaZona } from '../js/clima.js';

const { zonas } = JSON.parse(await readFile(new URL('../data/zonas.json', import.meta.url), 'utf8'));
if (!zonas.length) { console.log('No hay zonas en data/zonas.json. Agrega al menos una.'); process.exit(0); }
await mkdir(new URL('../data/historial/', import.meta.url), { recursive: true });

for (const z of zonas) {
  const url = urlPower(z.lat, z.lon);
  console.log(`Descargando ${z.id} (${z.distrito}) → ${url}`);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`NASA POWER respondió ${r.status} para ${z.id}`);
  const json = await r.json();
  const tabla = tablaZona(leerPower(json), { id: z.id, distrito: z.distrito, provincia: z.provincia, lat: z.lat, lon: z.lon }, {
    descargado: new Date().toISOString(),
    versionPower: json?.header?.api?.version ?? null,
    url,
  });
  const destino = new URL(`../data/historial/${z.id}.json`, import.meta.url);
  await writeFile(destino, JSON.stringify(tabla, null, 2));
  console.log(`  listo: ${tabla.periodo[0]}–${tabla.periodo[1]}`);
}
