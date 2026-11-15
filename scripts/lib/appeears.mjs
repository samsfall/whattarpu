// Funciones para leer y resumir los CSV de AppEEARS (NASA). Sin conexión: se pueden probar con datos de ejemplo.

/** Lee un CSV simple (con comillas opcionales) y devuelve una lista de objetos. */
export function leerCsv(texto) {
  const lineas = texto.replace(/\r/g, '').split('\n').filter((l) => l.trim());
  const partir = (l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"')).slice(0, -1);
  const cab = partir(lineas[0]);
  return lineas.slice(1).map((l) => { const v = partir(l); return Object.fromEntries(cab.map((c, i) => [c, v[i]])); });
}

/** Busca la columna cuyo nombre termina en la capa pedida (ej. LST_Night_1km). */
export function columnaDe(filas, capa) {
  if (!filas.length) return null;
  return Object.keys(filas[0]).find((k) => k.endsWith(capa)) || null;
}

/**
 * Heladas según MODIS: temperatura de superficie de noche (LST_Night_1km, en Kelvin).
 * Ojo: es temperatura del suelo/superficie, no del aire; sirve como indicador de helada y se valida con Senamhi.
 * Devuelve por mes: % de noches observadas con superficie a 0 °C o menos, y temperatura nocturna promedio.
 */
export function resumenHeladasModis(filas) {
  const col = columnaDe(filas, 'LST_Night_1km');
  if (!col) throw new Error('El CSV no tiene la capa LST_Night_1km');
  const porMes = Array.from({ length: 12 }, () => ({ obs: 0, heladas: 0, suma: 0 }));
  const anios = new Set();
  for (const f of filas) {
    let k = parseFloat(f[col]);
    if (!Number.isFinite(k) || k <= 0) continue; // sin dato (nube o relleno)
    if (k > 1000) k *= 0.02; // por si viene sin factor de escala
    const c = k - 273.15;
    const fecha = f.Date || f.date; if (!fecha) continue;
    const mes = Number(fecha.slice(5, 7)); anios.add(fecha.slice(0, 4));
    const m = porMes[mes - 1]; m.obs++; m.suma += c; if (c <= 0) m.heladas++;
  }
  const lista = [...anios].sort();
  return {
    fuente: 'NASA MODIS Terra MOD11A1 v6.1 (LST_Night_1km) vía AppEEARS',
    nota: 'Temperatura de la superficie de noche, no del aire. Indicador de helada a validar con estaciones del Senamhi.',
    periodo: lista.length ? [Number(lista[0]), Number(lista[lista.length - 1])] : null,
    meses: porMes.map((m, i) => ({
      mes: i + 1, noches: m.obs,
      pctNochesConHelada: m.obs ? Math.round((1000 * m.heladas) / m.obs) / 10 : null,
      tempNocturnaProm: m.obs ? Math.round((10 * m.suma) / m.obs) / 10 : null,
    })),
  };
}
