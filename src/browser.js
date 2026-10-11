import { createSelaClass, VERSION } from './sela.js';

// Capture currentScript before any async operation; works under CDN aliases too.
const script = document.currentScript;
const base = script?.src ? new URL('../', script.src).href : 'https://cdn.jsdelivr.net/gh/bobbyfch/sela@v' + VERSION + '/dist/';
window.Sela = createSelaClass(base);
