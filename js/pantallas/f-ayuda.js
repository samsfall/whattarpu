// Camino F · Ayuda: glosario y de dónde salen los datos. Para agregar una palabra o fuente, edita las listas de abajo.
import { esc, IC, aviso, acciones } from '../ui/piezas.js';

export const PANTALLAS_F = {
  // F · Ayuda
  F1: () => `<div class="letrero"><h1>Vocabulario del campo</h1><div>Palabras que usa la app, explicadas simple</div></div>
    ${GLOSARIO.map(([i, t, d]) => `<div class="tarjeta palabra">${IC(i)}<div><b>${t}</b><p>${d}</p><button class="btn-chico" data-decir="${esc(`${t}. ${d}`)}">${IC('ui-speaker-high-fill')} Escuchar</button></div></div>`).join('')}
    ${acciones(null)}`,

  F2: () => `<h1>¿De dónde salen los datos?</h1><p class="sub">Qué usa la app, qué agregaremos y qué tan seguro es cada dato.</p>
    <h2>En uso</h2>
    ${FUENTES.filter((f) => f[3] === 'uso').map(fuenteTarjeta).join('')}
    <h2>Próximamente</h2>
    ${FUENTES.filter((f) => f[3] === 'pronto').map(fuenteTarjeta).join('')}
    <div class="tarjeta"><h2>${IC('lupa')} Satélite y estación: ¿en qué se diferencian?</h2>
      <p>El satélite cubre todo el Perú y tiene muchos años de datos, pero mide promedios de zonas grandes. La estación del Senamhi mide en un solo punto, con más precisión. Usamos el satélite para tu chacra y la estación para comprobar que se parecen.</p></div>
    ${aviso('consejo', 'idea', 'Por eso decimos “riesgo”, no “seguro”: siempre hay incertidumbre. Confirma con tu técnico o agencia agraria.')}
    <p class="leyenda">Ilustraciones: Fluent Emoji (Microsoft, licencia MIT). Íconos: Phosphor (licencia MIT).</p>
    ${acciones(null)}`,
};

const GLOSARIO = [
  ['helada', 'Helada', 'Cuando el aire baja a 0 °C o menos, casi siempre de noche. Puede quemar las hojas y matar la planta.'],
  ['sol', 'Sequía', 'Cuando llueve mucho menos de lo normal y el suelo se queda sin agua para el cultivo.'],
  ['sol', 'Año seco', 'Un año en que la lluvia de los meses del cultivo fue mucho menor que lo normal en tu zona. Se mide con el índice SPI, que usan los servicios de clima del mundo.'],
  ['lluvia', 'Inicio de lluvias', 'Las primeras lluvias de la campaña. Si llegan tarde, conviene sembrar más tarde o elegir otro cultivo.'],
  ['calendario', 'Campaña agrícola', 'El año del agricultor: va de agosto a julio. Incluye la siembra, el crecimiento y la cosecha.'],
  ['rotacion', 'Rotación', 'Cambiar de cultivo de una campaña a otra para cuidar el suelo y cortar plagas.'],
  ['descanso', 'Descanso', 'Dejar la chacra sin sembrar uno o varios años para que el suelo recupere su fuerza.'],
  ['gota', 'Riego y secano', 'Riego es dar agua a la chacra con canal o manguera. Secano es depender solo de la lluvia.'],
  ['gota', 'Evapotranspiración', 'El agua que sale del suelo y de las plantas hacia el aire. Si es alta, la planta necesita más agua.'],
  ['satelite', 'NDVI', 'Número que dice qué tan verde y sano se ve un cultivo desde el satélite.'],
  ['papa', 'Nematodo', 'Gusanito muy pequeño que vive en el suelo y ataca a la papa. Se combate rotando con otros cultivos.'],
  ['suelo-tubo', 'pH del suelo', 'Dice si el suelo es ácido o alcalino. Cada cultivo crece mejor con cierto pH.'],
  ['descanso', 'Textura del suelo', 'Si el suelo es más arenoso, arcilloso o intermedio. Cambia cuánto guarda el agua.'],
  ['grafico', 'Historial y tendencia', 'Historial: qué tan seguido pasó algo en tu zona cada mes. Tendencia: si eso está cambiando con los años.'],
  ['alerta', 'Riesgo', 'Qué tan probable es que algo dañe tu cultivo, según lo que pasó en años anteriores. No es una predicción segura.'],
];
const FUENTES = [
  ['satelite', 'NASA POWER', 'Temperatura mínima y lluvia de cada día desde 1981, en cuadros de unos 50 km. Sirve para el historial y la tendencia. Cerca de lagos puede marcar menos heladas.', 'uso'],
  ['mapa', 'Imagen satelital NASA (GIBS, MODIS)', 'La foto del mapa donde ubicas tu chacra.', 'uso'],
  ['brote', 'Vigor de la vegetación NASA (MODIS NDVI)', 'Qué tan verde está tu zona, con imágenes que juntan 8 días, en cuadros de 250 m.', 'uso'],
  ['documento', 'Fichas del INIA', 'Época de siembra, duración del cultivo y tolerancia a heladas de cada variedad.', 'uso'],
  ['montana', 'Altura SRTM (NASA)', 'La altura exacta del punto de tu chacra, con el modelo de elevación de la NASA (30 m).', 'uso'],
  ['suelo-tubo', 'SoilGrids (ISRIC)', 'pH, arena, limo y arcilla estimados del suelo; con eso sale la textura. Tu análisis de suelo siempre vale más.', 'uso'],
  ['libros', 'ECOCROP (FAO)', 'Qué temperatura, lluvia, pH, textura y altura necesita cada cultivo, y qué frío lo mata.', 'uso'],
  ['pin', 'Distritos y centros poblados (INEI)', 'La lista de lugares de Puno para ubicar tu chacra, con su altura.', 'uso'],
  ['casa', 'OpenStreetMap', 'Calles, caminos y nombres de lugares del mapa.', 'uso'],
  ['antena', 'Senamhi', 'Avisos oficiales del clima y estaciones para comprobar el dato del satélite.', 'uso'],
  ['helada', 'MODIS y SMAP (NASA)', 'Temperatura de la superficie de noche y suelo congelado, con más detalle (1 a 9 km). Para medir mejor las heladas.', 'pronto'],
  ['lluvia', 'GPM IMERG (NASA)', 'Lluvia en cuadros de unos 10 km: si las lluvias llegan tarde o hay sequía.', 'pronto'],
  ['gota', 'SMAP humedad (NASA)', 'Si el suelo está más seco de lo normal antes de sembrar.', 'pronto'],
  ['montana', 'Pendiente SRTM (NASA)', 'La pendiente del terreno, para ver el riesgo de erosión.', 'pronto'],
];
const fuenteTarjeta = ([i, t, d]) => `<div class="tarjeta palabra">${IC(i)}<div><b>${t}</b><p>${d}</p></div></div>`;
