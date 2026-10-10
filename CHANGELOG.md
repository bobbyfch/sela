# Changelog

## 1.6.0

- Rebuild the Reader home with balanced cards, shelf summaries, cover-based continue reading and a focus timer. Keep one book import action in the top bar.
- Replace technical OAuth setup and redirect-only catalogs with eight searchable complete classics, generated covers, in-app reading and offline saving. Preserve Gutenberg credits and terms.
- Add optional city-based Open-Meteo weather beside the clock, with a 30-minute cache and no device location request.
- Improve plain-text reflow by grouping wrapped lines into paragraphs and recognizing common chapter headings.
- Keep ZIP backup/share/restore without account setup, and update current documentation.


## 1.5.0

- One responsive reader interface for web app, CDN and inline embeds; classic input remains a compatibility alias.
- Page previews, bookmarks, direct appearance control, navigation history, sound and rotation controls in the shared interface.
- Cleaner public upload/playground flow and compact palette-aware app home; Rimba, Lontar, Nila and Seroja palettes.
- Opt-in Open Library/Gutenberg catalog search and configurable Google Drive/personal OneDrive imports, with OAuth setup documentation.
- Updated installation, migration, privacy and bilingual usage documentation.


## 1.4.1 — 2026-10-10

- Refresh the open personal bookmark list immediately after dock or keyboard changes.

## 1.4.0 — 2026-10-10

- Optional app-style CDN interface (`ui: app`), including inline embeds and isolated palettes.
- Publishing metadata extraction, book info panels, editable library metadata and backup preservation.
- Local quote cards and PDF/comic screenshots with credited PNG download and supported device sharing.
- Single close control in reading tools; clear personal bookmark section.
- Compact responsive home, portrait sample covers, aligned sample actions and Forest palette naming.
- Refined public product cards, lightweight motion and a relocated collapsible Viewer playground.


## 1.3.2 — 2026-10-10

- Independently constructed Reader app chrome: touch navigation dock, page scrubber, responsive settings sheet/sidebar, and direct contents/search/narration actions. Viewer CDN retains its own interface.
- Persistent Limaraya, Paper, Ink and Rose app palettes, independent of light/dark/system and document filters. Optional screen wake lock with visibility/close cleanup.

- Preserve zoom across internal keyboard-help/panel layout changes. Auto fit now follows the outer reader frame resize, including actual viewport or embed container changes.

## 1.3.1 — 2026-10-10

- Preserve manual zoom when ResizeObserver delivers its initial or duplicate size notification. Actual viewport changes still apply the selected fit mode.
- Wait for rendered zoom in the keyboard regression check to avoid reading an intermediate frame.

## 1.3.0 — 2026-10-10

- Reader-first public page, original pastel hero and cover/upload grid.
- Mobile appearance, language and install controls in Settings; manual cloud backup sharing.
- Two products: universal installable Reader web app and embeddable Viewer. Browser-extension distribution discontinued; desktop installation enabled.
- Story planning moved out of the reader repository.

- Four mobile screens, separated catalog and personal shelf, clear device-routing feedback and centered flag controls.
- Live reading modes reuse the loaded document; fit, typography, preferences, printed page labels, history, manual crop and low power.
- Collections, finished status, batch actions/undo, storage estimates and validated full ZIP backups.
- Selected-text highlights/quotes, TTS passage controls, sleep timer, mini player and optional backend audio adapter.
- Offline shell includes new library modules; Reader includes the sample cover. Full novels remain deferred.

## 1.2.0 — 2026-10-09

- Three products: Viewer CDN, Home desktop new-tab extension and Bookshelf mobile web app.
- Mobile-only install entry, bottom navigation, persistent local shelf, basic old-browser fallback and app shell caching.
- Shared favorites, format/status filters and shelf/grid/list layouts; five example covers with four labeled text placeholders.
- Home offline quotes and optional city weather with Open-Meteo attribution and explicit permissions.
- Public product routing and updated EN/ID docs. Safari package and full iPhone 4 PWA are not claimed.
- Clean generated extension folders before packaging to exclude stale assets.


## 1.1.0 — 2026-10-09

- Public installation routes for CDN viewer and dedicated bookshelf extension; linked release/download badges and current bilingual documentation.
- Installable viewer PWA with versioned shell caching and lazy same-origin engine caching; no document caching or public bookshelf.
- Accessible icon tabs for contents, search, appearance, voice, notes and text. Twelve filters, bounded document brightness and dim controls; public `setBrightness` / `setDim` methods.
- Manual and daily stable-release notifications in the extension, opt-out preference and newer-version toolbar badge. No remote code or silent ZIP updates.
- New original 50-page Indonesian mystery, Yang Tidak Ikut Pulang, twelve chapters, thirteen PDF bookmarks, complete EPUB, four minimalist illustrations and CBZ gallery.
- Legacy FlippyPDF retirement and local recovery backup; public CDN cache revocation is not claimed.

## 1.0.0 — Sela reborn · 2026-10-09

- New Sela repository, Pages and pinned CDN identity, version reset to 1.0.0. Existing FlippyPDF history and pinned CDNs remain available in the previous repository.
- Dedicated private-library extension with cozy bookshelf, local cover extraction, multi-file import, deduplication, title search/sorting, rename, original export, remove/undo, clock and coffee pause. Standard and New Tab editions for Chromium/Firefox.
- Context-menu Open with Sela, with explicit origin access only when downloading a chosen document. All offline engines bundled; no automatic file interception or web-shelf PWA.
- Inline embedded presentation alongside the default overlay; scoped shortcuts, no body scroll lock/focus trap for embeds, and independent concurrent embeds.
- More icon actions with accessible labels, author console credit and source/author links.
- Complete replacement sample: Sebentar Sebelum Pulang, 33 pages, eight chapters, PDF bookmarks, complete EPUB and three original pastel illustrations.
- Updated bilingual documentation, integration examples, extension privacy/compatibility guide, metadata and crawlable source links.
- Retain lazy PDF.js, EPUB/CBZ/text adapters, optional external DjVu, document contents, text search/transcript, browser TTS, page/chapter notes, manga RTL, webtoon, zoom gestures, orientation support and filters.

Previous FlippyPDF release history belongs to [the legacy repository](https://github.com/bobbyfch/flippypdf/releases).
