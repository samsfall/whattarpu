// Camino B · Voy a sembrar: preguntas (B1–B6) y resultado (B7–B10).
import { MESES, MESES_LARGO } from '../rules.js';
import { estado } from '../estado.js';
import { climaZona } from '../aguante.js';
import { esc, fuenteHtml, IC, icCultivo, nombreCultivo, cultivos, avance, actividad, tiles, acciones, aviso, ventana } from '../ui/piezas.js';

const COLOR = { si: 'Bajo', riego: 'Bajo', casi: 'Medio', cuesta: 'Alto' };

export const PANTALLAS_B = {
  // B · Voy a sembrar: preguntas
  B1: () => `${avance(1, 6)}<h1>¿Qué tuvo antes esta chacra?</h1>
    ${actividad("toca el cultivo anterior o 'Descanso' y cuántos años.")}
    ${tiles('previo', [...cultivos(), ['descanso', 'descanso', 'Descanso']], estado.entrada.previo)}
    <p class="leyenda">Si en esta chacra siembras varios cultivos juntos, elige el principal. Si tienes varias chacras, haz una consulta por cada una.</p>
    ${estado.entrada.previo === 'descanso' ? `<label>${IC('reloj')} ¿Cuántos años descansó?</label>
      <div class="selector"><button data-anios="-1" aria-label="Menos">${IC('ui-caret-left-bold')}</button><output>${estado.entrada.aniosDescanso} ${estado.entrada.aniosDescanso === 1 ? 'año' : 'años'}</output><button data-anios="1" aria-label="Más">${IC('ui-caret-right-bold')}</button></div>` : ''}
    ${acciones(estado.entrada.previo === 'descanso' ? 'B3' : 'B2', { listo: !!estado.entrada.previo })}`,

  B2: () => `${avance(2, 6)}<h1>¿Cuánto tiempo trabajas esta tierra desde su último descanso?</h1>
    ${actividad('elige un rango de tiempo.')}
    ${tiles('tiempoTrabajo', [['0', 'brote', 'Menos de 1 año'], ['1', 'avena', '1 año'], ['2', 'cebada', '2 años'], ['3', 'papa', '3 años'], ['4+', 'rotacion', '4 años o más']], estado.entrada.tiempoTrabajo, 'dos')}
    <p class="leyenda">Rangos provisionales: los valida la agrónoma del equipo.</p>
    ${acciones('B3', { listo: !!estado.entrada.tiempoTrabajo })}`,

  B3: () => `${avance(3, 6)}<h1>¿Cómo riegas tu chacra?</h1>
    ${actividad('elige cómo le llega el agua.')}
    ${tiles('agua', [['lluvia', 'sol', 'Solo lluvia', 'sin riego'], ['inundacion', 'gota', 'Por inundación', 'surcos o canal'], ['aspersion', 'lluvia', 'Por aspersión', 'como lluvia'], ['goteo', 'gota', 'Por goteo', 'gota a gota']], estado.entrada.agua, 'dos')}
    <p class="leyenda">Si tienes riego, la falta de lluvia ya no limita al cultivo (criterio de la agrónoma del equipo).</p>
    ${acciones('B4', { listo: !!estado.entrada.agua })}`,

  B4: () => `${avance(4, 6)}<h1>¿Con qué trabajas la tierra?</h1>
    ${tiles('manoObra', [['mano', 'mano', 'A mano'], ['yunta', 'buey', 'Con yunta', 'tracción animal'], ['tractor', 'tractor', 'Con tractor', 'propio o alquilado']], estado.entrada.manoObra)}
    ${acciones('B5', { listo: !!estado.entrada.manoObra })}`,

  B5: () => {
    const usos = { comida: 'alimento', forraje: 'el ganado', venta: 'vender' };
    const p = estado.entrada.prioridad;
    const lista = p ? Object.entries(estado.catalogo.cultivos).filter(([, c]) => c.usos.includes(p)) : [];
    return `${avance(5, 6)}<h1>Comida · forraje · venta</h1><p class="sub">¿Qué es lo más importante para ti esta campaña?</p>
      ${tiles('prioridad', [['comida', 'comida', 'Comida'], ['forraje', 'vaca', 'Forraje'], ['venta', 'venta', 'Venta']], p)}
      ${p ? `<div class="tarjeta"><h2>Cultivos para ${usos[p]}</h2>${lista.map(([id, c]) => `<div class="fila-dato"><span>${IC(id)} ${esc(c.nombre)}</span></div>`).join('')}</div>` : ''}
      ${acciones('B6', { listo: !!p })}`;
  },

  // B6: los 12 meses desde hoy. Los meses en que ningún cultivo del catálogo se siembra en Puno salen apagados, con el motivo.
  B6: () => {
    const elegido = estado.entrada.mesSiembra; const siembra = mesesConSiembra();
    const meses = proximos12();
    const apagados = meses.filter(([m]) => !siembra.has(m));
    return `${avance(6, 6)}<h1>¿Cuándo quieres sembrar?</h1>
      <p class="sub">Elige el mes que tienes pensado, o deja que la app te proponga la mejor fecha para cada cultivo.</p>
      <div class="chips" role="group">
        <button class="chip ancho ${elegido === 'auto' ? 'elegida' : ''}" data-campo="mesSiembra" data-valor="auto" aria-pressed="${elegido === 'auto'}">${IC('idea')} Que la app me sugiera</button>
        ${meses.map(([m, a]) => { const v = `${a}-${String(m).padStart(2, '0')}`; const ok = siembra.has(m);
          return `<button class="chip ${elegido === v ? 'elegida' : ''}" ${ok ? `data-campo="mesSiembra" data-valor="${v}"` : 'disabled aria-disabled="true"'} aria-pressed="${elegido === v}">${MESES_LARGO[m - 1]}<small>${a}</small></button>`; }).join('')}
      </div>
      ${apagados.length ? `<p class="leyenda">${IC('alerta')} Los meses en gris (${apagados.map(([m]) => MESES_LARGO[m - 1]).join(', ')}) no se pueden elegir: en Puno ningún cultivo de la app se siembra en esos meses, según las fichas del INIA.</p>` : ''}
      ${acciones('B7', { texto: 'Ver opciones', listo: !!elegido })}`;
  },

  // B · Voy a sembrar: resultado
  B7: () => {
    const ops = estado.opciones;
    const tags = ['Tu rotación actual', 'Alternativa 1', 'Alternativa 2']; const cls = ['actual', 'alt1', 'alt2'];
    return `<h1>Rotación de cultivos</h1><p class="sub">El clima de tu zona es el mismo para todos; lo que cambia es cuánto aguanta cada cultivo.</p>
      ${resumenZona()}
      ${ops.map((o, i) => `<div class="tarjeta rotacion ${cls[i]}">
        <span class="rot-tag">${i ? '✔ ' : ''}${tags[i]}</span>
        ${secuencia(o)}
        <div class="fila-dato"><span>${IC('helada')} ¿Aguanta el frío?</span><span class="nivel nivel-${COLOR[o.nivelFrio] || 'sin'}">${textoFrio(o)}</span></div>
        <div class="fila-dato"><span>${IC('sol')} ¿Aguanta la sequía?</span><span class="nivel nivel-${COLOR[o.nivelSeco] || 'sin'}">${textoSeco(o)}</span></div>
        <div class="fila-dato"><span>${IC('lupa')} Tu zona para este cultivo</span><span class="nivel nivel-${{ apto: 'Bajo', limitado: 'Medio', no_apto: 'Alto' }[o.aptitud?.resultado] || 'sin'}">${{ apto: 'Apta', limitado: 'Apta con límites', no_apto: 'No apta', sin_datos: 'Faltan datos' }[o.aptitud?.resultado] || 'Sin requisitos aún'}</span></div>
        <div class="fila-dato"><span>${IC('calendario')} Cuándo sembrar</span><b>${cuando(o)}</b></div>
        ${o.fueraDeAltura ? `<div class="aviso consejo">${IC('montana')}<div>Tu zona está más alta (o más baja) de lo que indica la ficha para este cultivo.</div></div>` : ''}
        ${o.siembra?.automatica && !o.siembra.abierta && o.siembra.diasFaltan > 60 ? '<p class="leyenda">La época de siembra de este año ya pasó: sería para la próxima campaña.</p>' : ''}
        ${o.cultivoId === 'descanso' ? `<button class="btn btn-secundario btn-ancho" data-verdet="${i}">Ver por qué descansar</button>`
          : o.siembra ? `<button class="btn btn-secundario btn-ancho" data-ver="${i}">Ver calendario y detalle</button>`
          : `<div class="aviso consejo">${IC('lupa')}<div>Aún no calculamos la época de siembra de ${esc(o.nombre.toLowerCase())} en Puno, por eso no hay calendario ni riesgo de helada o sequía.</div></div>${o.aptitud ? `<button class="btn btn-secundario btn-ancho" data-verdet="${i}">Ver si tu zona es apta</button>` : ''}`}
      </div>`).join('')}
      ${comparativoAguante(ops, tags)}
      ${acciones('E1', { texto: 'Terminar' })}`;
  },

  B8: () => {
    const o = estado.opciones[estado.ver]; const h = estado.historial?.historial;
    const ini = o.siembra ? o.siembra.fecha.getUTCMonth() + 1 : null; const fin = o.meses.length ? o.meses[o.meses.length - 1] : null;
    const celdas = (fn) => MESES.map((_, i) => fn(i + 1)).join('');
    const top = o.meses.map((m) => h?.find((x) => x.mes === m)).filter(Boolean).sort((a, b) => b.diasHeladaProm - a.diasHeladaProm).slice(0, 2);
    return `${cabeceraOpcion(o)}${pestanasOpcion('B8')}
      ${o.meses.length ? `<div class="tarjeta"><h2>Tira de meses</h2><div class="gantt">
        <span></span>${MESES.map((m) => `<span class="mes">${m}</span>`).join('')}
        <span class="etq">${IC('brote')}Siembra</span>${celdas((m) => `<span class="c ${m === ini ? 'siembra' : ''}"></span>`)}
        <span class="etq">${IC(icCultivo(o.cultivoId))}Campo</span>${celdas((m) => `<span class="c ${o.meses.includes(m) && m !== ini && m !== fin ? 'campo' : ''}"></span>`)}
        <span class="etq">${IC('cebada')}Cosecha</span>${celdas((m) => `<span class="c ${m === fin ? 'cosecha' : ''}"></span>`)}
        <span class="etq">${IC('helada')}Heladas</span>${celdas((m) => { const f = h?.find((x) => x.mes === m); return `<span class="c ${f ? 'riesgo' : ''}" style="opacity:${f ? (0.15 + f.pctAniosConHelada / 120).toFixed(2) : 1}" title="${f ? `${f.pctAniosConHelada} % de años con helada` : ''}"></span>`; })}
      </div><p class="leyenda">Azul más intenso = más años con helada en ese mes.</p></div>
      <div class="info3">
        <div>${IC('brote')}<span>Mejor época de siembra</span><b>${ventana({ siembra: o.siembra.ventana })}</b></div>
        <div>${IC('helada')}<span>Meses con más heladas</span><b>${top.length ? top.map((x) => MESES[x.mes - 1]).join(' y ') : 'sin dato'}</b></div>
        <div>${IC('descanso')}<span>Chacra sin cultivo</span><b>${MESES.filter((_, i) => !o.meses.includes(i + 1)).length} meses</b></div>
      </div>`
      : aviso('consejo', 'alerta', 'Sin calendario: falta la época de siembra o la duración con fuente para este cultivo.')}
      ${acciones('B9', { texto: 'Ver detalle' })}`;
  },

  B9: () => {
    const o = estado.opciones[estado.ver];
    const secciones = { requisitos: ['¿Tu zona es apta?', 'lupa', null], porque: ['Por qué', 'idea', o.porque], evidencia: ['Evidencia', 'documento', o.evidencia], beneficios: ['Beneficios', 'brote', o.beneficios], vacios: ['Vacíos', 'lupa', o.vacios], riesgos: ['Riesgos', 'alerta', o.riesgos] };
    const [titulo, ic, xs] = secciones[estado.tab];
    const item = (x) => (typeof x === 'string' ? esc(x) : esc(x.texto) + fuenteHtml(x));
    return `${cabeceraOpcion(o)}${pestanasOpcion('B9')}
      <div class="pestanas" role="tablist">${Object.entries(secciones).map(([k, [t, i]]) => `<button role="tab" class="${k === estado.tab ? 'activa' : ''}" data-tab="${k}">${IC(i)}${t}</button>`).join('')}</div>
      ${estado.tab === 'requisitos' ? tablaAptitud(o) : `<div class="tarjeta"><h2>${IC(ic)} ${titulo}</h2>${xs.length ? `<ul>${xs.map((x) => `<li>${item(x)}</li>`).join('')}</ul>` : '<p class="leyenda">Nada que mostrar aquí.</p>'}</div>`}
      ${acciones('B10', { texto: 'Ver suelo' })}`;
  },

  B10: () => {
    const sg = estado.suelo; const ph = sg?.ph;
    const ang = ph ? Math.min(1, Math.max(0, (ph - 4) / 5)) : null; // escala 4 a 9
    const x = ang === null ? null : 100 - 80 * Math.cos(Math.PI * ang); const y = ang === null ? null : 100 - 80 * Math.sin(Math.PI * ang);
    return `<h1>Suelo de tu zona</h1>
    <div class="tarjeta centro">
      <svg viewBox="0 0 200 115" width="70%" role="img" aria-label="pH estimado ${ph ?? 'sin dato'}">
        <defs><linearGradient id="gph" x1="0" x2="1"><stop offset="0" stop-color="#c8342b"/><stop offset=".5" stop-color="#1e7a46"/><stop offset="1" stop-color="#1c4e80"/></linearGradient></defs>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="url(#gph)" stroke-width="14" stroke-linecap="round" opacity="${ph ? 1 : 0.25}"/>
        ${ph ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="#fff" stroke="#13283b" stroke-width="3"/>` : ''}
        <text x="100" y="92" text-anchor="middle" font-size="24" font-weight="800" fill="#13283b" font-family="Bricolage Grotesque, Arial">${ph ? `pH ${ph}` : 'pH ?'}</text>
      </svg>
      <div class="fila-dato"><span>${IC('suelo-tubo')} pH estimado</span><b>${ph ? `${ph} · ${ph < 5.5 ? 'ácido' : ph > 7.8 ? 'alcalino' : 'moderado'}` : sg === null ? 'sin conexión' : 'cargando…'}</b></div>
      <div class="fila-dato"><span>${IC('descanso')} Textura estimada</span><b>${sg?.textura ?? (sg === null ? 'sin conexión' : 'cargando…')}</b></div>
      ${sg?.arcilla != null ? `<div class="fila-dato"><span>Arena · limo · arcilla</span><b>${sg.arena} % · ${sg.limo} % · ${sg.arcilla} %</b></div>${trianguloSvg(sg.arena, sg.limo, sg.arcilla)}<p class="leyenda">El punto verde es tu suelo en el triángulo textural del USDA: de ahí sale la clase «${esc(sg.textura)}» (textura ${{ gruesa: 'gruesa', media: 'media', fina: 'fina' }[sg.grupoTextura]}).</p>` : ''}
      <p class="leyenda">Estimado por el modelo SoilGrids (ISRIC) para tu ubicación, capa de 0 a 5 cm. No reemplaza un análisis de laboratorio.</p></div>
    <div class="tarjeta"><h2>${IC('documento')} ¿Tienes un análisis de suelo?</h2>
      <p class="sub">Si lo tienes (por ejemplo, del INIA), escríbelo: la app lo usará en vez del estimado para revisar qué cultivos van con tu suelo en esta consulta. No se guarda.</p>
      <label for="ph">pH de tu análisis</label><input id="ph" inputmode="decimal" placeholder="Ej. 6.5" value="${esc(estado.entrada.ph || '')}">
      <label for="textura">Textura de tu análisis</label><select id="textura">${['', 'Arenosa', 'Franco arenosa', 'Franca', 'Franco limosa', 'Franco arcillosa', 'Arcillosa'].map((t) => `<option ${estado.entrada.textura === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    ${acciones(null, { id: 'guardar-suelo', texto: 'Ver las 3 opciones' })}`;
  },
};

// ¿Tu zona es apta? Cada requisito del cultivo frente a lo que la app sabe de tu zona, con su fuente
function tablaAptitud(o) {
  const a = o.aptitud;
  if (!a?.items.length) return `<div class="tarjeta"><h2>${IC('lupa')} ¿Tu zona es apta?</h2><p class="leyenda">Aún no hay requisitos con fuente para este cultivo.</p></div>`;
  const ETQ = { optimo: ['Ideal', 'Bajo'], aceptable: ['Aguanta', 'Medio'], fuera: ['Fuera', 'Alto'], sin_dato: ['Falta dato', 'sin'] };
  const fuenteDe = (clave) => { const f = estado.catalogo.fuentes[clave]; return f ? (f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(clave === 'ecocrop' ? 'ECOCROP (FAO)' : clave === 'calendarioSierra' ? 'Calendario INIA 2025' : 'Ficha INIA')}</a>` : esc(clave)) : ''; };
  const frase = { apto: 'Tu zona cumple los requisitos de este cultivo.', limitado: 'Tu zona sirve, pero algún requisito está en el límite.', no_apto: 'Al menos un requisito queda fuera de lo que el cultivo aguanta.', sin_datos: 'Faltan datos de tu zona para decidir.' }[a.resultado];
  return `<div class="tarjeta"><h2>${IC('lupa')} ¿Tu zona es apta?</h2><p><b>${frase}</b></p>
    <div class="requisitos">${a.items.map((i) => `<div class="req">
      <div class="req-cab"><b>${esc(i.nombre)}</b><span class="nivel nivel-${ETQ[i.estado][1]}">${ETQ[i.estado][0]}</span></div>
      <div class="req-fila"><span>Tu zona</span><b>${esc(i.zona ?? 'sin dato')}</b></div>
      <div class="req-fila"><span>El cultivo</span><span>${esc(i.rango)}</span></div>
      <div class="req-fuente">Fuente: ${fuenteDe(i.fuente)}${i.fuenteAbs ? ` y ${fuenteDe(i.fuenteAbs)}` : ''}${i.nota ? ` · ${esc(i.nota)}` : ''}</div></div>`).join('')}</div>
    <p class="leyenda">ECOCROP da rangos generales de la especie en el mundo; cuando hay un dato local de la variedad (INIA), se usa ese. Tu análisis de suelo reemplaza al estimado.</p></div>`;
}

// Triángulo textural (USDA): el punto de tu suelo entre arena, limo y arcilla
export function trianguloSvg(arena, limo, arcilla) {
  if ([arena, limo, arcilla].some((v) => v == null)) return '';
  const t = arena + limo + arcilla; const c = arcilla / t; const si = limo / t;
  const W = 200; const H = 173; const x = 10 + W * (si + c / 2); const y = 10 + H * (1 - c);
  return `<svg class="triangulo" viewBox="0 0 220 210" role="img" aria-label="Triángulo textural: ${arena} % arena, ${limo} % limo, ${arcilla} % arcilla">
    <polygon points="10,183 210,183 110,10" fill="#f4efe6" stroke="#9a5b34" stroke-width="2"/>
    <line x1="${10 + W * 0.2}" y1="${10 + H * 0.6}" x2="${10 + W * 0.8}" y2="${10 + H * 0.6}" stroke="#9a5b34" stroke-opacity=".35"/>
    <line x1="${10 + W * 0.3}" y1="${183}" x2="${10 + W * 0.3 + W * 0.2}" y2="${10 + H * 0.6}" stroke="#9a5b34" stroke-opacity=".35"/>
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#1e7a46" stroke="#fff" stroke-width="2"/>
    <text x="110" y="8" text-anchor="middle" font-size="12" fill="#13283b" dominant-baseline="hanging" dy="-6">Arcilla</text>
    <text x="6" y="200" font-size="12" fill="#13283b">Arena</text><text x="214" y="200" text-anchor="end" font-size="12" fill="#13283b">Limo</text></svg>`;
}

function secuencia(o) {
  return `<div class="secuencia"><span class="paso-cult">${IC(icCultivo(estado.entrada.previo))}${esc(nombreCultivo(estado.entrada.previo))}</span>${IC('ui-arrow-right-bold', 'fl')}<span class="paso-cult ahora">${IC(icCultivo(o.cultivoId))}${esc(o.nombre)}</span></div>`;
}
function cabeceraOpcion(o) {
  return `<div class="cabecera">${IC(icCultivo(o.cultivoId))}<div><p class="sub">${['Tu rotación actual', 'Alternativa 1', 'Alternativa 2'][estado.ver]} · después de ${esc(nombreCultivo(estado.entrada.previo).toLowerCase())}</p><h1>${esc(o.nombre)}</h1></div></div>`;
}
function pestanasOpcion(actual) {
  return `<div class="pestanas">${[['B8', 'calendario', 'Tira de meses'], ['B9', 'documento', 'Detalle'], ['B10', 'suelo-tubo', 'Suelo']].filter(([id]) => id !== 'B8' || estado.opciones?.[estado.ver]?.siembra).map(([id, i, t]) => `<button class="${id === actual ? 'activa' : ''}" data-ir="${id}">${IC(i)}${t}</button>`).join('')}</div>`;
}
// ¿Aguanta el frío? Noches al año, en sus meses de cultivo, con la temperatura que mata al cultivo o menos
const grados = (x) => `${String(x).replace('.', ',')} °C`;
function textoFrio(o) {
  const a = o.aguanteFrio;
  if (!a || a.sinDato) return { cultivo: 'Falta su dato', epoca: 'Falta su época de siembra', clima: 'Falta el clima de tu zona' }[a?.sinDato] || 'Sin dato';
  if (a.noches === 0) return `Sí · su límite es ${grados(a.umbral)}`;
  if (a.noches < 1) return `Casi siempre · algún año baja de ${grados(a.umbral)}`;
  return `Le cuesta · ${String(a.noches).replace('.', ',')} noches al año bajo ${grados(a.umbral)}`;
}
// ¿Aguanta la sequía? Años en que llovió menos de lo mínimo que aguanta el cultivo (o «con riego»)
function textoSeco(o) {
  const a = o.aguanteSequia;
  if (!a || a.sinDato) return { cultivo: 'Falta su dato', clima: 'Falta la lluvia de tu zona' }[a?.sinDato] || 'Sin dato';
  if (a.conRiego) return 'Con tu riego, sí';
  if (a.aniosBajo === 0) return `Sí · siempre llovió más de ${a.minimo} mm`;
  return `${a.aniosBajo / a.anios <= 0.2 ? 'Casi siempre' : 'Le cuesta'} · ${a.aniosBajo} de ${a.anios} años con menos de ${a.minimo} mm`;
}
// Cuándo sembrar: con el mes que eligió el agricultor, o la fecha que propone la app con la época INIA
function cuando(o) {
  const s = o.siembra; if (!s) return '—';
  const f = (d) => `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`;
  if (s.automatica) return s.abierta ? `Ahora · hasta el ${f(s.hasta)}` : `Desde el ${f(s.fecha)} ${s.anio}`;
  if (s.coincide) return `${f(s.fecha)} ${estado.entrada.anioSiembra ?? ''}`.trim();
  return `Tu mes no es su época (${ventana({ siembra: s.ventana })})`;
}

// ¿Cuál aguanta mejor el clima de tu zona? Frío y sequía de cada opción, frente a su propio límite
function comparativoAguante(ops, tags) {
  if (!ops.some((o) => o.aguanteFrio?.noches !== undefined || o.aguanteSequia?.aniosBajo !== undefined || o.aguanteSequia?.conRiego)) return '';
  const icono = { si: 'check', riego: 'gota', casi: 'alerta', cuesta: 'alerta' };
  const celda = (nivel, texto) => `<span class="aguante nivel-${COLOR[nivel] || 'sin'}">${nivel ? IC(icono[nivel]) : ''}${texto}</span>`;
  return `<div class="tarjeta"><h2>${IC('lupa')} ¿Cuál aguanta mejor el clima de tu zona?</h2>
    <div class="aguante-tabla"><span></span><b>${IC('helada')} Frío</b><b>${IC('sol')} Sequía</b>
      ${ops.map((o, i) => `<span class="comparar-nombre">${IC(icCultivo(o.cultivoId))}<span><small>${tags[i]}</small>${esc(o.nombre)}</span></span>
        ${celda(o.nivelFrio, o.aguanteFrio?.noches === undefined ? '—' : o.aguanteFrio.noches === 0 ? 'Aguanta' : `${String(o.aguanteFrio.noches).replace('.', ',')} noches`)}
        ${celda(o.nivelSeco, o.aguanteSequia?.conRiego ? 'Con riego' : o.aguanteSequia?.aniosBajo === undefined ? '—' : o.aguanteSequia.aniosBajo === 0 ? 'Aguanta' : `${o.aguanteSequia.aniosBajo} de ${o.aguanteSequia.anios} años`)}`).join('')}
    </div>
    <p class="leyenda">Frío: noches al año, en los meses que el cultivo está en la chacra, con la temperatura que lo mata o menos. Sequía: años en que llovió menos de lo mínimo que el cultivo aguanta. Clima de NASA POWER desde 1981; límites de cada cultivo en su ficha (ECOCROP, INIA y estudios de papas nativas).</p></div>`;
}
function climaTxt() {
  const z = climaZona(estado.historial?.historial, estado.historial?.lluviaMensual); if (!z) return '';
  return `<div class="fila-dato"><span>${IC('helada')} Heladas (0 °C o menos)</span><b>${z.diasHelada === null ? 'sin dato' : `${String(z.diasHelada).replace('.', ',')} días al año${z.mesesFuertes.length ? `, sobre todo en ${z.mesesFuertes.map((m) => MESES_LARGO[m - 1]).join(' y ')}` : ''}`}</b></div>
    <div class="fila-dato"><span>${IC('sol')} Años secos</span><b>${z.sequia ? `${z.sequia.aniosSecos} de ${z.sequia.anios}` : 'sin dato'}</b></div>`;
}
function resumenZona() {
  const s = estado.suelo; const ph = estado.entrada.ph ? Number(String(estado.entrada.ph).replace(',', '.')) : null;
  const tex = estado.entrada.textura || s?.textura;
  return `<div class="tarjeta"><h2>${IC('pin')} Tu zona</h2>
    <div class="fila-dato"><span>${IC('grafico')} Clima</span><b>${estado.historial ? `NASA POWER ${estado.historial.periodo[0]}–${estado.historial.periodo[1]}` : 'sin historial'}</b></div>
    ${climaTxt()}
    <div class="fila-dato"><span>${IC('suelo-tubo')} pH del suelo</span><b>${ph ?? s?.ph ?? 'cargando…'}${ph ? ' (tu análisis)' : s?.ph ? ' (estimado)' : ''}</b></div>
    <div class="fila-dato"><span>${IC('descanso')} Textura</span><b>${tex ?? 'cargando…'}${estado.entrada.textura ? ' (tu análisis)' : tex ? ' (estimada)' : ''}</b></div></div>`;
}

/** Meses (1–12) en que algún cultivo del catálogo se siembra, según su época con fuente. */
function mesesConSiembra() {
  const meses = new Set();
  for (const c of Object.values(estado.catalogo.cultivos)) {
    if (!c.siembra) continue;
    const a = Number(c.siembra.desde.slice(0, 2)); const b = Number(c.siembra.hasta.slice(0, 2));
    for (let m = a; ; m = m % 12 + 1) { meses.add(m); if (m === b) break; }
  }
  return meses;
}
/** Los 12 meses desde este, en orden: [mes, año]. */
function proximos12() {
  const hoy = new Date(); const lista = [];
  for (let k = 0; k < 12; k++) { const d = new Date(hoy.getFullYear(), hoy.getMonth() + k, 1); lista.push([d.getMonth() + 1, d.getFullYear()]); }
  return lista;
}
