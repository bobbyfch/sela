# Changelog

## 0.9.0-beta.3 — Publishing & discovery polish (2026-10-13)

- Expand open-catalog discovery and book-cover lookup while preserving generated covers when providers have no artwork.
- Refine responsive reading controls, bookshelf layouts and installation/update feedback across supported browsers.
- Keep author contact private by routing feedback through the project issue tracker; retain the requested creator credit and website.
- Move planning and machine-specific validation notes out of the public release, and make local tooling paths configurable.

## 0.9.0-beta.2 — Personal reading room (2026-10-12)

- Detect install state and offer a browser-aware install prompt or concise platform instructions; document the browser and OS limits honestly.
- Add an on-device Home backdrop with a readable soft overlay, and keep it compatible with Safari/WebKit storage.
- Refine compact language/theme controls so the public page stays within narrow phone viewports.
- Keep Explore reading and download actions legible at 320 px widths across browser engines.
- Make Explore's bookshelf view cover-only with tap-to-open details; add Gutenberg and Open Library cover artwork with an immediate generated fallback, and improve local covers without sending private ISBNs anywhere.
- Fix phone calendar month controls and replace the compressed backup picker with a clear, keyboard-accessible control.
- Refresh the bilingual guides and product screenshots for the second beta.

- Position Sela as a personal reader; introduce the default Linen reading room, eight material previews, companion/weather scenes and one public-to-footer visual world.
- Prioritize reading and ordered queues; add smart shelves, notebook export, journal, personal messages/impressions, ribbon labels, series ordering, travel checks and collection cards.
- Expand Explore to 22 source choices, named session-auth OPDS profiles, metadata-only edition links and ephemeral Read previews distinct from offline downloads.
- Add optional local full-library text search, dictionary packs/online translation, group presets, audio/embedded SMIL/rain ambience and manual conditional WebDAV backups with explicit conflict review.
- Synchronize app reader appearance, simplify document titles, animate panels/dialog exits, preserve nested-dialog Escape and filter import formats.
- Refresh bilingual documentation, real product captures and provider/runtime limitations.

- Replace mobile catalog/action labels with accessible local icon controls; unify filters in a native bottom sheet and fix focus return on WebKit.
- Add dimensional navigation/app icons and Walnut, Oak and Linen material themes, including offline and standalone viewer assets.
- Replace public hero artwork and README preview with real app captures in CSS device frames; remove superseded artwork and duplicate worker output.
- Add optional host command, loader, renderer, annotation storage, dictionary/translation and privacy-safe debug contracts.
- Bound initial shelves to 80-book batches while retaining complete-library search; add 1,000-book regression coverage.
- Bound untrusted HTML/EPUB depth and node counts; add deterministic ZIP corruption corpus, large-text/reopen and malicious-HTML checks.
- Preserve runtime import directives in minified SDK bundles for Next/Turbopack; validate Next, Nuxt, Svelte, Angular, CI3, CI4 and Laravel hosts.

- Adopt Vite 8, Astro 7, React 19 and TypeScript 7; preserve the separate framework-independent SDK and static public page.
- Upgrade PDF.js to 6.4.299 with matching legacy/modern workers, local font/CMap/WASM/ICC resources and loading-task cleanup.
- Move EPUB/CBZ/Office extraction and format detection into cancellable workers; expand strict ZIP, preference, metadata and PDF-loader types.
- Add repeatable browser lifecycle, heap, frame, long-task and canvas profiling plus worker cancellation/security regression tests.

- Build public and reader pages from strict TypeScript/TSX components into static HTML; preserve SEO metadata, page contracts and browser asset URLs without public-page hydration.
- Add typed lifecycle/progress subscriptions, File/Blob sources, inline mount and theme controls while preserving legacy events and methods.
- Add optional typed host extensions with cleanup and bounded diagnostics; add CI4, Next.js and Nuxt integration examples.
- Introduce local shared material tokens, floating capsule navigation, keyboard controls, cover transitions, reduced-motion fallbacks and app-only reader Back handling.
- Extend strict checks to gesture, appearance, download and new shell contracts; release rejected catalog download streams and stylesheet listeners.

- Migrate viewer, application, service workers, tooling, browser/unit tests and the Web Component example to TypeScript sources.
- Generate browser assets at existing URLs and emit SDK declarations from the TypeScript public contract; add project-wide browser/worker checks to CI.
- Require Node.js 22.18+ for TypeScript development tooling; browser/CDN consumers retain their existing setup.

- Begin incremental source type checking with a strict JSDoc byte-loader contract and CI check.
- Release rejected document response bodies and stream locks; preserve read errors when cancellation fails and check input limits before copying.
- Clean up PDF worker ports and Blob URLs when initialization or task destruction fails.
- Add resource-loading regression tests and a Next Generation architecture audit.

## 0.9.0-beta.0 — Initial release

Sela is a standalone, open-source reading application and embeddable viewer. This beta is the project's first release.

### Sela Reader

- Installable web app for desktop, tablet and phone, with responsive side/bottom navigation and a private local library.
- Offline books, saved progress, favorites, sorting, filters and grid, compact list or wooden bookshelf views.
- Collections, multi-book membership and bulk actions; editable publishing metadata and original-file export.
- Validated ZIP backup/restore of books, reading data, collections and personal profiles; manual backup sharing where supported.
- Explore open classics, Indonesian Wikisource and compatible OPDS catalogs; read and save supported acquisitions inside Sela.
- Reading timer, library summaries, clock and optional city-based weather.
- PWA install guidance, offline shell, update notifications and guarded activation while reading or handling files.

### Reading experience

- PDF, EPUB, CBZ, TXT, Markdown, HTML, FB2 and text-oriented DOCX/ODT; optional externally supplied DjVu decoder.
- Book spreads and page turns, single page, scroll, seamless webtoon and right-to-left manga modes.
- Touch gestures, keyboard navigation, zoom, fit controls, previews, contents and personal bookmarks.
- Light, dark and system appearance; Rimba, Lontar, Nila, Seroja and Jelaga OLED palettes.
- Reading filters, brightness, dimming, paper texture and typography controls.
- Novel, Manga, Study and Night profiles, plus personal presets saved per book and included in backups.
- Document search, extractable text, contextual quote/highlight actions, page notes and browser/OS text-to-speech.
- Screenshot and quote cards with book metadata, downloadable or shareable through supported device menus.
- Optional screen wake/orientation lock, accessible icon controls and reduced-motion behavior.

### Sela Viewer

- Lightweight JavaScript CDN and ESM entries with TypeScript declarations and a Vue adapter.
- Framework-independent examples, inline embeds and fullscreen overlays using the same responsive reading interface.
- Lazy adapters and PDF.js assets, bounded rendering, authenticated document requests and self-hosted assets.
- One release-version authority in package.json generates runtime, headers, metadata, manifests and CDN examples.

### License and beta limits

MIT licensed, with third-party notices and decoder licenses preserved. Browser capabilities, document fidelity, offline storage and narration vary by platform. See the format, compatibility, backup and installation guides. Scan OCR, content DRM and unsupported ebook formats are not included.
