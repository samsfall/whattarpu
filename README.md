# Whattarpu

App del equipo para el reto «Field Shift: Adapting Farms with NASA Data» (NASA Space Apps 2026).

Herramienta de apoyo para que familias agropecuarias del altiplano de Puno (Perú) comparen **qué rotación de cultivos sembrar y cuándo**, usando el clima histórico de su zona (NASA POWER, desde 1981) y fichas técnicas del INIA. Reto **Field Shift: Adapting Farms with NASA Data** – NASA Space Apps Challenge 2026.

> Te ayuda a decidir; no reemplaza el criterio del agricultor ni a su técnico.

**Quick start (English):** open the live app at `https://<usuario>.github.io/whattarpu/` on a phone, tap *Empezar*, choose a location (GPS or one of the test districts in Puno) and answer 5 questions. The app compares the farmer's current rotation with two alternatives (one may be the next step of the traditional Andean *aynoka* rotation), using frost history from NASA POWER. Five test scenarios with real data are described in `docs/escenarios.md`. Run the tests with `npm test` (Node 18+).

## Qué hace

1. **Ubica la zona** (GPS, lista de distritos o coordenadas) y muestra que el dato de clima cubre un cuadro de ~50 km.
2. **Pregunta** qué tuvo antes la chacra, cuánto tiempo la trabaja desde el último descanso, acceso al agua, mano de obra, prioridad (comida, forraje o venta) y mes de siembra.
3. **Compara 3 rotaciones**: la actual y dos alternativas, ordenadas por la prioridad del agricultor, la época de siembra, las reglas de rotación (nematodo, descanso) y el paso que sigue en la aynoka. Para cada una muestra fecha de siembra, riesgo de helada comparado entre las tres, calendario, y por qué, evidencia, beneficios, vacíos y riesgos, con enlace a la fuente.
4. **Ya sembré**: etapa aproximada del cultivo y frecuencia histórica de heladas del mes.
5. **Ayuda** en todas las pantallas: palabras simples, de dónde salen los datos y lectura en voz alta.

Las reglas son explícitas (sin IA) y cada dato del catálogo tiene su fuente. Lo que no tiene fuente se muestra como "lo que aún no sabemos".

## Estructura

Regla de la casa: **cada cosa en un solo lugar**. Para cambiar algo, busca aquí qué archivo tocar.

```
index.html                 Página única de la app (y su política de seguridad)
css/styles.css             Colores, letras y formas
js/app.js                  Arranque y navegación entre pantallas
js/estado.js               Lo que respondió el agricultor en esta consulta (solo en memoria)
js/pantallas/              Una pantalla por ID del Excel de flujos v4
  a-entrada.js             A1–A4  Bienvenida, zona, mapa, ¿qué necesitas?
  b-sembrar.js             B1–B10 Voy a sembrar: preguntas y resultado
  c-sembre.js              C1–C5  Ya sembré
  d-e-cierre.js            D1, E1 Pérdida y ¿te sirvió?
  f-ayuda.js               F1–F2  Glosario y fuentes (listas editables)
js/ui/piezas.js            Botones, tarjetas, iconos y avisos reutilizables
js/ui/mensajes.js          Avisos del Senamhi como mensajes
js/servicios/datos.js      Conexión con NASA POWER, SoilGrids, avisos y archivos de data/
js/servicios/mapa.js       Mapa satelital (NASA GIBS + Leaflet)
js/servicios/voz.js        Leer en voz alta (voz del navegador)
js/rules.js                Motor de reglas: 3 rotaciones, fecha de siembra, riesgo de helada
js/clima.js, suelo.js, avisos.js   Cálculos puros con cada fuente (con pruebas)
js/config.js               Enlaces y portada editables
data/catalogo.json         Cultivos y fichas INIA con su fuente  ← agregar cultivos aquí
data/zonas.json            Distritos con coordenadas            ← agregar zonas aquí
data/historial/            Historial NASA por zona (lo crea el script)
data/avisos.json           Avisos del Senamhi (lo crea el script)
scripts/                   Descargas de datos (POWER, Earthdata, avisos)
tests/                     Pruebas de las reglas y cálculos (npm test)
pruebas-pantallas/         Pruebas que recorren la app en Chrome (npm run probar-pantallas)
docs/flujo.md              Mapa de pantallas y estado de cada una
.github/workflows/         Pruebas automáticas y descargas programadas
```

**Comandos** (en la terminal de VS Code, la primera vez `npm install`):

| Comando | Qué hace |
|---|---|
| `npm test` | Prueba las reglas y cálculos (segundos) |
| `npm run probar-pantallas` | Recorre la app en Chrome como un agricultor |
| `npm run revisar` | Busca errores comunes en el código (ESLint) |
| `npm run todo` | Las tres anteriores, antes de guardar una versión |

## Cómo probar

**En el celular (lo más fácil):** abre el enlace de GitHub Pages del repositorio.

**En tu computadora:**

1. Descarga el repositorio (botón verde *Code → Download ZIP*) y descomprímelo.
2. Abre una terminal en la carpeta y ejecuta `python3 -m http.server 8000` (o `npm run servir`).
3. Entra a `http://localhost:8000`. Para verlo como celular, en Chrome presiona F12 y activa la vista de dispositivo móvil.

