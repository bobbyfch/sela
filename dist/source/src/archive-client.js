// Generated from src/archive-client.ts by npm run build. Do not edit.
import { decodeArchive } from "./archive-codec.js";
const abortError = () => new DOMException("Archive extraction cancelled", "AbortError");
export async function extractArchiveAsync(bytes, signal, backup = false) {
  if (signal?.aborted) throw abortError();
  if (bytes.byteLength > 64 * 1048576) throw Error("Archive input exceeds 64 MiB");
  if (typeof Worker === "undefined") {
    if (bytes.byteLength > 16 * 1048576) throw Error("This archive requires Web Worker support");
    return decodeArchive(bytes, backup);
  }
  return new Promise((resolve, reject) => {
    const moduleUrl = new URL(import.meta.url);
    const workerUrl = moduleUrl.pathname.includes("/dist/source/src/") ? new URL("../../js/sela.archive-worker.js", moduleUrl) : moduleUrl.pathname.includes("/dist/js/") ? new URL("./sela.archive-worker.js", moduleUrl) : new URL("../dist/js/sela.archive-worker.js", moduleUrl);
    const crossOrigin = globalThis.location && workerUrl.origin !== globalThis.location.origin;
    const wrapper = crossOrigin ? URL.createObjectURL(new Blob([`import ${JSON.stringify(workerUrl.href)};`], { type: "text/javascript" })) : void 0;
    let worker;
    try {
      worker = new Worker(wrapper || workerUrl, { type: "module" });
    } catch (error) {
      if (wrapper) URL.revokeObjectURL(wrapper);
      if (bytes.byteLength <= 16 * 1048576) resolve(decodeArchive(bytes, backup));
      else reject(error);
      return;
    }
    let finished = false;
    const finish = (files, error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      signal?.removeEventListener("abort", cancel);
      worker.terminate();
      if (wrapper) URL.revokeObjectURL(wrapper);
      if (error) reject(error);
      else resolve(files);
    };
    const cancel = () => finish(void 0, abortError());
    const timeout = setTimeout(() => finish(void 0, Error("Archive extraction timed out")), 3e4);
    signal?.addEventListener("abort", cancel, { once: true });
    worker.onmessage = (event) => {
      if (event.data.error !== void 0) finish(void 0, Error(event.data.error));
      else finish(event.data.files);
    };
    worker.onerror = () => finish(void 0, Error("Archive worker failed to load or execute"));
    worker.onmessageerror = () => finish(void 0, Error("Invalid archive worker response"));
    try {
      const input = new Uint8Array(bytes).buffer;
      const request = { bytes: input, backup };
      worker.postMessage(request, [input]);
    } catch (error) {
      finish(void 0, error instanceof Error ? error : Error("Archive extraction failed"));
    }
  });
}
