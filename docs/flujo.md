# Flujo de pantallas (v4)

Los IDs coinciden con el Excel `Whattarpu_Flujos_Pantallas_v5.xlsx`. Estado: ✅ hecho en el MVP · 🟡 hecho con pendiente · ⏳ por hacer.

| ID | Pantalla | Estado | Pendiente |
|---|---|---|---|
| A1 | Bienvenida | ✅ | |
| A2 | Ubica tu zona | 🟡 | Lista de distritos (ubigeo INEI) en `data/zonas.json` |
| A3 | Mapa de confirmación | 🟡 | Mapa real del distrito (hoy es un esquema del cuadro de ~50 km) |
| A4 | ¿Qué necesitas? | ✅ | |
| B1 | ¿Qué tuvo antes? | ✅ | |
| B2 | Tiempo desde el último descanso | 🟡 | Validar rangos con la agrónoma |
| B3 | Acceso al agua | 🟡 | Regla validada |
| B4 | Mano de obra | 🟡 | Regla validada |
| B5 | Prioridad | ✅ | |
| B6 | Mes para sembrar | ✅ | 12 meses desde hoy más «Que la app me sugiera». Cada mes cruza la época INIA con la chacra (aptitud de la zona, riego, heladas fuertes); los meses sin cultivo posible salen apagados con el motivo y cada mes dice entre cuántas opciones de cultivo se puede elegir (uno por chacra) |
| B7 | 3 rotaciones | ✅ | Riesgo de sequía (falta definir "año seco") |
| B8 | Calendario de la campaña | 🟡 | Etapas con grados día |
| B9 | Detalle de una rotación | ✅ | |
| B10 | Suelo | 🟡 | Conectar SoilGrids / FAO GAEZ |
| C1 | Cultivo y fecha | ✅ | |
| C2 | Etapa y riesgo | 🟡 | Etapas con grados día; SMAP |
| C3 | ¿Qué tan verde está tu zona? (NDVI) | 🟡 | Conectado a MODIS NDVI 8 días (GIBS, 250 m). Pendiente: detalle de chacra con Sentinel-2 o Landsat |
| C4 | Avisos: pronóstico de heladas de 7 días (Open-Meteo) para el cultivo y enlace al Senamhi | 🟡 | El Senamhi no publica canal CAP; probar los avisos de lluvia del INDECI (GEOSINPAD). Acción recomendada con fuente: pendiente |
| C5 | Próxima campaña | ✅ | |
| D1 | Dónde reportar | 🟡 | Directorio de agencias agrarias de Puno |
| E1 | ¿Te sirvió? | 🟡 | Enlace a formulario en `js/config.js` |
| F1 | Glosario | ✅ | |
| F2 | ¿De dónde salen los datos? | 🟡 | Comparación con estación del Senamhi |
| F3 | Leer en voz alta | ✅ | Quechua y aimara |

Quitadas por el equipo (rojo en el Excel v2): ¿Quién la usa?, Tu zona hoy, Nombre de la chacra, Guardar chacra, Tarjeta para WhatsApp y Pasos del seguro.
