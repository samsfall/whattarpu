// Camino D · Tuve una pérdida, y E · Cierre (¿te sirvió?).
import { CONFIG } from '../config.js';
import { estado } from '../estado.js';
import { IC, tiles, acciones } from '../ui/piezas.js';

export const PANTALLAS_DE = {
  // D · Pérdida
  D1: () => `<h1>Tuve una pérdida</h1><p class="sub">Reporta el daño al Seguro Agrícola Catastrófico del MIDAGRI. Es gratis.</p>
    <div class="tarjeta"><h2>${IC('documento')} Qué hacer</h2>
      <ol class="pasos">
        <li><b>Avisa lo antes posible a la agencia agraria de tu zona</b>, yendo a la oficina o por teléfono. No necesitas estar empadronado.</li>
        <li>La agencia registra el daño y avisa a la empresa de seguros, a través de la Dirección Regional Agraria.</li>
        <li>Un evaluador visita tu chacra para ver el daño.</li>
        <li>Si corresponde, el seguro paga hasta S/ 1 000 por hectárea.</li>
      </ol>
      <p class="leyenda">Cubre, entre otros, heladas, sequías, granizadas, lluvias fuertes, plagas y enfermedades. Fuente: MIDAGRI, campaña 2025–2026.</p></div>
    <div class="tarjeta centro">${IC('agencia', 'ilus-media')}${IC('pin', 'ilus-media')}
      <a class="btn btn-principal btn-ancho" href="${CONFIG.agenciasUrl}" target="_blank" rel="noopener">${IC('ui-navigation-arrow-fill')} Buscar la agencia agraria</a>
      <p class="leyenda">Abre la búsqueda en gob.pe. La lista con dirección y teléfono de cada agencia de Puno está pendiente.</p></div>
    ${acciones('E1', { texto: 'Terminar' })}`,

  // E · Cierre
  E1: () => `<div class="tarjeta centro">${IC('feliz', 'ilus-grande')}<h1>¿Te sirvió?</h1></div>
    ${tiles('sirvio', [['si', 'si', 'Sí'], ['algo', 'algo', 'Un poco'], ['no', 'no', 'No']], estado.entrada.sirvio)}
    <label for="comentario">¿Qué pasó en tu chacra? (opcional)</label><input id="comentario">
    ${acciones(null, { id: 'enviar', texto: 'Enviar', listo: !!estado.entrada.sirvio })}`,
  E1ok: () => `<div class="tarjeta centro">${IC('brote', 'ilus-grande')}<h1>¡Gracias!</h1><p>Tu respuesta nos ayuda a mejorar.</p></div>
    ${acciones(null, { id: 'reiniciar', texto: 'Empezar de nuevo', volver: false })}`,
};
