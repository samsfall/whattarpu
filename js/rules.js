// Motor de reglas (sin IA). Funciones puras: reciben datos y devuelven resultados.
// Cada regla cita su fuente del catálogo. Lo que no tiene fuente se muestra como vacío.
import { riesgoSequia } from './sequia.js';
import { evaluarAptitud, temperaturaCiclo } from './aptitud.js';
import { aguanteFrio, aguanteSequia, nivelFrio, nivelSequia } from './aguante.js';

export const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Campaña agrícola de Puno: de agosto a julio. */
export function campanaActual(fecha = new Date()) {
  const a = fecha.getFullYear();
  return fecha.getMonth() >= 7 ? `${a}–${a + 1}` : `${a - 1}–${a}`;
}

function mmdd(s) { const [m, d] = s.split('-').map(Number); return { m, d }; }

/**
 * Fecha de siembra sugerida dentro de la ventana del cultivo, lo más cerca posible
 * del mes que eligió el agricultor. Año de referencia arbitrario (no bisiesto).
 */
export function fechaSiembra(cultivo, mesElegido, hoy = new Date()) {
  if (!cultivo.siembra) return null;
  const ini = mmdd(cultivo.siembra.desde);
  const fin = mmdd(cultivo.siembra.hasta);
  const toDay = (m, d) => new Date(Date.UTC(2001, m - 1, d));
  const vIni = toDay(ini.m, ini.d);
  const vFin = toDay(fin.m, fin.d);
  // Sin mes elegido: la app propone la fecha. Si hoy está dentro de la época, hoy; si no, el inicio de la próxima época.
  if (mesElegido == null) {
    const h = toDay(hoy.getMonth() + 1, hoy.getDate());
    const abierta = h >= vIni && h <= vFin;
    const diasFaltan = abierta ? 0 : Math.round(((h < vIni ? vIni : new Date(Date.UTC(2002, ini.m - 1, ini.d))) - h) / 86400000);
    const anio = hoy.getFullYear() + (h > vFin ? 1 : 0);
    return { fecha: abierta ? h : vIni, coincide: true, ventana: cultivo.siembra, automatica: true, abierta, diasFaltan, anio, hasta: vFin };
  }
  const mIni = toDay(mesElegido, 1);
  const mFin = toDay(mesElegido + 1 > 12 ? 12 : mesElegido + 1, mesElegido + 1 > 12 ? 31 : 1);
  let fecha; let coincide = true;
  if (mFin < vIni) { fecha = vIni; coincide = false; }
  else if (mIni > vFin) { fecha = vFin; coincide = false; }
  else fecha = mIni < vIni ? vIni : mIni;
  return { fecha, coincide, ventana: cultivo.siembra };
}

/** Meses (1–12) que ocupa el cultivo desde la siembra, según su duración máxima. */
export function mesesCiclo(cultivo, fecha) {
  if (!cultivo.duracionDias || !fecha) return [];
  const fin = new Date(fecha.getTime() + cultivo.duracionDias.max * 86400000);
  const meses = [];
  const d = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), 1));
  while (d <= fin) { meses.push(d.getUTCMonth() + 1); d.setUTCMonth(d.getUTCMonth() + 1); }
  return meses;
}

/** Riesgo de helada del ciclo: días de helada esperados (suma de promedios mensuales). */
export function riesgoHelada(meses, historial) {
  if (!historial || !meses.length) return null;
  let total = 0;
  for (const m of meses) {
    const fila = historial.find((h) => h.mes === m);
    if (!fila || fila.diasHeladaProm === null) return null;
    total += fila.diasHeladaProm;
  }
  return Math.round(total * 10) / 10;
}

/** Cultivo siguiente en la secuencia tradicional (aynoka). */
export function siguienteAynoka(previo, catalogo) {
  const s = catalogo.aynoka.secuencia;
  if (previo === 'cebada') return 'descanso';
  const i = s.indexOf(previo);
  if (i === -1) return 'descanso';
  return s[i + 1] || 'descanso';
}

