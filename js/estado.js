// Estado de la consulta. Vive solo en memoria: la app no guarda datos del agricultor.
export const estado = { entrada: { aniosDescanso: 2 }, avisos: null, zona: null, historial: null, suelo: undefined, catalogo: null, zonas: [], distritos: [], ubic: {}, opciones: null, ver: 0, tab: 'requisitos', pantalla: null };
export const pila = []; // pantallas visitadas, para el botón Volver

/** Vuelve a cero para "Empezar de nuevo". */
export function reiniciarEstado() {
  Object.assign(estado, { entrada: { aniosDescanso: 2 }, ubic: {}, opciones: null, zona: null, historial: null, suelo: undefined, ver: 0, tab: 'requisitos', pantalla: null });
  pila.length = 0;
}
