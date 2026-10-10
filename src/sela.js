import { loadPdfEngine, safeUrl } from './pdf-loader.js';
import { createBookEngine } from './book-engine.js';
import { createReader } from './reader.js';
import { Webtoon } from './webtoon.js';
import { FILTERS, brightness, applyAppearance } from './appearance.js';
import { MODES, readingPreferences, readStored } from './preferences.js';
export { FILTERS } from './appearance.js';

export const VERSION = '1.3.1';
const cssLoads = new Map();
const bookEngines = new WeakMap();
let activeViewer;

function abortError() { return new DOMException('Viewer was closed', 'AbortError'); }

function loadCss(url, doc) {
  if (cssLoads.has(url)) return cssLoads.get(url);
  const existing = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).find(link => link.href === url);
  if (existing?.sheet) return Promise.resolve();
  const promise = new Promise((resolve, reject) => {
    const link = existing || doc.createElement('link');
    link.rel = 'stylesheet'; link.href = url;
    const timeout = setTimeout(() => fail(), 15000);
    const done = () => { clearTimeout(timeout); resolve(); };
    const fail = () => { clearTimeout(timeout); link.remove(); cssLoads.delete(url); reject(new Error('Could not load Sela stylesheet')); };
    link.addEventListener('load', done, { once: true });
    link.addEventListener('error', fail, { once: true });
    if (!existing) doc.head.appendChild(link);
  });
  cssLoads.set(url, promise);
  return promise;
}