function fuente(catalogo, clave) {
  const f = catalogo.fuentes[clave];
  return f ? { cita: f.cita, url: f.url } : null;
}

// Aptitud: lo que sabemos de la zona frente a los requisitos del cultivo (ECOCROP + datos locales del INIA).
// Sin época de siembra no hay meses de cultivo: la temperatura queda «sin dato» y se revisa el resto.
function aplicarAptitud(op, c, entrada, catalogo, historial, lluvia) {
  for (const p of c.pendiente || []) op.vacios.push(p);
  if (c.seSiembraEnPuno) op.evidencia.push({ texto: `Se siembra en Puno: ${c.seSiembraEnPuno.dato}`, ...fuente(catalogo, c.seSiembraEnPuno.fuentes[0]) });
  const conRiego = !!entrada.agua && entrada.agua !== 'lluvia';
  op.aguanteFrio = aguanteFrio(op.meses, historial, c.requisitos?.heladaMata?.enCrecimiento);
  op.aguanteSequia = aguanteSequia(lluvia, c.requisitos?.lluviaAnual?.absMin, conRiego);
  op.nivelFrio = nivelFrio(op.aguanteFrio); op.nivelSeco = nivelSequia(op.aguanteSequia);
  const mata = c.requisitos?.heladaMata;
  if (op.aguanteFrio.noches > 0) op.riesgos.push(`Frío: en tu zona hay en promedio ${op.aguanteFrio.noches} noches al año, en sus meses de cultivo, con ${op.aguanteFrio.umbral} °C o menos; ${c.nombre.toLowerCase()} no aguanta esa temperatura.`);
  if (op.aguanteFrio.noches === 0) op.beneficios.push(`Aguanta el frío de tu zona: en sus meses de cultivo no se registraron noches de ${op.aguanteFrio.umbral} °C o menos.`);
  if (mata?.enCrecimiento != null) op.evidencia.push({ texto: `${c.nombre}: la planta en crecimiento muere con ${mata.enCrecimiento} °C${mata.nota ? ` (${mata.nota})` : ''}`, ...(mata.fuente === 'ecocrop' || !fuente(catalogo, mata.fuente) ? { cita: catalogo.fuentes.ecocrop.cita, url: c.requisitos.fichaEcocrop } : fuente(catalogo, mata.fuente)) });
  if (op.aguanteSequia.aniosBajo > 0) op.riesgos.push(`Sequía: en ${op.aguanteSequia.aniosBajo} de ${op.aguanteSequia.anios} años llovió menos de los ${op.aguanteSequia.minimo} mm que ${c.nombre.toLowerCase()} aguanta.`);
  if (!c.requisitos) return;
  const zona = { ...(entrada.condiciones || {}), temperatura: temperaturaCiclo(op.meses, historial), conRiego };
  op.aptitud = evaluarAptitud(c.requisitos, zona);
  for (const it of op.aptitud.items) {
    if (it.estado === 'fuera') op.riesgos.push(`${it.nombre}: tu zona tiene ${it.zona}; el cultivo ${it.rango}.`);
    if (it.clave === 'altitud' && it.estado === 'fuera') op.fueraDeAltura = true;
  }
  if (op.aptitud.resultado === 'apto') op.beneficios.push('Tu zona cumple los requisitos de clima y suelo de este cultivo.');
  op.evidencia.push({ texto: `Requisitos de ${c.requisitos.especie} (ECOCROP, FAO)`, cita: catalogo.fuentes.ecocrop.cita, url: c.requisitos.fichaEcocrop });
  if (op.aptitud.items.some((i) => i.estado === 'sin_dato')) op.vacios.push('Faltan datos de la zona para revisar todos los requisitos del cultivo.');
}

