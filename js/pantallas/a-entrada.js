// Camino A · Entrada: bienvenida, ubicar la zona, confirmar en el mapa y elegir qué necesita.
import { campanaActual } from '../rules.js';
import { estado } from '../estado.js';
import { esc, IC, paisaje, aviso, acciones } from '../ui/piezas.js';
import { mensajesSenamhi, mensajeHelada } from '../ui/mensajes.js';

export const PANTALLAS_A = {
  A1: () => `${paisaje('¿Qué sembrar y cuándo?', 'Con datos de satélite de la NASA, para tu chacra')}
    <div class="tarjeta centro">${IC('agricultora', 'ilus-grande')}
      <p>Te ayudamos a elegir qué sembrar y cuándo en tu chacra, según el clima de tu zona (datos de la NASA desde 1981) y las fichas del INIA.</p></div>
    ${aviso('info', 'mano', 'Te ayuda a decidir. <b>No reemplaza tu criterio ni a tu técnico.</b>')}
    ${acciones('A2', { texto: 'Empezar', volver: false })}`,

  A2: () => {
    const u = estado.ubic; const ds = estado.distritos;
    const provincias = [...new Set(ds.map((d) => d.provincia))].sort((a, b) => a.localeCompare(b, 'es'));
    const distritos = u.provincia ? ds.filter((d) => d.provincia === u.provincia).sort((a, b) => a.distrito.localeCompare(b.distrito, 'es')) : [];
    const opcion = (v, t, sel) => `<option value="${esc(v)}" ${sel ? 'selected' : ''}>${esc(t)}</option>`;
    return `<h1>¿Dónde está tu chacra?</h1><p class="sub">Así usamos el clima y la altura de tu zona.</p>
    <button class="btn btn-agua btn-ancho" id="gps">${IC('ui-crosshair-bold')} Usar mi ubicación</button>
    <div class="tarjeta ubicar"><h2>${IC('pin')} O búscala en la lista</h2>
      <label for="provincia">1. Provincia</label>
      <select id="provincia"><option value="">Elige…</option>${provincias.map((p) => opcion(p, p, p === u.provincia)).join('')}</select>
      <label for="distrito">2. Distrito</label>
      <select id="distrito" ${u.provincia ? '' : 'disabled'}><option value="">Elige…</option>${distritos.map((d) => opcion(d.id, d.distrito, d.id === u.distrito)).join('')}</select>
      <label for="ccpp">3. Tu comunidad o centro poblado <span class="opcional">(si no lo encuentras, déjalo así)</span></label>
      <select id="ccpp" ${u.ccppLista?.length ? '' : 'disabled'}><option value="">${u.distrito ? 'La capital del distrito' : 'Elige…'}</option>${(u.ccppLista || []).map((c, i) => opcion(String(i), c[0], String(i) === u.ccpp)).join('')}</select>
    </div>
    <p id="msg-zona" class="leyenda">Lista de distritos y centros poblados del INEI. Después podrás mover el punto en el mapa hasta tu chacra.</p>
    ${acciones(null, { id: 'ver-mapa', texto: 'Ver en el mapa', listo: !!u.distrito })}`;
  },

  A3: () => {
    const z = estado.zona;
    return `<h1>Confirma tu zona</h1>
      <div class="tarjeta">
        <div id="mapa" class="mapa" role="img" aria-label="Mapa satelital de tu zona"></div>
        <p id="msg-mapa" class="leyenda">Mueve el punto rojo hasta tu chacra. Usa «Calles» para ver nombres de pueblos y caminos, y «Satélite» para ver el terreno. El cuadro azul es la zona que cubre el dato de clima de NASA POWER.</p>
        <div class="fila-dato"><span>${IC('pin')} <span id="nombre-zona">${esc(z.nombre)}</span></span><span class="leyenda" id="coord-zona">${z.lat.toFixed(3)}, ${z.lon.toFixed(3)}</span></div>
        <div class="fila-dato"><span>${IC('montana')} Altura</span><b id="altura-zona">${z.altitud ? `${z.altitud} m` : 'calculando…'}</b></div>
        <p id="fuente-altura" class="leyenda">${esc(z.fuenteAltitud || '')}</p>
      </div>
      ${aviso('info', 'satelite', 'El clima se calcula para un cuadro de unos 50 km (así de grande es el dato de NASA POWER). Tu chacra puede ser más fría o más seca.')}
      ${z.nota ? aviso('consejo', 'helada', z.nota) : ''}
      <p id="msg-hist" class="leyenda">${estado.historial ? `Historial listo: ${estado.historial.periodo[0]}–${estado.historial.periodo[1]} · campaña ${campanaActual()}.` : 'Cargando historial de clima…'}</p>
      ${acciones('A4', { texto: 'Sí, es mi zona' })}`;
  },

  A4: () => `${mensajeHelada(null, false)}${mensajesSenamhi(false)}<h1>¿Qué necesitas?</h1>
    <button class="tarjeta camino sembrar" data-ir="B1"><span class="ilus">${IC('brote')}${IC('calendario')}</span><span><b>Voy a sembrar</b>¿Qué cultivo te conviene según el clima?</span><span class="flecha">${IC('ui-arrow-right-bold')}</span></button>
    <button class="tarjeta camino sembre" data-ir="C1"><span class="ilus">${IC('cebada')}${IC('check')}</span><span><b>Ya sembré</b>Cuéntanos cómo va tu cultivo</span><span class="flecha">${IC('ui-arrow-right-bold')}</span></button>
    <button class="tarjeta camino perdida" data-ir="D1"><span class="ilus">${IC('descanso')}${IC('alerta')}</span><span><b>Tuve una pérdida</b>Te decimos dónde reportar</span><span class="flecha">${IC('ui-arrow-right-bold')}</span></button>
    ${acciones(null)}`,
};
