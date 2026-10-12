import type { SelaOptions } from './public-api.ts';
import type { PDFDocumentLoadingTask } from 'pdfjs-dist/types/src/display/api.d.ts';
type PdfOptions = Pick<SelaOptions, 'pdfjsLib'|'pdfBuild'|'pdfjsSrc'|'pdfWorkerSrc'|'data'|'url'|'httpHeaders'|'withCredentials'|'password'|'cMapUrl'|'standardFontDataUrl'|'wasmUrl'|'iccUrl'>;
interface LoadingTask { promise: Promise<unknown>; destroy(): Promise<unknown>; }
interface PdfWorker { destroy(): void; }
interface PdfEngine<T extends LoadingTask = PDFDocumentLoadingTask> {
  getDocument(input: Record<string, unknown>): T;
  PDFWorker?: new (options: {port: Worker}) => PdfWorker;
  workerUrl?: string;
  assetBase?: string | URL;
}
const engines = new Map<string, Promise<PdfEngine>>();

export function safeUrl(value: string | URL, base: string | URL) {
  const url = new URL(String(value), base);
  const host = new URL(base);
  const extensionAsset = ['chrome-extension:', 'moz-extension:'].includes(host.protocol) && url.protocol === host.protocol && url.host === host.host;
  if (!extensionAsset && !['http:', 'https:', 'blob:'].includes(url.protocol)) throw new TypeError('Only HTTP(S) and blob URLs are supported');
  return url.href;
}

export function loadPdfEngine(options: PdfOptions, assetBase: string | URL, win: Window & typeof globalThis) {
  if (options.pdfjsLib) {
    if (typeof options.pdfjsLib.getDocument !== 'function') return Promise.reject(new TypeError('Invalid PDF.js engine'));
    return Promise.resolve(options.pdfjsLib as PdfEngine);
  }
  // Both builds use the same patched release; never fall back to PDF.js 3.x.
  const legacy = options.pdfBuild === 'legacy' || !win.structuredClone || !Array.prototype.at || !Promise.withResolvers || !('toBase64' in Uint8Array.prototype);
  const folder = legacy ? 'legacy/build/' : 'build/';
  const src = safeUrl(options.pdfjsSrc || new URL(`vendor/pdfjs/${folder}pdf.min.mjs`, assetBase), win.location.href);
  const worker = safeUrl(options.pdfWorkerSrc || new URL(`vendor/pdfjs/${folder}pdf.worker.min.mjs`, assetBase), win.location.href);
  const key = JSON.stringify([src, worker]);
  if (!engines.has(key)) {
    const pending = import(/* webpackIgnore: true */ /* @vite-ignore */ src).then(lib => {
      if (typeof lib.getDocument !== 'function') throw new Error('PDF.js did not initialize');
      // A per-document PDFWorker below avoids mutating module-global workerSrc.
      return { ...lib, workerUrl: worker, assetBase } as PdfEngine;
    }).catch(error => { engines.delete(key); throw error; });
    engines.set(key, pending);
  }
  return engines.get(key)!;
}

export function documentOptions(options: PdfOptions) {
  const input: Record<string, unknown> & { data?: Uint8Array<ArrayBuffer> } = { isEvalSupported: false };
  if (options.data) input.data = new Uint8Array(options.data instanceof ArrayBuffer ? options.data.slice(0) : options.data);
  else input.url = options.url;
  if (options.httpHeaders) input.httpHeaders = options.httpHeaders;
  if (options.withCredentials !== undefined) input.withCredentials = !!options.withCredentials;
  if (options.password !== undefined) input.password = options.password;
  if (options.cMapUrl) { input.cMapUrl = options.cMapUrl; input.cMapPacked = true; }
  if (options.standardFontDataUrl) input.standardFontDataUrl = options.standardFontDataUrl;
  if (options.wasmUrl) input.wasmUrl = options.wasmUrl;
  if (options.iccUrl) input.iccUrl = options.iccUrl;
  return input;
}

export function createPdfTask(lib: PdfEngine, options: PdfOptions): PDFDocumentLoadingTask;
export function createPdfTask<T extends LoadingTask>(lib: PdfEngine<T>, options: PdfOptions): T;
export function createPdfTask<T extends LoadingTask>(lib: PdfEngine<T>, options: PdfOptions): T {
  const input = documentOptions(options);
  if(lib.assetBase){for(const [key,folder] of [['cMapUrl','cmaps'],['standardFontDataUrl','standard_fonts'],['wasmUrl','wasm'],['iccUrl','iccs']])if(!input[key])input[key]=safeUrl(new URL('vendor/pdfjs/'+folder+'/',lib.assetBase),window.location.href);input.cMapPacked=true;}
  let worker: PdfWorker | undefined;
  if (lib.workerUrl) {
    // PDF.js' own CDN worker wrapper uses a blob too. Explicit worker ports keep
    // concurrent instances with different worker URLs from affecting each other.
    const crossOrigin = new URL(lib.workerUrl).origin !== window.location.origin;
    const url = crossOrigin ? URL.createObjectURL(new Blob([`import ${JSON.stringify(lib.workerUrl)};`], { type: 'text/javascript' })) : lib.workerUrl;
    let port: Worker | undefined;
    const cleanup = () => {
      try { worker?.destroy(); } finally {
        try { port?.terminate(); } finally {
          if (crossOrigin) URL.revokeObjectURL(url);
        }
      }
    };
    let task: T;
    try {
      port = new Worker(url, { type: 'module' });
      if (!lib.PDFWorker) throw new TypeError('PDF.js worker constructor is unavailable');
      worker = new lib.PDFWorker({ port });
      input.worker = worker;
      task = lib.getDocument(input);
    } catch (error) {
      try { cleanup(); } catch {}
      throw error;
    }
    const destroy = task.destroy.bind(task);
    let stopped = false;
    task.destroy = async () => {
      if (stopped) return;
      stopped = true;
      try { await destroy(); } finally {
        cleanup();
      }
    };
    task.promise.catch(() => task.destroy().catch(() => {}));
    return task;
  }
  return lib.getDocument(input);
}