/** Arma una opción de rotación con por qué, evidencia, beneficios, vacíos y riesgos. */
export function armarOpcion(tipo, cultivoId, entrada, catalogo, historial, lluvia = null) {
  const op = { tipo, cultivoId, porque: [], evidencia: [], beneficios: [], vacios: [], riesgos: [] };
  if (cultivoId === 'descanso') {
    op.nombre = 'Descanso';
    op.icono = '🟫';
    op.porque.push('La rotación tradicional del altiplano cierra con varios años de descanso.');
    op.evidencia.push({ texto: catalogo.aynoka.texto, ...fuente(catalogo, catalogo.aynoka.fuente) });
    op.beneficios.push('Prepara la chacra para volver a sembrar papa, que se siembra en terrenos descansados.');
    op.evidencia.push({ texto: 'Papa INIA 317: terrenos descansados de 3 a 5 años', ...fuente(catalogo, 'inia317') });
    op.vacios.push('No calcula cuánto mejora el suelo: eso necesita un análisis de suelo.');
    op.meses = []; op.riesgoHelada = null; op.riesgoSequia = null; op.siembra = null;
    return op;
  }
  const c = catalogo.cultivos[cultivoId];
  op.nombre = c.nombre; op.icono = c.icono;
  if (!c.siembra || !c.duracionDias) {
    op.vacios.push(`Aún no tenemos fuente para la época de siembra y duración de ${c.nombre.toLowerCase()} en Puno.`);
    op.meses = []; op.riesgoHelada = null; op.riesgoSequia = null; op.siembra = null;
    aplicarAptitud(op, c, entrada, catalogo, historial, lluvia);
    return op;
  }
  op.siembra = fechaSiembra(c, entrada.mes, entrada.hoy);
  op.meses = mesesCiclo(c, op.siembra.fecha);
  op.riesgoHelada = riesgoHelada(op.meses, historial);
  op.riesgoSequia = riesgoSequia(op.meses, lluvia);
  if (op.riesgoSequia) op.evidencia.push({ texto: `Año seco: lluvia de los meses del cultivo con SPI de −1 o menos (NASA POWER, ${op.riesgoSequia.anios} campañas)`, ...fuente(catalogo, 'spi') });
  else if (lluvia) op.vacios.push('No hay suficientes años de lluvia para calcular la sequía.');
  aplicarAptitud(op, c, entrada, catalogo, historial, lluvia);

  op.evidencia.push({ texto: `${c.variedadReferencia}: siembra del ${fmt(c.siembra.desde)} al ${fmt(c.siembra.hasta)}; ciclo de ${rango(c.duracionDias)} días`, ...fuente(catalogo, c.siembra.fuente) });
  if (c.helada) op.evidencia.push({ texto: c.helada.texto, ...fuente(catalogo, c.helada.fuente) });
  if (c.requisitos?.heladaMata?.enCrecimiento == null) op.vacios.push(`Falta fuente sobre la tolerancia a heladas de ${c.nombre.toLowerCase()} en el altiplano.`);
  if (!op.siembra.coincide) op.riesgos.push(`El mes que elegiste está fuera de la época recomendada; la fecha sugerida es el ${fmtFecha(op.siembra.fecha)}.`);
  if (c.usos.includes(entrada.prioridad)) op.porque.push(`Sirve para tu prioridad: ${entrada.prioridad}.`);
  // Reglas de rotación
  if (c.hospedaNematodoQuiste && entrada.previo === 'papa') {
    op.riesgos.push('Papa después de papa: favorece al nematodo quiste.');
    op.evidencia.push({ texto: catalogo.rotacionNematodo.texto, ...fuente(catalogo, catalogo.rotacionNematodo.fuente) });
  }
  if (c.hospedaNematodoQuiste === false && entrada.previo === 'papa') {
    op.beneficios.push('Corta el ciclo del nematodo quiste de la papa.');
    op.evidencia.push({ texto: catalogo.rotacionNematodo.texto, ...fuente(catalogo, catalogo.rotacionNematodo.fuente) });
  }
  if (c.requiereDescansoAnios && entrada.previo !== 'descanso') {
    op.riesgos.push(`La ficha de ${c.variedadReferencia} recomienda sembrar en terrenos descansados de ${c.requiereDescansoAnios.min} a ${c.requiereDescansoAnios.max} años.`);
  }
  if (c.requiereDescansoAnios && entrada.previo === 'descanso' && entrada.aniosDescanso >= c.requiereDescansoAnios.min) {
    op.beneficios.push(`La chacra ya descansó ${entrada.aniosDescanso} años, como recomienda la ficha.`);
  }
  if (c.usos.includes('forraje')) op.beneficios.push('Da alimento para el ganado en la época seca.');
  if (c.phRango && entrada.phSuelo != null) {
    const origen = entrada.phEsAnalisis ? 'tu análisis' : 'el estimado de SoilGrids';
    if (entrada.phSuelo < c.phRango.min || entrada.phSuelo > c.phRango.max) op.riesgos.push(`El pH de tu suelo (${entrada.phSuelo}, según ${origen}) está fuera del rango de ${c.phRango.min} a ${c.phRango.max} que indica la ficha.`);
    else op.beneficios.push(`El pH de tu suelo (${entrada.phSuelo}, según ${origen}) está dentro del rango de ${c.phRango.min} a ${c.phRango.max} que indica la ficha.`);
    op.evidencia.push({ texto: `${c.variedadReferencia}: suelos con pH de ${c.phRango.min} a ${c.phRango.max}`, ...fuente(catalogo, c.phRango.fuente) });
  } else if (!c.phRango && !c.requisitos?.ph) op.vacios.push(`Falta fuente sobre el pH que necesita ${c.nombre.toLowerCase()}.`);
  if (!historial) op.vacios.push('Aún no hay historial de clima para tu zona.');
  op.vacios.push('Tu forma de trabajar la tierra (a mano, con yunta o con tractor) todavía no cambia la recomendación.');
  op.riesgos.push('Revisa esta opción con tu técnico o agencia agraria antes de decidir.');
  return op;
}