export function createSelaClass(defaultAssetBase) {
  return class Sela extends EventTarget {
    static version = VERSION;
    constructor(options = {}) {
      super();
      this.options = { mode: 'book', theme: 'auto', ...options };
      if (options.presentation && !['overlay', 'inline'].includes(options.presentation)) throw new TypeError('presentation must be overlay or inline');
      if (!MODES.includes(this.options.mode)) throw new TypeError('mode must be book, single, scroll, webtoon or manga');
      if (this.options.filter && !Object.prototype.hasOwnProperty.call(FILTERS, this.options.filter)) throw new TypeError('Unknown reading filter');
      this.options.brightness=brightness(this.options.brightness);
      if (this.options.readingDirection && !['ltr', 'rtl'].includes(this.options.readingDirection)) throw new TypeError('readingDirection must be ltr or rtl');
      if (!['auto', 'light', 'dark'].includes(this.options.theme)) throw new TypeError('theme must be auto, light or dark');
      if (options.format && !['auto','pdf','epub','cbz','djvu','txt','md','html','fb2'].includes(options.format)) throw new TypeError('Unsupported document format');
      this._generation = 0;
      this._pending = null;
      this._reader = null;
    }

    open() {
      if (this._pending) return this._pending;
      if (this.book) return Promise.resolve(this);
      const pending = this._open();
      this._pending = pending;
      // Legacy callers often ignore open(). Explicit await still sees errors.
      pending.catch(() => {}).finally(() => { if (this._pending === pending) this._pending = null; });
      return pending;
    }

    async _open() {
      if (typeof window === 'undefined' || !window.document) throw new Error('Sela.open() requires a browser DOM');
      const win = window;
      this._reader?.close(true);
      const options = { ...this.options };
      if (options.persistPreferences) {
        const prefix = options.storagePrefix || 'flippy:';
        const key = prefix + String(options.id || options.url || options.pdfUrl || 'bytes');
        Object.assign(options, readingPreferences(readStored(prefix+'preferences')), readingPreferences(readStored(key+':preferences')));
      }
      if (options.presentation === 'inline') {
        options.container = typeof options.container === 'string' ? win.document.querySelector(options.container) : options.container;
        if (!options.container || options.container.ownerDocument !== win.document || !options.container.isConnected) throw new TypeError('Inline presentation requires a connected container');
      }
      if (!win.__selaAttribution) {
        win.__selaAttribution = true;
        console.info('Sela '+VERSION+' · Documents, books and comics.\nCreated by Bobby Fajar Christian · https://bobbyfajarc.github.io/\nGitHub: https://github.com/bobbyfch/sela · Instagram: https://instagram.com/bobby.fch · LinkedIn: https://www.linkedin.com/in/bobbyfajarc/');
      }
      if(options.language === 'auto')options.language = /^id\b/i.test(win.navigator.language) ? 'id' : 'en';
      const extension = /\.(epub|cbz|djvu|djv|txt|md|html|fb2)(?:[?#]|$)/i.exec(options.url || options.pdfUrl || '')?.[1].toLowerCase();
      options.format = options.format && options.format !== 'auto' ? options.format : (extension === 'djv' ? 'djvu' : extension || 'pdf');
      options.pageGap = Math.max(0, Math.min(80, Number(options.pageGap)||0));
      options.maxScale = Math.max(.5, Math.min(3, Number(options.maxScale || options.scale) || 1.75));
      options.maxCanvasPixels = Math.max(250000, Math.min(8000000, Number(options.maxCanvasPixels) || 2500000));
      options.normalQuality={maxScale:options.maxScale,maxCanvasPixels:options.maxCanvasPixels,duration:options.duration??560};
      if (options.lowPower) { options.maxScale = Math.min(1, options.maxScale); options.maxCanvasPixels = Math.min(1000000, options.maxCanvasPixels); options.duration = 0; }
      if (options.duration !== undefined) options.duration = Math.max(0, Math.min(1500, Number(options.duration) || 0));
      if (!options.pdfUrl && !options.url && !options.data) throw new TypeError('pdfUrl or data is required');
      if (options.pdfUrl || options.url) options.url = safeUrl(options.pdfUrl || options.url, win.location.href);
      const base = new URL(options.assetBase || defaultAssetBase, win.location.href);
      if (!base.pathname.endsWith('/')) base.pathname += '/';
      options.soundUrl = safeUrl(options.soundUrl || new URL('sound/turnPage.mp3', base), win.location.href);
      options.cMapUrl ||= new URL('vendor/pdfjs/cmaps/', base).href;
      options.standardFontDataUrl ||= new URL('vendor/pdfjs/standard_fonts/', base).href;
      const generation = ++this._generation;
      if (options.presentation !== 'inline') {
        if (activeViewer && activeViewer !== this) activeViewer.close();
        activeViewer = this;
      }
      try {
        const [, lib] = await Promise.all([
          options.autoStyles === false ? Promise.resolve() : loadCss(safeUrl(options.cssUrl || new URL('css/sela.min.css', base), win.location.href), win.document),
          options.format === 'pdf' ? loadPdfEngine(options, base, win) :
            import(/* webpackIgnore: true */ /* @vite-ignore */ new URL(options.format === 'djvu' ? 'js/sela.djvu.js' : ['txt','md','html','fb2'].includes(options.format) ? 'js/sela.text.js' : 'js/sela.archive.js', base).href).then(async module => {
              if(['txt','md','html','fb2'].includes(options.format))return {epub:module.TextBook};
              if(options.format === 'epub')return { epub: module.Epub };
              if(options.format === 'cbz')return module.cbzLibrary();
              if(!options.djvujsSrc)throw new Error('DjVu requires a separately supplied djvujsSrc decoder');
              options.djvujsSrc = safeUrl(options.djvujsSrc, win.location.href);
              return module.loadDjvu(options);
            })
        ]);
        if (generation !== this._generation) throw abortError();
        options.pdfjsLib = lib;
        options.toolsUrl = new URL('js/sela.tools.js',base).href;
        if (!bookEngines.has(win)) bookEngines.set(win, createBookEngine(win));
        options.createEngine = mode => lib.epub ? {create:(el,opts)=>new lib.epub(el,opts)} : ['webtoon','scroll'].includes(mode) ? { create: (el, opts) => new Webtoon(el, opts) } : bookEngines.get(win);
        options.onPreferences = values => { Object.assign(this.options, values);this.options.onPreferences?.(values); this._event('preferenceschange', values); };
        const engine = options.createEngine(options.mode);
        this._reader = createReader(win, engine);
        return await new Promise((resolve, reject) => {
          this._rejectReady = reject;
          options.onReady = () => {
            this._rejectReady = null;
            this._event('ready', { pages: this.book?.numPages || 0 });
            resolve(this);
          };
          options.onClose = () => {
            if (activeViewer === this) activeViewer = null;
            ++this._generation;
            this._rejectReady?.(abortError());
            this._rejectReady = null;
            this._event('close', {});
          };
          options.onError = error => { this._rejectReady = null; reject(error); };
          options.onPageChange = page => this._event('pagechange', { page });
          options.onPageError = detail => this._event('pageerror', detail);
          this._reader.open(options).catch(reject);
        });
      } catch (error) {
        if (error.name !== 'AbortError') this._event('error', { error });
        if (activeViewer === this && !this._reader?.getState()) activeViewer = null;
        throw error;
      }
    }

    _event(name, detail) {
      this.dispatchEvent(new CustomEvent(name, { detail }));
      const callback = { pagechange: 'onPageChange', pageerror: 'onPageError' }[name] || `on${name[0].toUpperCase()}${name.slice(1)}`;
      try { this.options[callback]?.(detail); } catch (error) { console.error('Sela callback failed', error); }
    }
    get book() { return this._reader?.getState()?.book || null; }
    get totalPages() { return this.book?.numPages || 0; }
    get overlay() { return this._reader?.getState()?.overlay || null; }
    currentPage() { return this.book?.currentPage() || 0; }
    next() { this.book?.next(); return this; }
    prev() { this.book?.prev(); return this; }
    goTo(page) { this.book?.goTo(page); return this; }
    nextPage() { return this.next(); }
    prevPage() { return this.prev(); }
    goToPage(page) { return this.goTo(page); }
    firstPage() { return this.goTo(1); }
    lastPage() { return this.goTo(this.totalPages); }
    zoomIn() { this.book?.zoomIn(); return this; }
    zoomOut() { this.book?.zoomOut(); return this; }
    setZoom(value) { this.book?.setZoom(value); return this; }
    get zoom() { return this.book?.zoom || 1; }
    setMode(mode) {
      if (!MODES.includes(mode)) return Promise.reject(new TypeError('Unknown reading mode'));
      const state = this._reader?.getState();
      if (!state?.book) { this.options.mode = mode; return Promise.resolve(this); }
      return state.setMode(mode).then(() => { this.options.mode = mode; return this; });
    }
    setFit(value) {
      if (!['page','width','original'].includes(value)) throw new TypeError('Unknown fit mode');
      this.options.fit = value; this._reader?.getState()?.setFit(value); return this;
    }
    setTypography(values) {
      const valid = readingPreferences(values);
      Object.assign(this.options, valid); this._reader?.getState()?.setPreferences(valid); return this;
    }
    back() { this._reader?.getState()?.back(); return this; }
    showTools() { return this._reader?.getState()?.showTools?.() || Promise.reject(new Error('Open the reader first')); }
    getText(page = this.currentPage()) { return this._reader?.getState()?.getText?.(page) || Promise.resolve(''); }
    toggleFullscreen() { this.book?.toggleFullscreen(); return this; }
    setFilter(value) {
      if (!Object.prototype.hasOwnProperty.call(FILTERS, value)) throw new TypeError('Unknown reading filter');
      this.options.filter = value;
      if (this.overlay) {
        this._reader.getState().options.filter=value;
        applyAppearance(this.overlay,this._reader.getState().options);
        this.overlay.querySelector('.flippy-filter').value = value;
      }
      return this;
    }
    setBrightness(value) {
      this.options.brightness=brightness(value);
      const state=this._reader?.getState();
      if(state){state.options.brightness=this.options.brightness;applyAppearance(this.overlay,state.options);}
      return this;
    }
    setDim(value) {
      this.options.dim=!!value;const state=this._reader?.getState();
      if(state){state.options.dim=!!value;applyAppearance(this.overlay,state.options);}
      return this;
    }
    close() {
      ++this._generation;
      this._reader?.close(true);
      if (activeViewer === this) activeViewer = null;
      this._pending = null;
    }
    destroy() { this.close(); }
  };
}
