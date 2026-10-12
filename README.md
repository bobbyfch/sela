<p align="center"><img src="logo.svg" width="88" alt="Sela open-book emblem"></p>
<h1 align="center">Sela Reader</h1>
<p align="center"><strong>Your personal reader. 📖</strong><br>PDF · EPUB · CBZ · TXT · Markdown · HTML · FB2 · DOCX · ODT · optional DjVu<br>Book flip · Manga RTL · Seamless webtoon · Single page</p>
<p align="center"><a href="https://github.com/bobbyfch/sela/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/bobbyfch/sela/actions/workflows/ci.yml/badge.svg"></a> <img alt="MIT" src="https://img.shields.io/badge/license-MIT-31725a"> <a href="https://github.com/bobbyfch/sela/releases"><img alt="Release" src="https://img.shields.io/badge/version-0.9_beta.2-31725a?color=31725a"></a> <img alt="TypeScript ready" src="https://img.shields.io/badge/TypeScript-ready-3178c6"> <img alt="Framework independent" src="https://img.shields.io/badge/framework-independent-31725a"></p>

[Live playground](https://bobbyfch.github.io/sela/) · [Bahasa Indonesia](README.id.md) · [Integrations](docs/integrations.md) · [Formats](docs/formats.md) · [Browser support](docs/compatibility.md) · [Changelog](CHANGELOG.md)

**Sela** means an interval: a space between things, and a moment to make room for a story. Open Sela: your cozy personal reader and private offline bookshelf on desktop, tablet and phone, installable from your browser. Sela Viewer is the lightweight CDN foundation for websites. **No Bootstrap, jQuery or icon font required.** PDF.js loads only for PDFs; EPUB and CBZ use a separate lazy adapter. Optional DjVu integration uses an externally supplied decoder.

🇮🇩 [Baca panduan lengkap dalam Bahasa Indonesia →](README.id.md)

[![Sela Reader running on desktop](site/screenshots/app-desktop.webp)](https://bobbyfch.github.io/sela/)

[![Install CDN viewer](https://img.shields.io/badge/install-CDN_viewer-236947?style=for-the-badge&logo=javascript&logoColor=white)](https://bobbyfch.github.io/sela/#install-viewer) [![Latest release](https://img.shields.io/badge/version-0.9_beta.2-31725a?style=for-the-badge&color=236947&logo=github)](https://github.com/bobbyfch/sela/releases)

[![Open Sela Reader](https://img.shields.io/badge/open-Sela_Reader-236947?style=for-the-badge&logo=android&logoColor=white)](https://bobbyfch.github.io/sela/#install-mobile)

Reader and CDN Viewer use **one responsive interface**: icon controls, page navigation, bookmarks, previews and reading settings. Choose **Linen (default), Oak, Walnut, Rimba, Lontar, Nila, Seroja or OLED** palettes independently of light/dark/system appearance. Theme switching is available directly inside the viewer. Choose Novel, Manga, Study or Night reading profiles, or save your own in Reader settings. Custom profiles are included in full library backups. Screen wake lock and orientation lock are optional browser capabilities.

<p align="center"><img src="site/screenshots/app-mobile.webp" width="240" alt="Personal reading room with Linen material"><img src="site/screenshots/app-materials.png" width="240" alt="Walnut room and eight material previews"></p>

## Reader + Viewer

| Sela Reader | Sela Viewer |
| --- | --- |
| Installable web app: desktop, tablet and phone; private local library | Lightweight CDN / ESM plugin for websites and frameworks |

[Choose / install on the public page](https://bobbyfch.github.io/sela/#products) · [Product guide](docs/products.md)

> No account is needed. Explore offers 22 source choices and your named OPDS catalogs. Read a temporary preview, then download to keep a copy. ZIP sharing and optional WebDAV sync are manual. [Book sources and limits](docs/library-sources.md).

## ✨ Why Sela?

| Read your way | Fit your project |
| --- | --- |
| 📖 Book folds and two-page spreads | Vanilla JavaScript + ESM |
| 🗯️ Manga RTL turns and arrow keys | TypeScript declarations, SSR-safe import |
| 📜 Webtoon with nearby-page rendering | Vue component; additional integration examples |
| 🎯 Responsive single-page focus | Bootstrap/Tailwind can stay in your app |
| 🌗 Themes and reduced motion | Auth headers, credentials, byte-data PDFs |
| 🔖 Bookmarks and saved progress | Lazy PDF.js and bounded canvas sizes |
| 🎨 12 filters, brightness and dim controls | Compatibility entry with direct-PDF fallback |

## 🧩 Load only what you read

| Module | Gzip size | Loaded when |
| --- | ---: | --- |
| Main entry | ~27.8 KiB | Main script requested |
| Scoped CSS | ~3.5 KiB | First open |
| EPUB / CBZ adapter (includes fflate) | ~12.4 KiB | EPUB or CBZ selected |
| Reading tools: contents, search, notes, TTS | ~10.0 KiB | Tools first opened |
| Plain text / Markdown / HTML / FB2 | ~4.3 KiB | Text format selected |
| DOCX / ODT text conversion | ~4.4 KiB | Office format selected; supplements text adapter |
| Responsive reader UI | ~15.7 KiB JS + ~7.6 KiB CSS | Reader opened |
| Profile backup helpers | ~2.4 KiB | Library backup; not part of the main entry |
| Publishing metadata | ~1.4 KiB | Metadata requested (app library imports it) |
| DjVu adapter | ~1.4 KiB | DjVu selected; external decoder also needed |
| PDF.js + worker (modern) | ~491 KiB combined | PDF selected; fonts/CMaps may load separately |

The interface is lightweight; total download depends on the document and decoder. [Format capabilities, archive limits and licensing](docs/formats.md).

## Personal library

Use grid, compact list or a cover-only wooden shelf. Sort and filters live in one accessible bottom sheet. Shelves load 80 books per batch; search covers the complete library. Long-press a cover to select books; its menu offers pin, metadata, originals and collection membership. Create, rename and delete collections, or add/remove/move selected books. Books can belong to several collections; deleting a collection keeps its books and reading data. Full ZIP backups include empty collections as well as memberships.

Document-text actions appear when text is selected: save a quote to page notes, highlight, listen, create a quote card or clear selection. These use the extractable transcript; scan OCR is not included.

## 📚 Pick your format

| Document | Experience | Current scope |
| --- | --- | --- |
| PDF | Book · single · manga RTL · webtoon | Canvas pages; embedded outline, optional search, selectable transcript, narration and page notes; no aligned PDF text layer or OCR |
| EPUB | Selectable text · chapter reading · continuous chapters | Reader typography, navigation/NCX, anchors and semantic footnote popups; no content DRM or publisher layout fidelity |
| CBZ | Comic pages in all reading modes | Naturally sorted raster images supported by the browser |
| TXT / MD / HTML / FB2 | Selectable reflowable text | UTF-8; basic Markdown headings/fences, safe HTML, text-only FB2; heading outline |
| DOCX / ODT | Selectable reflowable text | Optional text-only adapter; original export preserved, no print-layout or image fidelity |
| DjVu | Scanned pages in all reading modes | Bundled single-file documents; separately supplied external decoder |

```js
const reader = new Sela({
  url: '/books/story.epub', // EPUB / CBZ / DjVu inferred from URL extension
  language: 'en', mode: 'webtoon', theme: 'auto', pageGap: 0
});
await reader.open();
```

Set `format: 'epub'`, `'cbz'` or `'djvu'` explicitly for Blob URLs, byte data and extensionless endpoints. DjVu also requires `djvujsSrc`; its GPL-2.0 decoder is not part of the MIT bundle. CBR/RAR, CB7, MOBI/AZW, legacy DOC, RTF and content DRM are not supported in this release. DOCX/ODT provide text reflow. [Full format guide](docs/formats.md).

## 🔎 Book information & reading cards

Reader shows title, author, publication year, publisher, language, ISBN/identifier, description, subjects and rights when present. PDF metadata, EPUB Dublin Core, ComicInfo and FB2 are read locally; library information can be edited and survives backup/restore. Missing fields remain unknown—PDF file creation time is not treated as a publication date.

Saved page bookmarks appear under **Contents & bookmarks → Your bookmarks**. Tap **Screenshot & quote** in the app dock to create a 1080 × 1350 PNG with a passage or current PDF/comic page, title, author, year and page reference. Prepare the preview, then share it using your device’s file-sharing menu or download the PNG. Text books support quote cards; page screenshots require PDF/image pages. Only share passages you have permission to share.

```js
const reader = new Sela({
  url: '/book.pdf', ui: 'app', palette: 'forest', language: 'en',
  metadata: { author: 'Author name', year: '2026' }
});
await reader.open();
console.log(await reader.getMetadata());
```

This interface is the default for every reader, including inline embeds. Historical `ui: 'classic'` inputs are accepted as an alias. Palettes are scoped to the viewer and do not change your website theme. With `autoStyles: false`, include both `sela.min.css` and `sela.app.css` yourself.

## 🎛️ Read, tweak, repeat

Use `pageGap: 0` for seamless webtoon, `paperTexture: true` for subtle grain on book faces, `duration: 560` for eased folds, and `wheelZoom: true` to opt into ordinary mouse-wheel zoom. Ctrl + wheel / trackpad pinch zooms without changing ordinary scrolling; touch pinch is also supported. EPUB zoom changes text size.

| Shortcut | Action |
| --- | --- |
| Arrow keys / Page Up / Page Down | Previous / next; manga arrows follow RTL |
| Home / End | First / last page or chapter |
| + / − / 0 | Zoom in / out / reset |
| F / B / M | Fullscreen / bookmark / page sound |
| ? / Escape | Shortcut help / dismiss help or close reader |
| Ctrl/Cmd + F | Search within this document |

Shortcuts ignore editable fields. Reduced motion overrides fold duration. The playground exposes settings before opening and inside the reader.

Set `language: 'en'` for English reader controls or `'id'` for Indonesian (the default retained for existing integrations). The Pages topbar selects the demo language.

Use the Appearance tab for twelve page filters, document brightness and dimmed controls. These also work through `new Sela({brightness: .8, dim: true})`, `reader.setBrightness(.8)` and `reader.setDim(true)`. Filters affect presentation only; original files remain intact.

## 🎧 Listen, find, keep

Open **Contents & bookmarks**, **Search book**, or **Reader settings → All reading tools** (seven keyboard-accessible icon tabs: mode, contents, search, appearance, voice, notes, text), or call `await reader.showTools()`. Change modes and fit while reading, save global/per-book preferences, adjust text typography, and use low power or manual crop. Embedded PDF bookmarks resolve to their page; EPUB navigation/NCX opens chapters and anchors. Search scans pages sequentially, can be cancelled, and caps results at 100 matching pages. `await reader.getText(page)` returns extractable text. Scans and image comics need external OCR before narration/search can work. [Reading API, highlights, optional audio adapter and backup](docs/reading-experience.md).

**TTS uses the Web Speech API:** no Sela API key, paid SDK, server or model download. Local voices are selected by default; enable online voices explicitly if desired. Voices/languages come from the browser/OS. Remote voices may send narration text to their provider; local voice availability, audible quality, pause/resume and background playback vary. No guaranteed free third-party voice service or Indonesian voice is promised. Speech is chunked, user-started and cancelled on manual navigation or close. Optional continuous narration advances pages/chapters.

Write page/chapter notes; export/import a versioned JSON file with notes and personal bookmarks. Import merges the current book's notes by page/chapter number: use the same document edition. Notes are not geometric PDF highlights. EPUB chapter and relative scroll position resume on reopen; stable EPUB CFI locations are future work.

## 📚 Sela Reader — your private reading room

A local library with Home, Shelf, Explore and Settings, collections, favorites, sorting, grid/list/bookshelf views and ZIP backup. Home includes a reading calendar, gentle water reminders, timer, quotes, companion characters, weather and an optional custom backdrop softened for legibility. The install action opens a native prompt when available or browser/OS-specific steps, and hides after a detected installation. Touch devices get bottom navigation; wide screens get a side rail. Ten language choices include country flags; the public page uses a supported IP-country mapping on first visit and defaults unmapped countries to English. You can always bookmark Sela; no browser extension is required.

## Language and privacy

The public page uses [country.is](https://country.is/) on first visit to select a supported language (for example, Indonesia → Indonesian, Japan → Japanese, Spain → Spanish). Unmapped countries default to English; a saved manual choice wins, and a 2.5-second lookup failure falls back to browser language. `?geo=off` disables the lookup. No document, precise device location or browser history is sent. The embed library makes no IP lookup; use `language: 'auto'` for browser language or supply a supported locale from your host.

## Quick start

[![CDN / self-hosted viewer](https://img.shields.io/badge/install-CDN_%2F_self--hosted-236947?style=for-the-badge&logo=javascript&logoColor=white)](docs/install.md)

Choose **Reader** for a personal library, or **Viewer** for embedding in a website. [Open the app](https://bobbyfch.github.io/sela/mobile/) · [Viewer installation](docs/install.md).

## Reading API

`open()` returns a promise; `close()`/`destroy()` cancel work. Controls: `next()`, `prev()`, `goTo(page)`, `firstPage()`, `lastPage()`, `zoomIn()`, `zoomOut()`, `setZoom(value)`, `toggleFullscreen()`, `setFilter(value)`, `setBrightness(.35 ... 1.25)`, `setDim(boolean)`. Position: `currentPage()` and `totalPages`.

Manga preserves PDF page numbers: `next()` increases the page number; **ArrowLeft** advances in RTL. Source pages must already be in reading order. `readingDirection: 'rtl'` also works with book/single.

Filters: `none`, `grayscale`, `sepia`, `contrast`, `warm`, `cool`. Grayscale avoids relying on hue; warm/cool presets are personal adjustments, not medical color-blindness correction. Filters affect canvases, never the source PDF/download.

Events: `ready`, `pagechange`, `pageerror`, `close`, `error`; payloads are in `event.detail`. Options include `presentation`, `container`, `format`, `language`, `pageGap`, `paperTexture`, `wheelZoom`, `startPage`, `id`, `storagePrefix`, `maxScale`, `maxCanvasPixels`, `duration`, `httpHeaders`, `withCredentials`, `password`, `data`, `assetBase`, `pdfBuild`, `zIndex`. Current zoom is available as `reader.zoom`. [Full declarations](dist/types/index.d.ts).

## Privacy & accessibility

Selected demo documents stay in the browser; no upload or analytics. Bookmarks/progress use localStorage when available. CDN requests follow normal browser networking. Keyboard controls, focus trapping, labelled actions and reduced motion are included. PDFs render to canvases; optional tools provide a selectable text transcript, but this is not an aligned text layer or full tagged-PDF accessibility. Provide an accessible original for screen-reader users. EPUB scripts and external resources are removed. Physical Safari/iOS and mobile device testing remains outstanding; no full WCAG conformance claim is made.

## Development

Sela is currently **beta.2** (`0.9.0-beta.2`), not a stable release. The release version comes from `package.json`; build output supplies the page headers, runtime and CDN examples. [Development and versioning](docs/development.md).

Viewer, app, workers, tooling and tests are authored in TypeScript; Vite builds the SDK/React app shell and Astro generates public/reader pages from TSX. Browser JavaScript and SDK declarations are generated; existing CDN URLs stay the same. Use Node.js 22.18+ for development. [Source layout and typing limits](docs/typescript-migration.md), [Next Generation delivery](docs/next-generation-delivery.md).

```sh
npm ci
npm run typecheck
npm run build
npm test
npm run test:types
npm run test:browser
npm run serve
```

The browser suite covers PDF/EPUB/CBZ/DjVu, real pixels, layouts, RTL, filters, Vue lifecycle, flag/theme controls, mobile settings, archive errors, cancellation and auth headers. CI checks Chromium, Firefox and WebKit; local checks also use Edge. Release checks exercise the viewer and dedicated library; see CI for current results. Platform lists do not imply testing every OS/version or physical devices.

## Open source 🌱

MIT © Bobby Fajar Christian. Engine adapted from [PDFlipbook](https://github.com/SympleNZ/PDFlipbook) (MIT), PDF renderer [PDF.js](https://github.com/mozilla/pdf.js) (Apache-2.0), ZIP adapter fflate (MIT). External DjVu.js decoder is GPL-2.0 and is not bundled. [Third-party notices](THIRD_PARTY_NOTICES.md).

If Sela makes your project easier to read, a ⭐ helps others find it. [Contributions](CONTRIBUTING.md) and bug reports are welcome: include a reproducible PDF, browser version, mode and console error.

## Created by Bobby

Sela prints a one-time console credit when opened and includes a small source link in the viewer. These are credits, not a promise of search ranking. [Portfolio](https://bobbyfajarc.github.io/) · [Instagram]([private social link removed]) · [LinkedIn]([private social link removed]) · [GitHub](https://github.com/bobbyfch).

Reader settings include optional local audiobook controls, embedded EPUB SMIL narration and soft-rain ambience with a sleep timer. Playback and codecs depend on the device; no streaming music service is bundled.

## Personal backup

Settings → Download full backup exports books and reading data to ZIP. Share backup prepares the archive; tap again to choose an installed app using your device’s share sheet. Restore imports the ZIP without replacing existing books or newer notes. Optional HTTPS WebDAV pull/push uses conditional writes; explicit remote review merges progress/bookmarks and preserves conflicting notes as notebook copies. Credentials stay in the session. A CORS-enabled server is required.

## 🌐 Beyond your shelf

Open **Explore** for GITenberg, Gutendex, multilingual Wikisource, Open Library, DOAB, OpenStax, Standard Ebooks and named OPDS profiles. Results use cover shelves, pagination, detail sheets and **Read / download** actions. Read is an ephemeral preview; download keeps the validated edition. Metadata-only providers link to the source. Eight selected classics remain available as a fallback. Content downloads only when requested; editions, API limits and copyright vary by source and country. [Sources and limits](docs/library-sources.md).

**Home** prioritizes continue reading, your ordered reading desk, a weather-aware cat/hamster/plant scene and a book-linked 15/25/45-minute session. Shelf counts live in Settings. Optional weather sits beside the clock: choose a city manually, with no location permission or API key. Results are cached for 30 minutes. [Weather privacy and hosting](docs/weather.md).

## Modern application and SDK extensions

React 19 owns the app shell, Vite 8 builds the app and independent viewer, Astro 7 generates the public site, and TypeScript 7 checks their contracts. Native document controllers keep CDN/PHP hosts free of a React or Node runtime requirement. Material textures and vector icons are local assets.

The optional `@bobbyfch/sela/host` entry provides disposable toolbar/selection commands, source loaders, custom host renderer adapters, annotation storage, dictionary/translation providers and a privacy-safe debug panel. No provider is contacted without host configuration. See [host contracts](docs/host-extensions.md), [framework runtime checks](docs/framework-validation.md), and [current validation](docs/modern-stack-validation.md).

Regenerate product screenshots with `npm run serve` and `npm run screenshots`. Captures use the actual application in a disposable browser profile; device frames are CSS on the public page.

## Make it yours

Name your reading room, choose a companion, quiet the scene and hide optional Home sections. My room offers a cross-book notebook with Markdown export, reading journal, smart shelves, travel readiness, library care and collection-card PNG previews. Book details hold messages for later, impressions, favorite passages, ribbon labels and volume order. Connections adds local full-library text search, opt-in dictionary/translation and format-group reading presets.

The public page, app and fresh product screenshots share a Linen reading-room scene. Original files remain local; scans need external OCR. Online provider availability varies, and physical mobile playback/storage are not guaranteed. [Complete delivery and validation boundaries](docs/personal-reader-delivery.md).
