// Descarga datos de la NASA que piden cuenta Earthdata (gratis) usando la API de AppEEARS,
// para cada zona de data/zonas.json, y guarda resúmenes en data/historial/<id>-modis.json.
//
// Uso (en tu computadora, desde VS Code):
//   1) Copia .env.ejemplo como .env y escribe tu usuario y contraseña de NASA Earthdata.
//   2) node scripts/descargar-nasa-earthdata.mjs
// El archivo .env NUNCA se sube a GitHub (está en .gitignore).
// Documentación de la API: https://appeears.earthdatacloud.nasa.gov/api/
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { leerCsv, resumenHeladasModis } from './lib/appeears.mjs';

const API = 'https://appeears.earthdatacloud.nasa.gov/api';
const raiz = new URL('../', import.meta.url);

async function leerEnv() {
  const ruta = new URL('.env', raiz);
  if (existsSync(ruta)) {
    for (const l of (await readFile(ruta, 'utf8')).split('\n')) {
      const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
  const { EARTHDATA_USER: u, EARTHDATA_PASS: p } = process.env;
  if (!u || !p) { console.error('Falta EARTHDATA_USER y EARTHDATA_PASS en el archivo .env (mira .env.ejemplo).'); process.exit(1); }
  return { u, p };
}

async function api(ruta, { token, ...op } = {}) {
  const r = await fetch(`${API}${ruta}`, { ...op, headers: { ...(op.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!r.ok) throw new Error(`AppEEARS ${ruta} respondió ${r.status}: ${await r.text()}`);
  return r.headers.get('content-type')?.includes('json') ? r.json() : r.text();
}

const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

const { u, p } = await leerEnv();
const { token } = await api('/login', { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${u}:${p}`).toString('base64')}` } });
console.log('Sesión iniciada en NASA AppEEARS.');

const capas = JSON.parse(await readFile(new URL('data/capas-nasa.json', raiz), 'utf8')).capas;
// Verifica que cada capa exista en el catálogo de AppEEARS (si no, muestra las disponibles)
for (const c of capas) {
  const disp = await api(`/product/${c.product}`, { token });
  if (!disp[c.layer]) { console.error(`La capa ${c.layer} no existe en ${c.product}. Disponibles: ${Object.keys(disp).join(', ')}`); process.exit(1); }
}

const { zonas } = JSON.parse(await readFile(new URL('data/zonas.json', raiz), 'utf8'));
const hoy = new Date(); const fin = `12-31-${hoy.getFullYear() - 1}`;
for (const z of zonas) {
  const tarea = {
    task_type: 'point', task_name: `whattarpu-${z.id}`,
    params: {
      dates: [{ startDate: '02-24-2000', endDate: fin }],
      layers: capas.map(({ product, layer }) => ({ product, layer })),
      coordinates: [{ id: z.id, category: z.region || 'zona', latitude: z.lat, longitude: z.lon }],
    },
  };
  const { task_id } = await api('/task', { token, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tarea) });
  console.log(`Zona ${z.id}: pedido enviado (${task_id}). Esperando a la NASA…`);
  for (;;) { // la NASA procesa el pedido: puede tardar minutos
    const st = await api(`/status/${task_id}`, { token });
    if (st.status === 'done' || st.files) break; // al terminar, AppEEARS puede redirigir directo a los archivos
    if (st.status === 'error') throw new Error(`La NASA no pudo procesar el pedido de ${z.id}: ${JSON.stringify(st)}`);
    process.stdout.write('.'); await esperar(30000);
  }
  const bundle = await api(`/bundle/${task_id}`, { token });
  const dir = new URL(`data/crudo/${z.id}/`, raiz); await mkdir(dir, { recursive: true });
  const resumen = { zona: z, descargado: new Date().toISOString(), tarea: task_id };
  for (const f of bundle.files.filter((x) => x.file_name.endsWith('.csv'))) {
    const csv = await api(`/bundle/${task_id}/${f.file_id}`, { token });
    await writeFile(new URL(f.file_name.split('/').pop(), dir), csv);
    if (f.file_name.includes('MOD11A1')) resumen.heladasModis = resumenHeladasModis(leerCsv(csv));
  }
  await writeFile(new URL(`data/historial/${z.id}-modis.json`, raiz), JSON.stringify(resumen, null, 2));
  console.log(`\nZona ${z.id}: listo → data/historial/${z.id}-modis.json`);
}