**Escenarios de prueba:** la app ya no tiene datos simulados. Para probarla hay 5 escenarios con datos reales en 4 distritos de Puno (Ilave, Mazocruz, Ayaviri y Juliaca), descritos en `docs/escenarios.md`.

**Pruebas automáticas:** con Node 18 o más, ejecuta `npm install` y luego `npm run todo`. También corren solas en GitHub en cada cambio (pestaña *Actions*).

## Datos de clima

- La app primero busca la tabla de la zona en `data/historial/<id>.json`. Si no existe, consulta la API pública de NASA POWER directamente desde el navegador.
- Para generar las tablas: agrega la zona en `data/zonas.json` (id de ubigeo, distrito, provincia, latitud y longitud de fuente oficial) y en GitHub ve a *Actions → Generar historial de clima → Run workflow*. El resultado se guarda en el repositorio con fecha de descarga y versión de la API, una vez por campaña.
- Helada = temperatura mínima del aire de 0 °C o menos (definición FAO-Senamhi).

## Recursos usados

| Recurso | Tipo | Uso | Enlace |
|---|---|---|---|
| NASA POWER (T2M_MIN, PRECTOTCORR) | NASA | Heladas y lluvia diarias desde 1981 | https://power.larc.nasa.gov/ |
| Fichas técnicas INIA (papa INIA 317, quinua Salcedo, avena INIA 902) | Perú | Época de siembra, duración, tolerancia a heladas | ver `data/catalogo.json` |
| Hoja volante INIA: nematodo quiste de la papa | Perú | Regla de rotación | ver `data/catalogo.json` |
| Senamhi | Perú | Avisos oficiales (enlace) | https://www.senamhi.gob.pe/ |

Siguiente etapa: SMAP, MODIS NDVI, ECOSTRESS (NASA Earthdata), Sentinel-2 y ERA5 (Copernicus), SoilGrids y FAO GAEZ.

## Uso de inteligencia artificial

El código y la documentación se escribieron con ayuda de Claude (Anthropic), con revisión del equipo. La app no usa IA: funciona con reglas explícitas.

## Equipo

Los Aventureros – NASA Space Apps Challenge 2026, Lima.

## Licencia

MIT. Los datos de NASA POWER son públicos; las fichas del INIA se citan con su enlace.

## Calidad y seguridad

- **Estructura:** un archivo por camino de pantallas, servicios separados para cada conexión, y datos editables sin tocar código (`data/`). Las reglas son funciones puras con pruebas (`npm test`) y la app completa tiene pruebas de pantallas (`npm run probar-pantallas`).
- **Sin dependencias de terceros en tiempo de ejecución** salvo Leaflet, copiado en `vendor/` (sin CDN).
- **Política de seguridad (CSP)** en `index.html`: solo corre código propio y solo se conecta a NASA POWER, NASA GIBS y SoilGrids.
- **Texto escapado:** todo dato que viene de afuera pasa por `esc()` antes de mostrarse.
- **Sin datos personales:** la app no guarda nada del agricultor ni usa cookies. Las claves (Earthdata) van en `.env`, que no se sube al repositorio, o en los *secrets* de GitHub.
- **Revisor de código:** ESLint (`npm run revisar`) y las pruebas corren solas en GitHub en cada cambio.
- **Pendiente:** pasar a `data/` lo que hoy es solo del altiplano (campaña agosto–julio, secuencia aynoka) para sumar regiones solo con datos.

## Libro catálogo de requisitos

- `data/catalogo.json` → `requisitos` de cada cultivo: temperatura, lluvia anual, pH, textura, altura y temperatura que mata, cada uno con su `fuente`.
- Fuente base: ECOCROP (FAO, hoy en la plataforma GAEZ), en `data/fuentes/ecocrop.json`. Si hay dato local (fichas INIA, Salcedo), ese manda.
- `js/aptitud.js` compara cada requisito con tu zona (NASA POWER + SoilGrids o tu análisis) → Apta / Apta con límites / No apta. Se ve en B7 y en B9 «¿Tu zona es apta?».
- La textura sale del triángulo textural USDA (12 clases, `js/suelo.js`) y se agrupa en gruesa/media/fina como pide ECOCROP. B10 dibuja el punto en el triángulo.
- `npm run catalogo` genera `docs/catalogo-requisitos.csv` (abre en Excel) y `docs/catalogo-requisitos.md`.

## Ubicar la chacra

- `data/puno/distritos.json`: los 110 distritos de Puno (INEI) con la latitud, longitud y altitud de su capital. `data/puno/ccpp/<ubigeo>.json`: los centros poblados de cada distrito (9372 en total), que se piden solo al elegir el distrito. Fuente: Castagnetto (2021), *ubigeo-peru-aumentado* (INEI, CEPLAN, MINSA), licencia MIT.
- Altura del punto: modelo de elevación SRTM de la NASA (30 m) vía OpenTopoData; si no responde, la altura de la capital del distrito.
- Mapa: satélite de la NASA (GIBS) con nombres y caminos encima, o mapa de calles (OpenStreetMap). El punto se puede mover; al moverlo se recalcula la altura y, si cambia de cuadro, el clima.
- Las 4 zonas piloto (Ilave, Mazocruz, Ayaviri, Juliaca) usan la coordenada de su estación del Senamhi cuando se elige el distrito sin centro poblado.
