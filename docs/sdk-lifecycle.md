# Typed SDK lifecycle and host integrations

The existing constructor, methods, callbacks, IIFE/CDN URLs and ESM export remain compatible. Legacy `ready`, `pagechange`, `pageerror`, `close`, `error` and `preferenceschange` events are retained.

## Source, mounting and subscriptions

```ts
import Sela from '@bobbyfch/sela';
const reader = new Sela({format:'pdf',assetBase:'/sela/dist/'});
const controller = new AbortController();
const unsubscribe = reader.on('progressChanged', ({page,pages,progress}) => {
  console.log(page,pages,progress);
}, {signal:controller.signal});
await reader.open(file); // URL string, File, Blob, ArrayBuffer or Uint8Array
reader.setTheme('dark');
reader.close();
await reader.open(); // reopen the last source; destroy releases that source
// An inline host must be connected and have an explicit height.
await reader.mount(document.querySelector<HTMLElement>('#reader')!);
unsubscribe();
controller.abort();
reader.destroy();
```

Call `close()` before selecting another source. Calling `open()` while loading/open reuses the existing operation; it does not initialize a second viewer. Blob preparation is bounded before allocation (200 MiB for PDF, 64 MiB for other formats), and a close during preparation invalidates readiness. URL inputs continue to support authenticated requests, signed URLs and configured headers. `on()` returns a disposer and supports a host AbortSignal; call it during unmount or abort the signal.

| Event | Detail |
| --- | --- |
| `loading` | `{loading:boolean}`; false on completion, error or cancellation |
| `documentLoaded` | `{pages:number,format:string}` |
| `pageChanged` | `{page:number}`; additive alias alongside `pagechange` |
| `progressChanged` | `{page:number,pages:number,progress:number}`; progress is bounded 0–1 |
| `modeChanged` | `{mode:SelaMode}` after a successful change |
| `destroyed` | `{}`; repeated/reentrant destroy is idempotent |

Reflowable documents use the renderer's chapter/page count, rather than a fabricated physical-page count. Import/construction remain SSR-safe; DOM methods require a mounted browser. Overlay arbitration and concurrent inline instances retain their existing behavior. Only the full app owns reader history; the CDN SDK does not modify host history.

## Optional extensions and diagnostics

```ts
import {mountSelaExtension,readerDiagnostics} from '@bobbyfch/sela/host';
const unmount = mountSelaExtension(reader, {
  id:'host-toolbar',
  setup(viewer,signal) {
    hostButton.addEventListener('click',()=>viewer.next(),{signal});
    return ()=>{ /* remove host-owned resources */ };
  }
});
console.log(readerDiagnostics(reader));
unmount();
```

Setup runs per ready document, including an already-open viewer. Close, destroy or unmount aborts the extension signal and releases its cleanup callback. Extension failures dispatch an `error` event without replacing the document engine. Extensions are trusted host code; they are not a sandbox for untrusted plugins.

Diagnostics report only version, open state, mode, page count and zoom. They omit document contents, authenticated URLs, request headers and token values. The host helper is a separate optional bundle and is excluded from the core download.

Additional integration examples are `examples/ci4.php`, `examples/nextjs.tsx` and `examples/nuxt.vue`. They require the host framework's own build/server environment; these examples do not constitute runtime certification of those frameworks. Existing Vue lifecycle and framework-independent browser contracts remain tested separately.
