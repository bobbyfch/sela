const engines = new Map();

export function safeUrl(value, base) {
  const url = new URL(String(value), base);
  const host = new URL(base);
  const extensionAsset = ['chrome-extension:', 'moz-extension:'].includes(host.protocol) && url.protocol === host.protocol && url.host === host.host;
  if (!extensionAsset && !['http:', 'https:', 'blob:'].includes(url.protocol)) throw new TypeError('Only HTTP(S) and blob URLs are supported');
  return url.href;
}

export function loadPdfEngine(options, assetBase, win) {
  if (options.pdfjsLib) {
    if (typeof options.pdfjsLib.getDocument !== 'function') return Promise.reject(new TypeError('Invalid PDF.js engine'));
    return Promise.resolve(options.pdfjsLib);
  }
  // Both builds use the same patched release; never fall back to PDF.js 3.x.
  const legacy = options.pdfBuild === 'legacy' || !win.structuredClone || !Array.prototype.at || !Promise.withResolvers;
  const folder = legacy ? 'legacy/build/' : 'build/';
  const src = safeUrl(options.pdfjsSrc || new URL(`vendor/pdfjs/${folder}pdf.min.mjs`, assetBase), win.location.href);
  const worker = safeUrl(options.pdfWorkerSrc || new URL(`vendor/pdfjs/${folder}pdf.worker.min.mjs`, assetBase), win.location.href);
  const key = JSON.stringify([src, worker]);
  if (!engines.has(key)) {
    const pending = import(/* webpackIgnore: true */ /* @vite-ignore */ src).then(lib => {
      if (typeof lib.getDocument !== 'function') throw new Error('PDF.js did not initialize');
      // A per-document PDFWorker below avoids mutating module-global workerSrc.
      return { ...lib, workerUrl: worker };
    }).catch(error => { engines.delete(key); throw error; });
    engines.set(key, pending);
  }
  return engines.get(key);
}

export function documentOptions(options) {
  const input = { isEvalSupported: false };
  if (options.data) input.data = new Uint8Array(options.data instanceof ArrayBuffer ? options.data.slice(0) : options.data);
  else input.url = options.url;
  if (options.httpHeaders) input.httpHeaders = options.httpHeaders;
  if (options.withCredentials !== undefined) input.withCredentials = !!options.withCredentials;
  if (options.password !== undefined) input.password = options.password;
  if (options.cMapUrl) { input.cMapUrl = options.cMapUrl; input.cMapPacked = true; }
  if (options.standardFontDataUrl) input.standardFontDataUrl = options.standardFontDataUrl;
  return input;
}

export function createPdfTask(lib, options) {
  const input = documentOptions(options);
  let worker;
  if (lib.workerUrl) {
    // PDF.js' own CDN worker wrapper uses a blob too. Explicit worker ports keep
    // concurrent instances with different worker URLs from affecting each other.
    const crossOrigin = new URL(lib.workerUrl).origin !== window.location.origin;
    const url = crossOrigin ? URL.createObjectURL(new Blob([`import ${JSON.stringify(lib.workerUrl)};`], { type: 'text/javascript' })) : lib.workerUrl;
    const port = new Worker(url, { type: 'module' });
    worker = new lib.PDFWorker({ port });
    input.worker = worker;
    const task = lib.getDocument(input);
    const destroy = task.destroy.bind(task);
    let stopped = false;
    task.destroy = async () => {
      if (stopped) return;
      stopped = true;
      try { await destroy(); } finally {
        worker.destroy(); port.terminate();
        if (crossOrigin) URL.revokeObjectURL(url);
      }
    };
    task.promise.catch(() => task.destroy().catch(() => {}));
    return task;
  }
  return lib.getDocument(input);
}
