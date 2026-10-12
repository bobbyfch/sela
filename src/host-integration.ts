import type { Sela } from './public-api.ts';
export { createReaderHost, mountReaderCommands, mountReaderDebug } from './host-controls.ts';
export type { ReaderCommand, ReaderHostOptions, ReaderStorage, ReaderAnnotation, DocumentLoader, RendererAdapter, TextService } from './host-controls.ts';
export interface SelaExtension {
  id: string;
  /** Called for each ready document. Keep host authentication outside diagnostics. */
  setup(viewer: Sela, signal: AbortSignal): void | (() => void);
}
/** Optional host integration, kept out of the core download. */
export function mountSelaExtension(viewer: Sela, extension: SelaExtension): () => void {
  let lifetime: AbortController | undefined;
  let dispose: (() => void) | undefined;
  const fail = (error: unknown) => viewer.dispatchEvent(new CustomEvent('error', { detail: { error: error instanceof Error ? error : new Error('Host extension failed') } }));
  const cleanup = () => {
    lifetime?.abort(); lifetime=undefined;
    const previous=dispose;dispose=undefined;
    try { previous?.(); } catch(error) { fail(error); }
  };
  const setup = () => {
    cleanup(); lifetime=new AbortController();
    try { dispose=extension.setup(viewer,lifetime.signal) || undefined; }
    catch(error) { cleanup();fail(error); }
  };
  const subscriptions=[viewer.on('ready',setup),viewer.on('close',cleanup),viewer.on('destroyed',cleanup)];
  if(viewer.overlay && viewer.totalPages)setup();
  return () => { subscriptions.forEach(unsubscribe=>unsubscribe());cleanup(); };
}
export function readerDiagnostics(viewer: Sela) {
  return Object.freeze({version:(viewer.constructor as typeof Sela).version,open:!!viewer.overlay,mode:viewer.options.mode || 'book',page:viewer.currentPage(),pages:viewer.totalPages,zoom:viewer.zoom});
}
