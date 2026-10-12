# Optional host extensions

The Universal Viewer remains the only built-in document engine. Import `@bobbyfch/sela/host` when a host needs extra controls or providers; none of these helpers increase the core SDK download. PHP/CDN hosts can import the self-hosted `dist/js/sela.host.js` module.

```ts
import Sela from '@bobbyfch/sela';
import {createReaderHost, mountReaderCommands, mountReaderDebug} from '@bobbyfch/sela/host';
const viewer = new Sela({assetBase:'/sela/dist/'});
const host = createReaderHost(viewer, {
  documentKey: 'book-42',
  dictionary: async (text, signal) => lookupLocally(text, signal),
  storage: annotationStore,
});
const removeCommands = mountReaderCommands(viewer, toolbar, [
  {id:'dictionary', label:'Dictionary', run:async () => {
    dictionaryPanel.textContent = await host.dictionary();
  }},
]);
const removeDebug = mountReaderDebug(viewer, debugPanel);
await host.open(file);
// When the host unmounts:
removeCommands(); removeDebug(); host.destroy(); viewer.destroy();
```

The example's `lookupLocally`, `annotationStore`, `toolbar`, `dictionaryPanel` and `debugPanel` are host-provided values. The SDK supplies contracts and lifecycle, not an online dictionary or translation service.

- `DocumentLoader`: match a source, resolve URL/File/Blob/binary input with an AbortSignal. Keep authentication in the loader or SDK request options.
- `RendererAdapter`: match a resolved source, mount into an explicitly supplied host container and return cleanup. This is an optional external format adapter, not another copy of Sela's built-in PDF/EPUB/CBZ engine. Host renderer navigation remains the host's responsibility.
- `ReaderStorage`: read/write annotations under the host's document key. No schema changes are made to the Reader app's IndexedDB. Notes are limited to 10,000 entries, positive integer pages and 10,000-character fields.
- `ReaderCommand`: shared toolbar or selection context-menu action; receives page, selected text, viewer and AbortSignal. Selection menus open only for a nonempty selection and close on Escape/document close.
- `dictionary` / `translation`: explicitly configured providers receive at most 10,000 characters. No network call occurs without a provider. Obtain user consent before sending private text to an online provider.
- `mountReaderDebug`: version, renderer, loading, worker policy, event/error counts, page/mode and readiness timing. Worker policy describes the renderer's strategy; it is not an assertion that a worker currently exists. URLs, credentials, source text and error messages are excluded.

`host.close()` aborts pending loaders/services, releases custom renderers and closes the SDK. `host.destroy()` disposes the host; `viewer.destroy()` also aborts its host lifetime. Disposers are safe to call repeatedly. Use host methods for host-managed opens/closes; an unrelated direct `viewer.close()` does not own host provider requests.

Custom commands handle rejection through the SDK error event. Renderer cleanup exceptions remain visible to the calling host so it can repair its adapter. Late-resolving custom renderer mounts are cleaned up when superseded or destroyed.
