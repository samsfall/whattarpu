// Mapa satelital (NASA GIBS + Leaflet) con el punto movible y el cuadro de NASA POWER.
import { estado } from '../estado.js';
import { IC } from '../ui/piezas.js';
import { cargarHistorial, completarAltura } from './datos.js';

let mapa = null;
const GIBS = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2025-07-15/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg';
const OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
// Celda de la malla de NASA POWER (0,5° × 0,625°) que contiene el punto
export function celdaPower(lat, lon) {
  const la = Math.round((lat + 90) / 0.5) * 0.5 - 90; const lo = Math.round((lon + 180) / 0.625) * 0.625 - 180;
  return [[la - 0.25, lo - 0.3125], [la + 0.25, lo + 0.3125]];
}
export function iniciarMapa() {
  const z = estado.zona; const el = document.getElementById('mapa');
  if (!z || !el || !window.L) return;
  mapa = L.map(el, { zoomControl: true, attributionControl: true, minZoom: 5, maxZoom: 14 }).setView([z.lat, z.lon], 10);
  const sinMapa = () => { el.hidden = true; const m = document.getElementById('msg-mapa'); if (m) { m.className = 'sin-foto'; m.innerHTML = `${IC('satelite')}<span>El mapa no se puede mostrar aquí. Se verá cuando abras la app con Internet, en tu celular o computadora, y ahí podrás mover el punto.</span>`; } };
  let errSat = 0; let okSat = 0; let errCal = 0; let okCal = 0; let satFallo = false;
  // Satélite de la NASA (foto de 250 m: se ve el lago, los cerros y los pueblos grandes) o mapa de calles con nombres (OpenStreetMap)
  const satelite = L.tileLayer(GIBS, { maxNativeZoom: 9, maxZoom: 14, attribution: 'Imagen satelital: NASA GIBS · MODIS Terra' })
    .on('tileload', () => { okSat++; })
    .on('tileerror', () => { if (++errSat >= 3 && !okSat && !satFallo) { satFallo = true; poner('calles'); } });
  // OpenStreetMap pide que cada mapa diga desde qué página se pide (la app no lo envía a otros sitios)
  const calles = L.tileLayer(OSM, { maxZoom: 14, attribution: '© colaboradores de OpenStreetMap', referrerPolicy: 'strict-origin-when-cross-origin' })
    .on('tileload', () => { okCal++; })
    .on('tileerror', () => { if (++errCal >= 2 && !okCal && satFallo) sinMapa(); });
  let actual = null;
  const poner = (cual) => {
    if (actual) mapa.removeLayer(actual);
    actual = cual === 'calles' ? calles : satelite; actual.addTo(mapa);
    el.querySelectorAll('.capa-btn').forEach((b) => b.classList.toggle('activa', b.dataset.capa === cual));
  };
  const Selector = L.Control.extend({ options: { position: 'topright' },
    onAdd() {
      const div = L.DomUtil.create('div', 'capas');
      div.innerHTML = '<button type="button" class="capa-btn" data-capa="satelite">Satélite</button><button type="button" class="capa-btn" data-capa="calles">Calles</button>';
      L.DomEvent.disableClickPropagation(div);
      div.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => poner(b.dataset.capa)));
      return div;
    } });
  mapa.addControl(new Selector());
  poner('satelite');
  // Si en 15 segundos no cargó ninguna imagen (sin Internet o bloqueado), se avisa en vez de dejar un cuadro vacío
  setTimeout(() => { if (mapa && !okSat && !okCal && el.isConnected) sinMapa(); }, 15000);
  const celda = L.rectangle(celdaPower(z.lat, z.lon), { color: '#1c4e80', weight: 2, dashArray: '8 6', fillOpacity: 0.08 }).addTo(mapa);
  const icono = L.divIcon({ className: 'pin-chacra', html: '<img src="img/iconos/pin.svg" alt="">', iconSize: [40, 40], iconAnchor: [20, 38] });
  const marca = L.marker([z.lat, z.lon], { draggable: true, icon: icono, keyboard: true, title: 'Tu chacra' }).addTo(mapa);
  marca.on('dragend', async () => {
    const p = marca.getLatLng();
    const antes = celdaPower(z.lat, z.lon)[0].join(); z.lat = p.lat; z.lon = p.lng;
    z.altitud = null; z.fuenteAltitud = null; completarAltura(z);
    const c = document.getElementById('coord-zona'); if (c) c.textContent = `${z.lat.toFixed(3)}, ${z.lon.toFixed(3)}`;
    if (!z.movido) { z.movido = true; z.nombre = `Tu chacra, cerca de ${z.nombre}`; const n = document.getElementById('nombre-zona'); if (n) n.textContent = z.nombre; }
    const a = document.getElementById('altura-zona'); if (a) a.textContent = 'calculando…';
    celda.setBounds(celdaPower(z.lat, z.lon));
    if (celdaPower(z.lat, z.lon)[0].join() !== antes) {
      z.id = null; estado.historial = null;
      const m = document.getElementById('msg-hist'); if (m) m.textContent = 'Cargando historial de clima de la nueva zona…';
      estado.historial = await cargarHistorial(z);
      if (m) m.textContent = estado.historial ? `Historial listo: ${estado.historial.periodo[0]}–${estado.historial.periodo[1]}.` : 'No se pudo cargar el historial de esta zona.';
    }
  });
}
// Vigor de la vegetación (NDVI, MODIS Terra cada 8 días, 250 m). Se pide la imagen de hace 16 días: GIBS entrega
// la de 8 días que la contiene. Si no hay, se prueba la más reciente ("default") antes de avisar.
const NDVI = (fecha) => `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/${fecha}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`;
export function iniciarMapaNdvi() {
  const z = estado.zona; const el = document.getElementById('mapa-ndvi');
  if (!z || !el || !window.L) return;
  mapa = L.map(el, { zoomControl: true, minZoom: 5, maxZoom: 9 }).setView([z.lat, z.lon], 9);
  const fecha = new Date(Date.now() - 16 * 86400000).toISOString().slice(0, 10);
  let errores = 0; let capa = null;
  const poner = (f) => {
    if (capa) mapa.removeLayer(capa);
    capa = L.tileLayer(NDVI(f), { maxNativeZoom: 9, maxZoom: 9, attribution: `NDVI: NASA GIBS · MODIS Terra (${f === 'default' ? 'más reciente' : `8 días hasta ~${f}`})` })
      .on('tileerror', () => {
        errores++;
        if (errores === 4 && f !== 'default') { errores = 0; poner('default'); return; }
        if (errores === 4) { el.hidden = true; const m = document.getElementById('msg-ndvi'); if (m) { m.className = 'sin-foto'; m.innerHTML = `${IC('satelite')}<span>El mapa de vigor de la NASA no se pudo cargar. Se ve cuando abres la app con Internet.</span>`; } }
      }).addTo(mapa);
  };
  poner(fecha);
  L.marker([z.lat, z.lon], { icon: L.divIcon({ className: 'pin-chacra', html: '<img src="img/iconos/pin.svg" alt="">', iconSize: [40, 40], iconAnchor: [20, 38] }), title: 'Tu chacra' }).addTo(mapa);
}
export function cerrarMapa() { if (mapa) { mapa.remove(); mapa = null; } }
