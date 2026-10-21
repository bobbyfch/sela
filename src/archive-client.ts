import { decodeArchive, type ArchiveFiles } from './archive-codec.ts';

export interface ArchiveRequest { bytes: ArrayBuffer; backup: boolean; }
export type ArchiveReply = { files: ArchiveFiles; error?: never } | { error: string; files?: never };
const abortError = () => new DOMException('Archive extraction cancelled', 'AbortError');

/** One short-lived module worker per extraction; closing the reader stops CPU work. */
export async function extractArchiveAsync(bytes: Uint8Array, signal?: AbortSignal, backup = false): Promise<ArchiveFiles> {
  if (signal?.aborted) throw abortError();
  if (bytes.byteLength > 64 * 1048576) throw Error('Archive input exceeds 64 MiB');
  // Old hosts remain usable for small documents without risking a large UI stall.
  if (typeof Worker === 'undefined') {
    if (bytes.byteLength > 16 * 1048576) throw Error('This archive requires Web Worker support');
    return decodeArchive(bytes, backup);
  }
  return new Promise((resolve, reject) => {
    const moduleUrl = new URL(import.meta.url);
    const workerUrl = moduleUrl.pathname.includes('/dist/source/src/')
      ? new URL('../../js/sela.archive-worker.js', moduleUrl)
      : moduleUrl.pathname.includes('/dist/js/')
        ? new URL('./sela.archive-worker.js', moduleUrl)
      : new URL('../dist/js/sela.archive-worker.js', moduleUrl);
    const crossOrigin = globalThis.location && workerUrl.origin !== globalThis.location.origin;
    const wrapper = crossOrigin ? URL.createObjectURL(new Blob([`import ${JSON.stringify(workerUrl.href)};`], { type: 'text/javascript' })) : undefined;
    let worker: Worker;
    try { worker = new Worker(wrapper || workerUrl, { type: 'module' }); }
    catch (error) {
      if (wrapper) URL.revokeObjectURL(wrapper);
      if (bytes.byteLength <= 16 * 1048576) resolve(decodeArchive(bytes, backup));
      else reject(error);
      return;
    }
    let finished = false;
    const finish = (files?: ArchiveFiles, error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      signal?.removeEventListener('abort', cancel);
      worker.terminate();
      if (wrapper) URL.revokeObjectURL(wrapper);
      if (error) reject(error); else resolve(files!);
    };
    const cancel = () => finish(undefined, abortError());
    const timeout = setTimeout(() => finish(undefined, Error('Archive extraction timed out')), 30000);
    signal?.addEventListener('abort', cancel, { once: true });
    worker.onmessage = (event: MessageEvent<ArchiveReply>) => {
      if (event.data.error !== undefined) finish(undefined, Error(event.data.error));
      else finish(event.data.files);
    };
    worker.onerror = () => finish(undefined, Error('Archive worker failed to load or execute'));
    worker.onmessageerror = () => finish(undefined, Error('Invalid archive worker response'));
    try {
      // Transfer a dedicated copy; never detach the caller's original document.
      const input = new Uint8Array(bytes).buffer;
      const request: ArchiveRequest = { bytes: input, backup };
      worker.postMessage(request, [input]);
    } catch (error) {
      finish(undefined, error instanceof Error ? error : Error('Archive extraction failed'));
    }
  });
}
