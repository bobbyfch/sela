import { createSelaClass } from './sela.js';

// Capture currentScript before any async operation; works under CDN aliases too.
const script = document.currentScript;
const base = script?.src ? new URL('../', script.src).href : 'https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.0.0/dist/';
window.Flippy = window.Sela = createSelaClass(base);
