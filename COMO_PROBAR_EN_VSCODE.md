# Cómo probar la app en tu computadora (Visual Studio Code)

Todo queda solo en tu computadora. No se sube nada a GitHub hasta que tú lo decidas.

## 1. Abrir el proyecto
1. Descomprime `whattarpu.zip`.
2. En VS Code: **File → Open Folder** y elige la carpeta `whattarpu`.
3. El historial de cambios ya viene incluido (carpeta oculta `.git`). En VS Code lo ves en el ícono de **Source Control** (ramitas) o con `git log --oneline` en la terminal. Cuando lo subas a GitHub, ese historial se sube completo.

## 2. Ver la app con datos reales de la NASA (sin cuenta)
**Forma más fácil:** en VS Code instala la extensión **Live Server** (ícono de cuadritos a la izquierda → busca "Live Server" → Install). Luego clic derecho sobre `index.html` → **Open with Live Server**. Se abre Chrome con la app.

**Otra forma (terminal):**
1. Abre la terminal de VS Code: **Terminal → New Terminal**.
2. Escribe: `python -m http.server 8000` (en Mac/Linux puede ser `python3`).
3. Abre en Chrome: `http://localhost:8000`
4. Para verla como celular: en Chrome presiona **F12** y luego el ícono de celular (Toggle device toolbar).
5. En "¿Dónde está tu chacra?" elige **Ilave** o "Usar mi ubicación". En tu computadora sí carga:
   - la imagen satelital de la NASA (GIBS / MODIS) en el mapa, y
   - el clima de NASA POWER directo de su API cuando mueves el punto a otra zona.

## 3. Generar el historial de clima de una zona (NASA POWER)
1. Instala Node.js (versión 18 o más) desde nodejs.org.
2. Agrega la zona en `data/zonas.json` (id, distrito, provincia, región, latitud y longitud).
3. En la terminal: `node scripts/generar-historial.mjs`
4. Se crea `data/historial/<id>.json` con el historial y la tendencia.

## 4. Datos de la NASA que piden cuenta (MODIS para heladas)
1. Crea tu cuenta gratis en https://urs.earthdata.nasa.gov (Register).
2. En la carpeta del proyecto, copia `.env.ejemplo` con el nombre `.env` y escribe tu usuario y contraseña. Ese archivo no se sube a GitHub.
3. En la terminal: `node scripts/descargar-nasa-earthdata.mjs`
4. El programa se conecta solo a la NASA (AppEEARS), pide los datos de cada zona de `data/zonas.json`, espera a que estén listos (puede tardar minutos) y guarda el resumen en `data/historial/<id>-modis.json`.
5. Las capas que se piden están en `data/capas-nasa.json`.

## Qué se conecta solo y qué no
| Fuente | ¿Se conecta sola? | Cada cuánto |
|---|---|---|
| NASA POWER (clima diario) | Sí, API pública sin cuenta | Al consultar una zona nueva, y cada campaña (agosto) |
| Imagen satelital del mapa (NASA GIBS) | Sí, sin cuenta | Cada vez que se abre el mapa |
| MODIS / SMAP (NASA, AppEEARS) | Sí, con cuenta Earthdata guardada en `.env` (o como secreto en GitHub) | Cada campaña |
| Fichas INIA | No tienen API: se copian al catálogo | Cuando salga una ficha nueva |
| Senamhi (validación y avisos) | No hay API abierta: avisos por enlace, datos de estación descargados a mano | Una vez por campaña |

## 5. Pruebas automáticas
En la terminal de VS Code (la primera vez escribe `npm install`):

- `npm test`: prueba las reglas y cálculos.
- `npm run probar-pantallas`: abre Chrome sin mostrarlo y recorre la app como un agricultor (6 recorridos).
- `npm run revisar`: busca errores comunes en el código.
- `npm run todo`: las tres juntas. Córrelo antes de guardar una versión.

Si algo falla, el mensaje dice qué recorrido y en qué paso.

## 5. Con Claude en VS Code
Si tienes la extensión de Claude, puedes pedirle cambios directamente sobre estos archivos. Antes de cada cambio grande, guarda una versión con Source Control → mensaje → **Commit**.
