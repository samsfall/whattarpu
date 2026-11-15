// Revisor de estilo y errores comunes (variables sin definir, imports que sobran). Se corre con: npm run revisar
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['vendor/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['js/**/*.js', 'sw.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.browser, L: 'readonly' } },
  },
  {
    files: ['sw.js'],
    languageOptions: { sourceType: 'script', globals: { ...globals.serviceworker } },
  },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', 'pruebas-pantallas/**/*.mjs', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.node } },
  },
  { rules: { 'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }] } },
];
