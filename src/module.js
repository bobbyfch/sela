import { createSelaClass, VERSION } from './sela.js';
// Bundlers relocate this module; they do not automatically copy PDF.js assets.
// A direct dist import stays self-hosted; a bundled import defaults to the
// pinned CDN release, with assetBase available for explicit offline hosting.
const directDist = /\/dist\/js\/(?:flippy|sela)\.esm\.js(?:[?#]|$)/.test(import.meta.url);
const Sela = createSelaClass(directDist ? new URL('../', import.meta.url).href : 'https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.1.0/dist/');
const Flippy = Sela;
export { Flippy, Sela, VERSION };
export default Sela;
