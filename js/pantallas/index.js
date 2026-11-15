// Todas las pantallas, con los mismos IDs del Excel de flujos v4.
import { PANTALLAS_A } from './a-entrada.js';
import { PANTALLAS_B } from './b-sembrar.js';
import { PANTALLAS_C } from './c-sembre.js';
import { PANTALLAS_DE } from './d-e-cierre.js';
import { PANTALLAS_F } from './f-ayuda.js';

export const PANTALLAS = { ...PANTALLAS_A, ...PANTALLAS_B, ...PANTALLAS_C, ...PANTALLAS_DE, ...PANTALLAS_F };
