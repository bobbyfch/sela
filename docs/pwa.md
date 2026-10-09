# Sela Bookshelf — mobile web app

Start at [the Sela product page](https://bobbyfch.github.io/sela/#products), choose **Bookshelf**, then open it on Android, iPhone or iPad. Android: browser menu → Install app / Add to Home Screen, or the in-app Install button when available. iPhone/iPad: Safari Share → Add to Home Screen. No app-store download is needed.

Bookshelf has a mobile bottom bar, persistent local books, favorites, title/recency sorting, format/reading-status filters, shelf/grid/list layouts and a single-page reader default. It is a separate product from the embedded Viewer and desktop Home extension. Five sample covers are prepared: one complete novelet and four explicitly labeled text layout placeholders. Import your own files for real reading.

## Device routing

Desktop visitors get a notice rather than a mobile library or manifest link. Phones/tablets are routed here; desktop browsers are routed to Home. This is a UX guard based on browser device signals, not tamper-proof OS enforcement. A browser may let users install any website manually; a manually installed desktop Bookshelf still shows the device notice. iPadOS desktop-style user agents are recognized through touch capability.

## Older phones

Full app needs ES modules, modern JavaScript, IndexedDB, Web Crypto, TextDecoder and ResizeObserver. HTTPS/service workers are additionally required for offline shell caching. Old browsers see a static Basic page with an original PDF link and return link. **iPhone 4 cannot run the full modern PWA**; it does not gain persistent offline bookshelf, TTS, page effects or modern decoding through this fallback. Native PDF support also depends on its browser. Device/OS age alone cannot guarantee feature support. Physical old devices have not been validated.

## Offline and privacy

Books are imported explicitly and saved as bytes in IndexedDB on the Sela Pages origin. They are not uploaded or placed in service-worker caches. The app shell and known static adapters are cached. Open each actual format/document online before relying on offline fonts, CMaps or optional resources. External DjVu is excluded. Storage can be evicted, clearing site data removes the shelf, and installed/browser contexts may not share storage. Always keep originals and export notes. Home’s extension origin has a separate shelf; no automatic transfer occurs.

Updates activate after all Bookshelf windows close and reopen. This app has no Home weather or clock widgets. Browser speech voices vary and online voices are opt-in.
