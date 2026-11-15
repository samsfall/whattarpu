// Leer en voz alta con la síntesis de voz del navegador (Web Speech API). La app no crea textos: solo lee la pantalla.
// Texto para leer en voz alta: sin emojis ni dibujos; los botones se anuncian como "botón …".
export function textoParaLeer(raiz) {
  const partes = [];
  const recorrer = (n) => {
    if (n.nodeType === 3) { partes.push(n.textContent); return; }
    if (n.nodeType !== 1) return;
    const tag = n.tagName;
    if (tag === 'IMG' || tag === 'svg' || tag === 'SCRIPT' || n.getAttribute('aria-hidden') === 'true') return;
    if (n.classList.contains('leaflet-control-zoom') || n.classList.contains('leaflet-control-attribution')) return;
    const esBoton = tag === 'BUTTON' || (tag === 'A' && n.classList.contains('btn'));
    if (esBoton) { const t = n.innerText.replace(/[›‹]/g, '').trim(); if (t) partes.push(`. Botón ${t}. `); return; }
    if (/^(P|H1|H2|LI|DIV|LABEL)$/.test(tag)) partes.push('. ');
    n.childNodes.forEach(recorrer);
  };
  recorrer(raiz);
  return partes.join(' ').replace(/\p{Extended_Pictographic}|️/gu, '').replace(/\s+/g, ' ').replace(/(\.\s*){2,}/g, '. ').trim();
}
// Elige una voz en español latinoamericano, de preferencia femenina, entre las que tenga el celular.
function vozLatina() {
  const voces = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('es'));
  const latina = (v) => /es[-_](pe|mx|us|419|co|cl|ar|ve|ec|bo)/i.test(v.lang);
  const femenina = (v) => /(female|mujer|paulina|sabina|dalia|helena|laura|lupe|paloma|camila|elvira|valentina|google español de estados unidos)/i.test(v.name);
  return voces.find((v) => latina(v) && femenina(v)) || voces.find(latina) || voces.find(femenina) || voces[0] || null;
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};
// Devuelve true si empezó a hablar y false si estaba hablando y se calló (segundo toque = parar).
export function hablando() { return 'speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending); }
export function callar() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
export function decir(texto, alTerminar = () => {}) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  const v = vozLatina(); if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'es-419'; }
  u.rate = 0.9; u.pitch = 1.05;
  u.onend = alTerminar; u.onerror = alTerminar;
  speechSynthesis.speak(u);
}
