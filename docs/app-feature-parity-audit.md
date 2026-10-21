# `/app` feature parity audit

Date: 2026-10-21 (latest UAT added below; earlier evidence remains historical)  
Scope: compare the old `app/library` experience with the new React app served at `/app`.

## What “rebuilt” means

The new user-facing flows and screens live in `web/app/ui` and use React with Mantine. They do not mount the old DOM-built screens. The new app keeps the existing local storage schema, file store, provider adapters, and Reader SDK where those are the stable data and format boundaries. Reusing those contracts preserves existing books and reading progress; it does not count as reusing the old screen implementation.

## Feature map

| Previous feature area | New `/app` surface | Status |
| --- | --- | --- |
| Home, continue reading, starter sample, rediscovery, queue, quiet reading, focus timer | Home screen and dedicated React widgets; sample can be read or saved locally; queue order/removal is editable | Rebuilt in React |
| Book shelf and 3D room | Shelf screen with grid/list/3D views, search, status/favorite/collection filters, density and shelf appearance controls | Rebuilt in React; open floating boards adapt to visible rows, with front-facing cover art and book depth; several-book rows and reorder behavior remain open |
| Book details, personal notes and series order | Book information and notes dialogs, metadata lookup/edit, volume order and favorite passage | Rebuilt in React |
| Bulk shelf actions | Select visible books, clear selection, favorite, finish, mark did-not-finish, add to collection, remove and undo batch removal | Rebuilt in React |
| Smart shelves, travel readiness, storage care and collection cards | Library tools screen with rule-based shelves, local file checks, optional persistent-storage request and PNG card export | Rebuilt in React |
| Search inside local books | Worker-backed local search with result-to-book/page navigation | Rebuilt in React |
| WebDAV sync and reading presets | Optional pull/merge/push settings and format-aware default reading modes | Rebuilt in React |
| Online discovery | React Explore with nine public sources, topic and collection filters, Wikisource languages, pagination, and saved OPDS catalogs | Rebuilt in React; OPDS credentials remain in page memory and are only sent to the matching catalog origin |
| Reader controls and personal reader tools | React-owned header/footer controls, page and bookmark actions, a page-preview dialog with PDF thumbnails, and the Reader desk with settings, contents, search, notes/highlights, narration, profiles, audio, dictionary/translation, share cards, metadata and book information | React app panels and chrome rebuilt; SDK remains a headless parsing/rendering/service boundary |
| Home reading widgets | Calendar with week/month views and sourced holiday dates, sourced reflection, water tracker, history, news, weather, manual prayer times, faith reading, Quran and Islamic reading shelf | Rebuilt in React; external sources need runtime checks |
| Reading history and notebook | Progress metrics, 7/30/365-day charts, current/longest streak, best day, 30-session journal, weekly target and searchable notebook | Rebuilt in React |
| Settings, themes, backup and updates | One settings index with backable detail screens; nine themes, shelf finish/density, reader defaults, export/share/restore, update check, personal preferences and About | Rebuilt in React |

## Architecture boundaries

- New UI entry and route composition: `web/app/ui/app.tsx` and `web/app/ui/screens.tsx`.
- Reusable user-facing features are grouped under `web/app/ui/features/{home,personal,progress,reader,discovery}`.
- Mantine provides shared controls and layout; `app.css` contains the app-specific theme and responsive composition.
- The old DOM-built screen modules (`advanced`, `collections`, `home-atmosphere`, `home-world`, `home-widgets`, `library-experience`, `library`, `personal`, `prayer-times`, `reading-desk`, `reading-progress`, and `weather`) were removed. Active storage, personal-data, provider, format and Reader SDK modules remain service boundaries; they are not mounted as the old app UI.
- PWA share-target/file intake hands files to the React workspace through an app event; it no longer dynamically imports the retired DOM library screen.
- Reader format parsing and page rendering remain in the Sela Reader SDK. `/app` opens it in explicit headless mode, so the React route owns all visible reader chrome, page previews, the reader desk, contents, search, annotations, narration, profiles, audio, dictionary, sharing and book information. The SDK exposes page-thumbnail and original-download APIs to React.

## Verification state at the 2026-10-20 checkpoint

