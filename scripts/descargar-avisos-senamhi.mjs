// Descarga los avisos vigentes del Senamhi (formato CAP de la OMM) y los guarda en data/avisos.json.
// La app lee ese archivo y los muestra como mensajes. Corre cada 3 horas en GitHub Actions o a mano: npm run avisos
// La dirección del canal se puede cambiar con la variable AVISOS_FEED.
import { writeFileSync } from 'node:fs';
import { enlacesRss, leerCap } from '../js/avisos.js';

// Canal CAP del Senamhi en español (identificador pe-senamhi-es en el Alert Hub de la OMM). POR VERIFICAR en la primera corrida.
const FEED = process.env.AVISOS_FEED || 'https://severeweather.wmo.int/v2/cap-alerts/pe-senamhi-es/rss.xml';

const r = await fetch(FEED);
if (!r.ok) throw new Error(`No se pudo leer el canal de avisos (${r.status}): ${FEED}`);
const enlaces = enlacesRss(await r.text()).slice(0, 60);
const avisos = [];
for (const url of enlaces) {
  try { const x = await fetch(url); if (x.ok) avisos.push(leerCap(await x.text(), url)); } catch (e) { console.warn('Saltado:', url, e.message); }
}
writeFileSync(new URL('../data/avisos.json', import.meta.url), JSON.stringify({ fuente: FEED, actualizado: new Date().toISOString(), avisos }, null, 1));
console.log(`Listo: ${avisos.length} avisos guardados en data/avisos.json`);
