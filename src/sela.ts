import { loadPdfEngine, safeUrl } from './pdf-loader.ts';
import { createBookEngine } from './book-engine.ts';
import { createReader } from './reader.ts';
import { Webtoon } from './webtoon.ts';
import { FILTERS, brightness, applyAppearance } from './appearance.ts';
import { MODES, readingPreferences, readStored } from './preferences.ts';
import {normalizeLocale} from './locale.ts';
export { FILTERS } from './appearance.ts';

import { VERSION } from '../app/library/version.ts';
import type { SelaOptions, SelaSource, SelaMode } from './public-api.ts';
import { subscribe, type SelaEventName, type SelaEventListener } from './events.ts';
export { VERSION } from '../app/library/version.ts';
const cssLoads = new Map<string, Promise<void>>();
const bookEngines = new WeakMap<Window, ReturnType<typeof createBookEngine>>();
let activeViewer: import('./public-api.ts').Sela | undefined;

function abortError() { return new DOMException('Viewer was closed', 'AbortError'); }

function loadCss(url: string, doc: Document): Promise<void> {
  if (cssLoads.has(url)) return cssLoads.get(url);
  const existing = Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).find(link => link.href === url);
  if (existing?.sheet) return Promise.resolve();
  const promise = new Promise<void>((resolve, reject) => {
    const link = existing || doc.createElement('link');
    link.rel = 'stylesheet'; link.href = url;
    const timeout = setTimeout(() => fail(), 15000);
    const cleanup = () => { clearTimeout(timeout); link.removeEventListener('load',done);link.removeEventListener('error',fail); };
    const done = () => { cleanup(); resolve(); };
    const fail = () => { cleanup(); link.remove(); cssLoads.delete(url); reject(new Error('Could not load Sela stylesheet')); };
    link.addEventListener('load', done, { once: true });
    link.addEventListener('error', fail, { once: true });
    if (!existing) doc.head.appendChild(link);
  });
  cssLoads.set(url, promise);
  return promise;
}