- Feature presence above is confirmed by the current React routes and imports; that is a code-level audit, not proof that every live interaction works.
- [x] Production build passed after the responsive and shelf changes. Feature routes/widgets are split into lazy chunks; Vite still reports its 500 KB advisory for the optional Three.js shelf-room chunk.
- [x] `npx tsc --noEmit -p tsconfig.ui.json` passes with no diagnostics, including `backup.ts`, `book-sources.ts`, `external-catalogs.ts`, `file-format.ts`, `opds.ts`, and `storage.ts`.
- [x] A desktop Chrome preview on a fresh local origin rendered Home, Explore (nine providers) and Settings → Library tools with an empty library.
- [x] A fresh desktop Chrome tab opened the sample book at `/app`, advanced from the cover to its rendered spread, opened the React Reader desk, loaded its contents list, and returned 29 results for an in-book search. Narration controls rendered and correctly reported that the available browser voices do not match the Indonesian book.
- [x] A populated desktop Chrome Reader check at 1247×617 showed React-only header/footer controls and a full-size rendered PDF spread. The Mantine preview dialog rendered real page thumbnails; selecting a page navigated the flipbook after its page-turn animation, and the sample was returned to page 2 / 50.
- [x] A 393×852 responsive Chrome check showed the Reader controls and single-page PDF clearly. The full-screen page-preview dialog keeps its header/footer inside the viewport and scrolls the thumbnail grid independently.
- [x] A populated 393×852 mobile pass visually reviewed Home, Shelf, Explore, Progress and Settings, including its Appearance detail. The checked route surfaces stayed within the viewport width; opening a detail from a scrolled Settings page now resets to the detail heading.
- [x] A locally saved sample cover rendered on the new open, cardless floating shelf. One visible row uses one shelf board; the cover faces forward, with its art, paper edge and soft cast shadow visible.
- [x] Visually rechecked the floating shelf at 320, 375, 414, 768 and 1440 px. The board, cover and book index remain inside their layout; the mobile dock does not cover the shelf.
- [x] Responsive app-route matrix covered Home, Shelf, Explore, Progress, Settings and four settings details at 320, 375, 414, 768, 1024, 1280 and 1440 CSS px. Document width matched the browser content width; no `object-fit: fill` image had a stretched intrinsic ratio.
- [x] Public page measured at 320, 375, 393, 414, 430, 480, 481, 768, 1024, 1280 and 1440 CSS px. The 320 px nav logo squeeze and 414 px brand/control collision were fixed by a two-row header through 480 px; document width matched the content width and no stretched images were found.
- [x] The React Reader desk opened, Escape closed its dialog while leaving the Reader route active, and the local-source download action produced the original 1,129,926-byte PDF in the browser's Downloads folder.
- [x] The latest production build passed after the headless Reader, thumbnail and local-download updates. Vite still reports the optional app chunk above its 500 KB advisory.
- [ ] Review Home, Shelf, Explore, Progress, Settings, Reader and dialogs in desktop and mobile browsers with populated sample data.
- [ ] Exercise destructive/remote flows: batch removal and undo, backup restore, WebDAV merge, OPDS authentication and imports.
- [ ] Exercise network-dependent widgets and sources with online, offline, timeout and malformed-response cases.
- [ ] Review all nine themes, multi-book 3D shelves, reorder/camera behavior, supported reader formats and accessibility behavior.
- [x] The SDK compatibility toolbar and legacy preview drawer are bypassed in `/app` headless mode; React now owns these visible controls and preview cards.
- [ ] Automated unit/browser suites were not run. Route, PWA, incoming-file and appearance specs were migrated to `/app`; remaining Playwright files still use pre-React selectors and need a full migration before the suite is a reliable regression signal.
- [ ] Firefox/WebKit, physical devices, screen readers, PWA installation/offline behavior, all destructive/remote flows, every theme, and several-book shelf arrangements remain unverified.

This is the prior checkpoint snapshot. The newer cross-engine evidence and current remaining limitations follow.

## Latest UAT update (2026-10-21)

- `npm run build`: **PASS**. The existing optional Three.js shelf-room chunk still triggers Vite's advisory above 500 KB.
- `npm run typecheck`: **PASS**.
- `npm test`: **PASS**, 92/92 unit tests.
- Full Playwright run across Chromium, Firefox and WebKit: **439 passed, 8 skipped, 3 failed of 450**. The three combined-run failures were the Firefox backup/export lock test, the WebKit paper-theme dropdown test, and the WebKit Home sample-button stability test. Each passed in an isolated rerun on its original engine. The combined run remains a mixed result, not a clean pass.
- Follow-up full runs with a fresh process for each engine: **Chromium 150/150 passed; Firefox 146 passed/4 skipped; WebKit 146 passed/4 skipped**. All three exited successfully with zero failures. The reason the three timeouts appeared only in the combined run is not established; both results remain recorded.
- Targeted app quote flow passed in all three engines. It now verifies selection from the `/app` light-DOM reader, reading-position capture/restore, article-scoped heading styles, and saving the selected text as a local note. Non-app Reader embeds retain Shadow DOM isolation.
- Reader ResizeObserver fallback passed in Firefox. Reader mode changes, dialog focus return, prayer city setup with Weather disabled, Discover edition details, responsive Discover layout, palette combinations and topbar appearance/theme separation passed in the full engine runs or targeted reruns.
- Browser coverage exercised responsive widths and local/mocked network flows; it does not establish behavior on physical devices or every live external provider response.
- **Still not tested:** physical iOS/Android devices, screen-reader/assistive-technology behavior, genuine PWA installation and offline launch on installed browsers, and exhaustive shelf-camera/reorder behavior with multiple real cover files. These are not claimed as complete parity.