/**
 * Devuelve 3 opciones: la rotación actual y 2 alternativas distintas.
 * Las alternativas se ordenan por puntaje: prioridad del agricultor, época de siembra,
 * reglas de rotación (nematodo, descanso) y el paso que sigue en la aynoka.
 */
export function tresRotaciones(entrada, catalogo, historial, lluvia = null) {
  const actualId = entrada.previo === 'descanso' ? 'papa' : entrada.previo;
  const actual = armarOpcion('actual', catalogo.cultivos[actualId] ? actualId : 'descanso', entrada, catalogo, historial, lluvia);
  actual.titulo = entrada.previo === 'descanso' ? 'Lo de siempre: papa después del descanso' : 'Lo de siempre: repetir lo que tuvo antes';
  const aynoka = siguienteAynoka(entrada.previo, catalogo);
  const ids = ['descanso', ...Object.keys(catalogo.cultivos).filter((id) => catalogo.cultivos[id].siembra && catalogo.cultivos[id].duracionDias)]
    .filter((id) => id !== actual.cultivoId);
  const candidatos = ids
    .map((id) => armarOpcion('alternativa', id, entrada, catalogo, historial, lluvia))
    .map((op) => ({ op, puntos: puntaje(op, entrada, catalogo, aynoka) }))
    .sort((a, b) => b.puntos - a.puntos || (a.op.aguanteFrio?.noches ?? 1e9) - (b.op.aguanteFrio?.noches ?? 1e9));
  // Con un mes elegido, las alternativas salen de lo que de verdad se puede sembrar ese mes en esta chacra
  // (mismo cruce que la pantalla del mes): época INIA, zona apta y sin heladas fuertes. Si no alcanzan, se usan todas.
  const posibles = entrada.mes == null ? candidatos : candidatos.filter(({ op }) => op.cultivoId === 'descanso'
    || (op.siembra?.coincide && op.aptitud?.resultado !== 'no_apto' && op.nivelFrio !== 'cuesta'));
  const alternativas = (posibles.length >= 2 ? posibles : candidatos).slice(0, 2).map((x, i) => {
    const op = x.op;
    op.tipo = i === 0 ? 'adaptada' : 'tradicional';
    op.titulo = `Alternativa ${i + 1}`;
    if (op.cultivoId === aynoka) op.porque.push('Es el paso que sigue en la rotación tradicional del altiplano (aynoka).');
    if (op.cultivoId === 'descanso' && entrada.tiempoTrabajo === '4+') op.porque.push('Tu chacra lleva muchas campañas sin descansar.');
    return op;
  });
  const lista = [actual, ...alternativas];
  compararRiesgo(lista);
  compararNivel(lista, (o) => o.riesgoSequia?.pct ?? null, 'nivelSequia', 5); // 5 % ≈ 2 de 44 años
  return lista;
}