export function createSelaClass(defaultAssetBase: string): typeof import('./public-api.ts').Sela {
  return class Sela extends EventTarget {
    declare options: SelaOptions;
    declare _generation: number;
    declare _pending: Promise<this> | null;
    declare _reader: ReturnType<typeof createReader> | null;
    declare _rejectReady: ((reason?: unknown) => void) | null;
    private _destroyed = false;
    private _loading = false;
    private _source?: SelaSource;

    static version = VERSION;
    constructor(options: SelaOptions = {}) {
      super();
      this.options = { mode: 'book', theme: 'auto', ...options, ui:'app' };
      if(options.ui&&!['classic','app'].includes(options.ui))throw new TypeError('ui must be classic or app');
      if (options.presentation && !['overlay', 'inline'].includes(options.presentation)) throw new TypeError('presentation must be overlay or inline');
      if (!MODES.includes(this.options.mode)) throw new TypeError('mode must be book, single, scroll, webtoon or manga');
      if (this.options.filter && !Object.prototype.hasOwnProperty.call(FILTERS, this.options.filter)) throw new TypeError('Unknown reading filter');
      this.options.brightness=brightness(this.options.brightness);
      if (this.options.readingDirection && !['ltr', 'rtl'].includes(this.options.readingDirection)) throw new TypeError('readingDirection must be ltr or rtl');
      if (!['auto', 'light', 'dark'].includes(this.options.theme)) throw new TypeError('theme must be auto, light or dark');
      if (options.format && !['auto','pdf','epub','cbz','djvu','txt','md','html','fb2','docx','odt'].includes(options.format)) throw new TypeError('Unsupported document format');
      this._generation = 0;
      this._pending = null;
      this._reader = null;
    }

    on<K extends SelaEventName>(name: K, listener: SelaEventListener<K>, options: { signal?: AbortSignal } = {}) {
      return subscribe(this, name, listener, options.signal);
    }
    open(source?: SelaSource) {
      if (this._pending) return this._pending;
      if (this.book) return Promise.resolve(this);
      this._destroyed = false;
      if (source !== undefined) this._source = source;
      const pending = this._open(this._source);
      this._pending = pending;
      // Legacy callers often ignore open(). Explicit await still sees errors.
      pending.catch(() => {}).finally(() => { if (this._pending === pending) this._pending = null; });
      return pending;
    }
    mount(container: HTMLElement | string) {
      this.close();
      this.options.presentation = 'inline'; this.options.container = container;
      return this.open();
    }
    setTheme(theme: NonNullable<SelaOptions['theme']>) {
      if (!['auto','light','dark'].includes(theme)) throw new TypeError('Unknown theme');
      this.options.theme = theme;
      const state = this._reader?.getState();
      if (this.overlay) this.overlay.dataset.selaTheme = theme;
      state?.setAppearance?.({});
      return this;
    }

    async _open(source?: SelaSource) {
      if (typeof window === 'undefined' || !window.document) throw new Error('Sela.open() requires a browser DOM');
      const win = window;
      this._reader?.close(true);
      const options: Record<string, any> = { ...this.options };
      if (source !== undefined) {
        delete options.url; delete options.pdfUrl; delete options.data;
        if (typeof source === 'string') options.url = source;
        else if (source instanceof Blob) {
          // Blob bytes are read after acquiring the generation below, so close cancels readiness.
          options.sourceBlob = source;
          if (typeof File !== 'undefined' && source instanceof File) options.url = source.name;
        } else options.data = source;
      }
      if (options.persistPreferences) {
        const prefix = options.storagePrefix || 'sela:';
        const key = prefix + String(options.id || options.url || options.pdfUrl || 'bytes');
        Object.assign(options, readingPreferences(readStored(prefix+'preferences')), readingPreferences(readStored(key+':preferences')));
        if(options.appContext&&win.document){const appearance=win.document.documentElement.dataset.theme;if(['auto','light','dark'].includes(appearance))options.theme=appearance;}
      }
      if (options.presentation === 'inline') {
        options.container = typeof options.container === 'string' ? win.document.querySelector(options.container) : options.container;
        if (!options.container || options.container.ownerDocument !== win.document || !options.container.isConnected) throw new TypeError('Inline presentation requires a connected container');
      }
      if (!win.__selaAttribution) {
        win.__selaAttribution = true;
        console.info('Sela '+VERSION+' · Documents, books and comics.\nCreated by Bobby Fajar Christian · https://bobbyfch.github.io/\nProject: https://github.com/bobbyfch/sela');
      }
      if(options.language === 'auto')options.language = normalizeLocale(win.navigator.language);
      const extension = /\.(epub|cbz|djvu|djv|txt|md|html|htm|fb2|docx|odt)(?:[?#]|$)/i.exec(options.url || options.pdfUrl || '')?.[1].toLowerCase().replace(/^htm$/, 'html');
      options.format = options.format && options.format !== 'auto' ? options.format : (extension === 'djv' ? 'djvu' : extension || 'pdf');
      options.pageGap = Math.max(0, Math.min(80, Number(options.pageGap)||0));
      options.maxScale = Math.max(.5, Math.min(3, Number(options.maxScale || options.scale) || 1.75));
      options.maxCanvasPixels = Math.max(250000, Math.min(8000000, Number(options.maxCanvasPixels) || 2500000));
      options.normalQuality={maxScale:options.maxScale,maxCanvasPixels:options.maxCanvasPixels,duration:options.duration??560};
      if (options.lowPower) { options.maxScale = Math.min(1, options.maxScale); options.maxCanvasPixels = Math.min(1000000, options.maxCanvasPixels); options.duration = 0; }
      if (options.duration !== undefined) options.duration = Math.max(0, Math.min(1500, Number(options.duration) || 0));
      if (!options.pdfUrl && !options.url && !options.data && !options.sourceBlob) throw new TypeError('pdfUrl or data is required');
      if (!options.sourceBlob && (options.pdfUrl || options.url)) options.url = safeUrl(options.pdfUrl || options.url, win.location.href);
      const base = new URL(options.assetBase || defaultAssetBase, win.location.href);
      if (!base.pathname.endsWith('/')) base.pathname += '/';
      options.soundUrl = safeUrl(options.soundUrl || new URL('sound/turnPage.mp3', base), win.location.href);
      options.cMapUrl ||= new URL('vendor/pdfjs/cmaps/', base).href;
      options.standardFontDataUrl ||= new URL('vendor/pdfjs/standard_fonts/', base).href;
      const generation = ++this._generation;
      const language=String(options.language||'en').toLowerCase();
      if(!language.startsWith('en')&&!language.startsWith('id')){
        options.localesUrl ||= new URL('js/sela.locales.js',base).href;
        try{const locales=await import(/* webpackIgnore: true */ /* @vite-ignore */ options.localesUrl);if(generation!==this._generation)throw abortError();options.translate=locales.translate;}
        catch(error){if((error as Error)?.name==='AbortError')throw error;options.localeLoadError=true;}
      }
      if (options.presentation !== 'inline') {
        if (activeViewer && activeViewer !== this) activeViewer.close();
        activeViewer = this;
      }
      try {
        this._loading = true;
        this._event('loading', { loading: true });
        if (options.sourceBlob) {
          const limit = options.format === 'pdf' ? 200 : 64;
          if (options.sourceBlob.size > limit * 1024 * 1024) throw new RangeError('Document exceeds the '+limit+' MiB limit');
          options.data = await options.sourceBlob.arrayBuffer();
          delete options.url; delete options.sourceBlob;
          if (generation !== this._generation) throw abortError();
        }
        const [, lib, appUI] = await Promise.all([
          options.autoStyles === false ? Promise.resolve() : loadCss(safeUrl(options.cssUrl || new URL('css/sela.min.css', base), win.location.href), win.document),
          options.format === 'pdf' ? loadPdfEngine(options, base, win) :
            import(/* webpackIgnore: true */ /* @vite-ignore */ new URL(options.format === 'djvu' ? 'js/sela.djvu.js' : ['txt','md','html','fb2','docx','odt'].includes(options.format) ? 'js/sela.text.js' : 'js/sela.archive.js', base).href).then(async module => {
              if(['txt','md','html','fb2','docx','odt'].includes(options.format))return {epub:module.TextBook};
              if(options.format === 'epub')return { epub: module.Epub };
              if(options.format === 'cbz')return module.cbzLibrary();
              if(!options.djvujsSrc)throw new Error('DjVu requires a separately supplied djvujsSrc decoder');
              options.djvujsSrc = safeUrl(options.djvujsSrc, win.location.href);
              return module.loadDjvu(options);
            }),
          options.ui==='app'?Promise.all([options.headless?Promise.resolve(null):import(/* webpackIgnore: true */ /* @vite-ignore */ new URL('js/sela.app.js',base).href),options.autoStyles===false?Promise.resolve():loadCss(safeUrl(new URL('css/sela.app.css',base),win.location.href),win.document)]).then(([module])=>module):Promise.resolve(null)
        ]);
        if (generation !== this._generation) throw abortError();
        options.pdfjsLib = lib;
        options.toolsUrl = new URL('js/sela.tools.js',base).href;
        if (!bookEngines.has(win)) bookEngines.set(win, createBookEngine(win));
        options.createEngine = mode => lib.epub ? {create:(el,opts)=>new lib.epub(el,opts)} : ['webtoon','scroll'].includes(mode) ? { create: (el, opts) => new Webtoon(el, opts) } : bookEngines.get(win);
        options.onPreferences = values => { Object.assign(this.options, values);this.options.onPreferences?.(values); this._event('preferenceschange', values); };
        const engine = options.createEngine(options.mode);
        this._reader = createReader(win, engine);
        return await new Promise<this>((resolve, reject) => {
          this._rejectReady = reject;
          options.onReady = () => {
            this._rejectReady = null;
            try{if(appUI&&!options.headless)appUI.configureLibraryReader(this,{mobile:true,viewer:!options.appContext,language:options.language||'id'});}catch(error){reject(error);return;}
            this._event('ready', { pages: this.book?.numPages || 0 });
            this._event('documentLoaded', { pages: this.totalPages, format: options.format });
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
          options.onPageChange = page => {
            this._event('pagechange', { page });
            this._event('pageChanged', { page });
            const pages = this.totalPages;
            this._event('progressChanged', { page, pages, progress: pages ? Math.max(0, Math.min(1, page / pages)) : 0 });
          };
          options.onPageError = detail => this._event('pageerror', detail);
          this._reader.open(options).catch(reject);
        });
      } catch (error) {
        if (error.name !== 'AbortError') this._event('error', { error });
        if (activeViewer === this && !this._reader?.getState()) activeViewer = null;
        throw error;
      } finally {
        if (generation === this._generation && this._loading) { this._loading = false; this._event('loading', { loading: false }); }
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
    get soundEnabled() { return this._reader?.getState()?.sound ?? this.options.soundEnabled; }
    setMode(mode: SelaMode) {
      if (!MODES.includes(mode)) return Promise.reject(new TypeError('Unknown reading mode'));
      const state = this._reader?.getState();
      const changed = this.options.mode !== mode;
      const done = () => { this.options.mode = mode; if (changed) this._event('modeChanged', { mode }); return this; };
      if (!state?.book) return Promise.resolve(done());
      return state.setMode(mode).then(done);
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
    showPreviews() { this._reader?.getState()?.showPreviews?.(); return this; }
    downloadOriginal() { this._reader?.getState()?.downloadOriginal?.(); return this; }
    getText(page = this.currentPage()) { return this._reader?.getState()?.getText?.(page) || Promise.resolve(''); }
    getPageThumbnail(page: number, maxWidth = 180) { return this._reader?.getState()?.getPageThumbnail?.(page, maxWidth) || Promise.resolve(null); }
    getContents() { return this._reader?.getState()?.getContents?.() || Promise.resolve([]); }
    goToContent(item) { this._reader?.getState()?.goToContent?.(item); return this; }
    getBookmarks() { return this._reader?.getState()?.getBookmarks?.() || []; }
    toggleBookmark(page = this.currentPage()) { return this._reader?.getState()?.toggleBookmark?.(page) || []; }
    setBookmarks(pages) { return this._reader?.getState()?.setBookmarks?.(pages) || []; }
    getAnnotations() { return this._reader?.getState()?.getAnnotations?.() || { notes: {}, highlights: {} }; }
    setNote(page, note) { return this._reader?.getState()?.setNote?.(page, note) || { notes: {}, highlights: {} }; }
    setHighlights(page, quotes) { return this._reader?.getState()?.setHighlights?.(page, quotes) || { notes: {}, highlights: {} }; }
    async getMetadata() {
      const base=new URL(this.options.assetBase||defaultAssetBase,window.location.href);if(!base.pathname.endsWith('/'))base.pathname+='/';
      const module=await import(/* webpackIgnore: true */ /* @vite-ignore */ new URL('js/sela.metadata.js',base).href);
      const metadata=await module.readBookMetadata(this.book,this.options.metadata);if(!metadata.title)metadata.title=this.options.title||'';return metadata;
    }
    toggleFullscreen() { this.book?.toggleFullscreen(); return this; }
    setFilter(value) {
      if (!Object.prototype.hasOwnProperty.call(FILTERS, value)) throw new TypeError('Unknown reading filter');
      this.options.filter = value;
      if (this.overlay) {
        this._reader.getState().setPreferences({filter:value});
        this._reader.getState().controls.filter.value = value;
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
    setSoundEnabled(value: boolean) {
      this.options.soundEnabled = !!value;
      this._reader?.getState()?.setSoundEnabled?.(value);
      return this;
    }
    close() {
      ++this._generation;
      if (this._loading) { this._loading = false; this._event('loading', { loading: false }); }
      this._reader?.close(true);
      if (activeViewer === this) activeViewer = null;
      this._pending = null;
    }
    destroy() { if (this._destroyed) return; this._destroyed = true; this.close(); this._source = undefined; this._event('destroyed', {}); }
  };
}
