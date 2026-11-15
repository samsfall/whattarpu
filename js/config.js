// Configuración editable por el equipo.
export const CONFIG = {
  // Avisos oficiales (el pronóstico solo viene de fuentes oficiales)
  senamhiUrl: 'https://www.senamhi.gob.pe/',
  // Búsqueda de agencias agrarias en gob.pe (reemplazar por el directorio de la DRA Puno cuando lo tengamos)
  agenciasUrl: 'https://www.gob.pe/busquedas?term=agencia%20agraria%20puno',
  // Enlace a un formulario (por ejemplo, Google Forms) para "¿Te sirvió?". Vacío = solo agradece.
  formularioUrl: '',
  // Imagen de portada (opcional). Guárdala en img/portada.webp (o .jpg) en formato horizontal 2:1, mínimo 1600 × 800 px.
  // Si fue hecha con IA, deja generadaConIA en true: el concurso pide una marca visible.
  portada: { src: '', generadaConIA: true }, // cuando tengas la imagen: src: 'img/portada.webp'
};