function puntaje(op, entrada, catalogo, aynoka) {
  let p = 0;
  if (op.cultivoId === aynoka) p += 2;
  if (op.cultivoId === 'descanso') return p + (entrada.tiempoTrabajo === '4+' ? 6 : entrada.tiempoTrabajo === '3' ? 1 : -3);
  const c = catalogo.cultivos[op.cultivoId];
  if (c.usos.includes(entrada.prioridad)) p += 3;
  if (op.siembra?.automatica) p += op.siembra.abierta ? 2 : op.siembra.diasFaltan <= 60 ? 1 : 0;
  else if (op.siembra?.coincide) p += 2;
  if (c.hospedaNematodoQuiste && entrada.previo === 'papa') p -= 4;
  if (c.requiereDescansoAnios && entrada.previo !== 'descanso') p -= 2;
  p -= { si: 0, casi: 1, cuesta: 3 }[op.nivelFrio] ?? 0;
  p -= { si: 0, riego: 0, casi: 1, cuesta: 2 }[op.nivelSeco] ?? 0;
  if (op.aptitud?.resultado === 'no_apto') p -= 5;
  else if (op.aptitud?.resultado === 'limitado') p -= 1;
  return p;
}

/** Semáforo relativo: compara el riesgo de helada entre las opciones (no usa umbrales inventados). */
export function compararRiesgo(lista) {
  const con = lista.filter((o) => o.riesgoHelada !== null);
  const valores = [...new Set(con.map((o) => o.riesgoHelada))].sort((a, b) => a - b);
  for (const o of lista) {
    if (o.riesgoHelada === null) { o.nivel = null; continue; }
    if (valores.length === 1) o.nivel = 'igual';
    else if (o.riesgoHelada === valores[0]) o.nivel = 'menor';
    else if (o.riesgoHelada === valores[valores.length - 1]) o.nivel = 'mayor';
    else o.nivel = 'medio';
  }
  return lista;
}

/** Igual que compararRiesgo, para cualquier valor (p. ej. % de años secos). */
export function compararNivel(lista, valor, campo, tolerancia = 0) {
  let vals = [...new Set(lista.map(valor).filter((v) => v !== null))].sort((a, b) => a - b);
  if (vals.length && vals.at(-1) - vals[0] <= tolerancia) vals = [vals[0]]; // diferencias pequeñas = parecido
  for (const o of lista) {
    const v = valor(o);
    o[campo] = v === null ? null : vals.length === 1 ? 'igual' : v === vals[0] ? 'menor' : v === vals.at(-1) ? 'mayor' : 'medio';
  }
  return lista;
}

function fmt(s) { const { m, d } = mmdd(s); return `${d} de ${MESES_LARGO[m - 1]}`; }
export function fmtFecha(f) { return `${f.getUTCDate()} de ${MESES_LARGO[f.getUTCMonth()]}`; }
function rango(r) { return r.min === r.max ? `${r.min}` : `${r.min} a ${r.max}`; }
