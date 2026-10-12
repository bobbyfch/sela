import { createSelaClass, VERSION } from './sela.ts';
// Bundlers relocate this module; they do not automatically copy PDF.js assets.
// A direct dist import stays self-hosted; a bundled import defaults to the
// pinned CDN release, with assetBase available for explicit offline hosting.
const directDist = /\/dist\/js\/sela\.esm\.js(?:[?#]|$)/.test(import.meta.url);
const Sela = createSelaClass(directDist ? import.meta.url.replace(/\/js\/sela\.esm\.js(?:[?#].*)?$/, '/') : 'https://cdn.jsdelivr.net/gh/bobbyfch/sela@v'+VERSION+'/dist/');
export { Sela, VERSION };
export type Sela = import('./public-api.ts').Sela;
export type {SelaOptions, SelaMode, SelaSource, SelaEventMap, SelaEventName, SelaEventListener, BookMetadata} from './public-api.ts';
export default Sela;
