# Sela comprehensive refactor checklist

**Review date:** 2026-10-19 · **Scope:** local working tree only. No push, deployment, PR, merge or remote repository changes.

Status meanings: **DONE** = implemented or already present and verified for the stated scope; **PARTIAL** = a specific part remains or evidence is limited; **NOT TESTED** = not verified in this run. A checked item does not imply platform coverage beyond its stated evidence.

## 1. Repository and architecture audit

- [x] **DONE** — Reviewed source/build output separation, dependencies, app routes, reader/viewer, storage, provider adapters, PWA configuration, docs and tests.
- [x] **DONE** — Kept Astro for static/public pages, React 19 + TypeScript for the interactive shell and reader surfaces, Tailwind 4, CSS tokens and static-host/PWA outputs.
- [x] **DONE** — Replaced Base UI primitive dependency with Radix and kept native controls where they preserve existing reader/controller contracts.
- [ ] **PARTIAL** — Convert the remaining DOM-built bookshelf and settings screens into React islands. Their compatibility bridge remains in place; no mass rewrite was made because it risks selectors, storage and reader behavior.
- [x] **DONE** — Kept source TypeScript; generated `.js` outputs and the intentional web-component example were not misclassified as source migrations.

## 2. Unified design system

- [x] **DONE** — Added shared semantic color, type, spacing, motion, radius and shadow tokens while keeping the active Sela palette in control.
- [x] **DONE** — Shared Button, Dialog, NativeSelect and Popover sources are reusable; Dialog/Popover now use Radix.
- [x] **DONE** — Hallmark editorial Almanac styling now covers the app shell, Home, Shelf, Explore, Progress and Settings; the reader keeps its long-document layout.
- [x] **DONE** — Reviewed all five app pages at 320, 375, 414, 768 and desktop widths in light and dark themes; no horizontal overflow appeared at those sizes.
- [x] **DONE** — The public product route has a separate full visual rebuild and responsive Chromium review; standalone SDK Viewer states remain outside that public-page pass.

## 3. Themes, mascot and illustrations

- [x] **DONE** — Existing theme/palette engine continues to drive semantic colors and illustration surfaces; no destructive CSS filter was introduced.
- [ ] **NOT TESTED** — Every palette, mascot and illustration in every light/dark combination was not exhaustively captured in browsers in this run.
- [ ] **NOT TESTED** — Hydration flicker/mismatch on each supported browser and device was not independently measured.

## 4. Home header and quotes

- [x] **DONE** — Existing Home quote/header composition and responsive work were inspected; the settings reflection now renders directly.
- [x] **DONE** — Refined the Home hierarchy and spacing; reviewed the 1440 desktop and 320 phone layouts, with responsive geometry checked at 375, 414 and 768.

## 5. Shelf and Explore

- [x] **DONE** — Existing shelf and discovery flows, categories, search and source-aware states were retained; provider parsing now has timeout/retry/cache recovery behavior.
- [x] **DONE** — Removed the oversized decorative shelf stage, simplified book cards, and made Explore source choices adapt to available width.
- [ ] **NOT TESTED** — All filters and sorting were not manually exercised at each of the four target viewport sizes in this run.

## 6. Religious reading and navigation

- [x] **DONE** — Existing supported traditions and source/edition attribution remain; six respectful faith marks include “none” and “prefer not to say”.
- [x] **DONE** — No new scripture, translation, faith or placeholder was added without an identified source and rights record.
- [ ] **PARTIAL** — Completeness and legal status still vary by edition/jurisdiction; this checklist does not certify all traditions or translations as complete or reusable.
- [ ] **NOT TESTED** — Every chapter boundary, original script, transliteration, offline and missing-data case was not re-run on physical devices.

## 7. Sela Books, Viewer, installation and Playground

- [x] **DONE** — Existing public product, install, PWA fallback and Playground routes were preserved; generated build outputs are refreshed after verification.
- [ ] **PARTIAL** — Platform-specific install and PWA offline behavior needs real browser/device checks beyond static build and Chromium automation.

## 8. Reader and Viewer bug fixes

- [x] **DONE** — Existing format-aware navigation was retained across PDF, EPUB, CBZ and text; shared reader contracts were not replaced.
- [x] **DONE** — The browser/unit suites cover the current reader regression surfaces and use real local/sample fixtures where available.
- [ ] **NOT TESTED** — Corrupt/empty cases, touch, zoom, fullscreen, orientation and all first/last chapter boundaries were not each repeated on physical devices.

## 9. About, daily reflection and icons

- [x] **DONE** — Daily reflection is visible without an expand/hide action.
- [x] **DONE** — Settings quote layout stays readable at phone widths and avoids doubled quotation marks.
- [x] **DONE** — GitHub, Instagram, Threads and LinkedIn now use brand-specific marks in About and the app footer; text labels remain.
- [ ] **PARTIAL** — A semantic/icon audit of every other icon in every product route remains broader than the targeted social-icon fix.

## 10. Settings and personalization

- [x] **DONE** — Faith, gender, stats and routines are grouped under **Personal data / Data pribadi** while simple settings remain inline.
- [x] **DONE** — Gender is optional, stored locally, defaults to unspecified, and does not automatically change palettes or recommendations.
- [x] **DONE** — Existing preference schema version stays compatible; v1 data defaults safely and valid new gender values persist.
- [x] **DONE** — All palettes remain available; existing values are not reset.
- [ ] **NOT TESTED** — Assistive-technology behavior was not certified with screen readers across platforms.

## 11. Public API research and integration

- [x] **DONE** — Inventoried all 301 directory rows (including pagination) and screened every listed name for Sela relevance; full name lists and decision groups are in [api-provider-audit.md](api-provider-audit.md).
- [ ] **PARTIAL** — Official docs, endpoint smoke test, license, quotas, CORS, data fields, pagination, reliability and the ten requested criteria were not individually verified for every long-tail directory name. The audit explicitly identifies which candidates received deep review and which were rejected at the relevance screen.
- [x] **DONE** — Kept useful source-aware book/religious/news adapters; no game metadata or comic API was represented as legal comic reading.
- [x] **DONE** — Catalog adapter now has normalized page/book types, allowlisted HTTPS hosts, credentials omitted, request timeout, bounded retry, retry-after handling and stale cache for temporary failure.
- [x] **DONE** — Tests cover 429 retry, abort, stale cache, permanent failure and request privacy settings.
- [ ] **PARTIAL** — Open Library search now uses its direct HTTPS endpoint after a live HTTP 200/wildcard-CORS smoke check. Gutendex and Guardian RSS still depend on the documented CORS.dev public bridge; it publishes limits and a privacy policy but has not received an independent security audit. No credential, private shelf data or reader record is sent. The direct Gutendex smoke request timed out after 20 seconds and remains inconclusive.
- [x] **DONE** — No API key or paid backend was added to the browser bundle.

## 12. Cleanup and performance

- [x] **DONE** — Removed the redundant `@base-ui/react` dependency; reusable control dependency is Radix.
- [x] **DONE** — The Button wrapper is native and keeps its existing style variants; its `asChild` capability was unused by current call sites.
- [ ] **PARTIAL** — A repository-wide dead CSS/dead code and bundle-size reduction pass was not performed; broad cleanup without screen-level verification would risk existing layouts.
- [x] **DONE** — Existing lazy-loaded reader/catalog modules and framework-independent Viewer remain.

## 13. Validation and regression testing

- [x] **DONE** — TypeScript typecheck completed after Radix and social-icon changes.
- [x] **DONE** — Production build completed successfully; generated assets and offline metadata were refreshed.
- [x] **DONE** — Unit suite passed: 89 passed, 0 failed.
- [x] **DONE** — Full Chromium Playwright suite passed: 181 passed, 1 skipped, 0 failed; it ran before the final Open Library URL change. After that change, the affected discovery/Explore tests were rerun: 9 passed, 0 failed. Coverage includes source, settings, reader, theme and multiple viewport regressions.
- [ ] **NOT TESTED** — A repository lint script is not configured; no lint result is claimed.
- [x] **DONE** — Manual visual review covered all five app tabs at 320, 375, 414, 768 and desktop widths in light and dark themes; shelf, quote and chart layout issues were corrected.
- [x] **DONE** — The public route was reviewed at 320, 375, 414, 768, 1024, 1120, 1121, 1200 and 1440 CSS px; its header now switches to a disclosure menu before the desktop navigation becomes crowded.
- [ ] **PARTIAL** — Other app palettes, standalone Viewer states and every reader format were not exhaustively reviewed in this pass.
- [ ] **NOT TESTED** — Firefox/WebKit, physical touch devices, PWA installation and offline operation were not verified in this run.
- [ ] **NOT TESTED** — No claim of full WCAG conformance or zero console errors across every route is made until those checks run.

## 14. Public website rebuild

- [x] **DONE** — Reviewed 2026 web design, typography, entry-page, accessibility and Core Web Vitals guidance; the dated research and sources are in [public-design-research.md](public-design-research.md).
- [x] **DONE** — Rebuilt the public route around a clear choice between Sela Books and Sela Viewer, followed by a sample/local-file flow and progressive Viewer setup.
- [x] **DONE** — Replaced public-page utility-class styling with a dedicated semantic stylesheet; preserved theme, language, sample, file-selection, demo, generated setup and reader-launch hooks.
- [x] **DONE** — Added responsive navigation, collapsed installation details, visible keyboard focus, reduced-motion handling and theme-aware surfaces.
- [x] **DONE** — Production build passed after the public CSS and 320 px/compact-navigation fixes.
- [x] **DONE** — Chromium preview confirmed no horizontal overflow at 320, 375, 414, 768, 1024, 1120, 1121, 1200 and 1440 CSS px; language, theme, mobile menu and live setup generation were checked.
- [ ] **NOT TESTED** — Screen readers, physical touch devices, Firefox/WebKit, Lighthouse and field Core Web Vitals were not measured; no full WCAG or performance claim is made.
- [x] **DONE** — No additional plugin or production dependency was needed; the existing Astro, Tailwind and Phosphor stack covers the public page.

## 15. Final output and change control

- [x] **DONE** — API decisions and this full-scope checklist are saved in repository docs.
- [x] **DONE** — Work remains local; no GitHub write, push, deployment, PR, merge or remote modification was performed.
- [x] **DONE** — Final report will separate PASS, FAIL, NOT TESTED and remaining work.

## 16. Paper & Ink visual reset (2026-10-19)

- [x] **DONE** — Researched Apple Liquid Glass guidance, reading-library conventions, paper-like monochrome reading references, and accessibility guidance; sources and design decisions are recorded in [public-design-research.md](public-design-research.md).
- [x] **DONE** — Rebuilt the public hero and section hierarchy around a quiet book still life, direct library/Viewer choices, sample reading, local-file selection, and a progressive Viewer setup flow.
- [x] **DONE** — Replaced the public styling layer with one responsive paper/ink system; glass is limited to navigation and controls while reading and editorial surfaces stay matte.
- [x] **DONE** — Replaced the brand mark and PWA icon set with a monochrome open-book mark, and added original grayscale book photography for public and app home use.
- [x] **DONE** — Removed visible mascot artwork and choices from live surfaces; old compatibility image paths now contain neutral book photography rather than cartoon artwork.
- [x] **DONE** — Shifted app palettes and chrome to neutral paper, linen, mist, graphite and charcoal tones while retaining stored palette keys and user data.
- [x] **DONE** — Reviewed the public page at 320, 375, 393, 414, 768, 1024, 1120, 1280 and 1440 CSS px with no horizontal overflow; inspected public light/dark and app home light/dark appearance in local Chromium.
- [x] **DONE** — Production build passed and screenshot assets were refreshed, including `site/screenshots/public-home-desktop.png` for direct visual review.
- [ ] **NOT TESTED** — Unit/browser regression suites were not rerun after this visual reset; screen reader, Firefox/WebKit, physical-device, installation and offline checks remain outside this pass.

## 17. Installed app fresh visual reset (2026-10-19)

- [x] **DONE** — Rebuilt the app shell around the shared Paper & Ink system, replacing the old side rail with a responsive floating navigation pill.
- [x] **DONE** — Gave Home, Shelf, Explore, Progress, and Settings distinct layouts; retained the existing navigation, local-file controls, reader entry points, and settings actions.
- [x] **DONE** — Added Vanilla, Olive, Parchment, Mist, Stone, Oat, Cocoa, Ivory, and OLED appearances while keeping stored palette keys readable; manually confirmed OLED true black and Olive selection in the running app.
- [x] **DONE** — Recorded current Gen Alpha and Liquid Glass research, including geographic and age-range limits, in [app-design-research.md](app-design-research.md).
- [x] **DONE** — Production build passed. Manual Chromium review covered 320, 393, 768, 1280, and 1366 CSS px; measured document width matched the browser content width at 320, 393, 768, and 1366 px. Refreshed app screenshots for Home, Shelf, Explore, Progress, and Appearance.
- [ ] **NOT TESTED** — Automated unit/browser regression suites, physical devices, assistive technology, Firefox/WebKit, and field performance metrics were not included in this visual-reset pass.
- [x] **DONE** — No additional runtime plugin or production dependency was needed for this redesign; existing CSS and image tooling cover the glass materials and art assets.

## 18. Final responsive polish (2026-10-19)

- [x] **DONE** — Kept the reader canvas, toolbar, and settings drawer on the paper-and-ink theme after the final CSS cascade; the toolbar and drawer retain the layered glass treatment.
- [x] **DONE** — Fixed the audio file input utility so the native input is visually hidden and no longer widens the reader settings drawer at 320 px.
- [x] **DONE** — Tightened the narrow-screen Settings detail heading and compacted Explore source cards so the search field clears the desktop navigation pill.
- [x] **DONE** — Rebuilt successfully and refreshed app screenshots from the local Chromium preview; Home, Shelf, Explore, Progress, Settings, Appearance, and public pages have current captures.
- [x] **DONE** — Manually checked the 320 px reader/settings flow and desktop Settings scroll end; document width remained within the viewport.
- [ ] **NOT TESTED** — Automated suites, screen readers, physical devices, Firefox/WebKit, and offline installation were not rerun for this polish pass.

## 19. Installed app rebuilt from a new foundation (2026-10-19)

- [x] **DONE** — Re-read current research for reading-library navigation, search placement, Liquid Glass controls, younger readers' app use, responsive reflow, and touch targets; conclusions and source limits are recorded in [app-design-research.md](app-design-research.md).
- [x] **DONE** — Replaced the installed app's previous page composition with a persistent desktop rail, compact task header, book-led canvas, contextual Home focus tools, cover-first Shelf, source-first Explore, single-report Progress, and a Settings index with focused categories. This section records the new app direction after the earlier floating-pill pass in section 17.
- [x] **DONE** — Added one app-scoped visual foundation in `ui/app-foundation.css` and disconnected prior app layout imports while keeping the public page on its own stylesheet.
- [x] **DONE** — Added Vanilla, Olive, Parchment, Mist, Stone, Oat, Cocoa, Ivory, and OLED surfaces using OKLCH tokens; preserved the stored palette IDs and kept book covers and page imagery in their original colors. Accent foregrounds now use the theme token, with distinct light/dark accent values for readable controls.
- [x] **DONE** — Added named 4 px spacing tokens and fluid spacing tokens; fixed the 320 px body minimum-width overflow and the mobile Scripture and room-image grid tracks.
- [x] **DONE** — Kept existing routes, preferences, IDs, local storage, import and reader handlers, discovery sources, and settings actions in place; no new runtime plugin or production dependency was needed.
- [x] **DONE** — `npm run build` passed after the final palette, footer-width, and Explore hover refinements. No automated unit or browser suite was run in this pass.
- [x] **DONE** — Chromium review covered Home, Shelf, Explore, Progress, Settings, and Reading & appearance. Document width matched the content width at 320, 375, 414, 768, 1024, 1280, and 1440 CSS px; 320 px visual review included Home, Shelf, Explore, and palette controls.
- [x] **DONE** — Solid-surface text contrast checks found no failures on the reviewed light app sections or dark Home; theme accent/foreground pairs calculate to at least 6.57:1 in light palettes and 7.61:1 in dark palettes. True-black OLED was visually reviewed.
- [ ] **PARTIAL** — Hallmark review recorded 56/58 gates reviewed: true-black OLED remains an explicit gate 7 exception requested for the OLED theme, and gate 39 was not exhaustively audited across every dynamic form.
- [ ] **NOT TESTED** — Import, backup/restore, all reader formats, every discovery provider, offline installation, screen-reader use, physical touch, Firefox/WebKit, and full WCAG conformance were not rerun or certified.

## 20. Reader features, settings flow, and customizable 3D shelf (2026-10-19)

- [x] **DONE** — Researched current Apple Books, Kobo, Goodreads, OpenDyslexic, and Three.js guidance; recorded the comparisons, implementation choices, and backward-compatible DNF backup handling in [app-design-research.md](app-design-research.md).
- [x] **DONE** — Reused the existing calendar, quote/reflection, home widgets, carousel, and icon systems; added no redundant calendar or icon plugin.
- [x] **DONE** — Consolidated shelf material, room, depth, and row-spacing controls under Settings → Reading & appearance; Settings category navigation supports the browser Back action and an icon-only accessible Back control.
- [x] **DONE** — Added persistent custom book order with drag placement on the 3D shelf and accessible earlier/later menu actions; data stays in local storage and leaves the book database schema unchanged.
- [x] **DONE** — Added Did Not Finish as a separate book status, filter, bulk action, and smart-shelf rule; status moves through backup/restore and is compatible with earlier version-1 backups.
- [x] **DONE** — Added optional OpenDyslexic reader font and a more spacious accessible reading profile; bundled the font locally and included its license in the build output.
- [x] **DONE** — Production build passed. Manual Chromium review checked the desktop and 393 px Settings detail, icon-only Back, browser Back, material/room choices, responsive slider stacking, and an empty shelf shell.
- [ ] **PARTIAL** — 3D cover rendering and drag reordering were inspected in code but not visually exercised with a sample book; the preview library has no imported books.
- [ ] **NOT TESTED** — Automated unit/browser suites, screen-reader use, physical devices, Firefox/WebKit, and font behavior in every document format.

## 21. Rebuilt app feature parity and update prompt (2026-10-19)

- [x] **DONE** — Replaced the unstyled update notice with a responsive glass update card, clear actions, safe-area spacing, and theme-aware colors.
- [x] **DONE** — Restored a manual update check under Settings → Backup & data; its status is shared with the PWA worker flow.
- [x] **DONE** — Restored the nine Vanilla, Olive, Parchment, Mist, Stone, Oat, Cocoa, Ivory, and OLED themes in the new app preference schema.
- [x] **DONE** — Rebuilt the old Home, shelf, Explore, Progress, Settings and app-specific Reader flows as React screens/components under `web/app/ui`; the new routes do not mount the old DOM-built screens.
- [x] **DONE** — Rebuilt book details, per-book notes/reviews/favorite passages, series order, metadata lookup, smart shelves, bulk shelf actions with batch undo, offline file checks and collection-card export.
- [x] **DONE** — Rebuilt local book-content search, WebDAV sync controls, reading presets and the nine-source Explore flow with Wikisource language selection and saved OPDS catalogs.
- [x] **DONE** — Rebuilt Home reading widgets, sourced reflections, faith/Quran browsing, weather/prayer controls, focus timer, sample book and rediscovery; rebuilt reading metrics, history and the 30-session journal.
- [x] **DONE** — Rebuilt the Reader desk in React with settings, contents/bookmarks, current-book search, notes/highlights, narration, profiles, audio, dictionary/translation, book information and share-card panels around the shared document renderer.
- [x] **DONE** — Kept the existing local file store, personal-data schema, provider services and Reader SDK as explicit compatibility/service boundaries so existing books and progress remain readable; this is a UI rewrite, not a claim that every low-level service was duplicated.
- [x] **DONE** — Production build passes after the parity additions. The app entry is split from screen/widget chunks; the optional 3D shelf-room chunk remains above Vite's 500 KB advisory.
- [x] **DONE** — Desktop Chrome preview confirmed Home, Explore (9 sources), Settings and Library tools render on a fresh local origin; a populated sample opened in the Reader, advanced to a rendered spread, showed its contents list, and returned 29 results for an in-book search.
- [x] **DONE** — Follow-up section 22 moved the visible `/app` Reader chrome and page previews fully to React; the SDK now runs headless for this route and remains the format/parser/renderer boundary. See [app-feature-parity-audit.md](app-feature-parity-audit.md).
- [ ] **NOT TESTED** — The complete feature map and its remaining interaction checks are tracked in [app-feature-parity-audit.md](app-feature-parity-audit.md). Code presence is not end-to-end verification.
- [ ] **NOT TESTED** — Populated states, every destructive/remote flow, all nine theme appearances, mobile update prompt geometry, PWA multi-window update behavior, reader formats, screen readers and physical devices still need review.

## 22. Headless SDK and React Reader chrome (2026-10-20)

- [x] **DONE** — Added an explicit SDK `headless` option; `/app` no longer imports the legacy SDK chrome module or mounts its legacy page-preview drawer.
- [x] **DONE** — Added reusable React Reader header/footer controls for navigation, page position, progress, bookmark, fullscreen, download, reading desk and previews.
- [x] **DONE** — Added a Mantine page-preview dialog with searchable chapters/pages, bookmark filtering, direct navigation, lazy PDF thumbnails through a bounded public SDK API, text excerpts for text formats, and page cards for other formats.
- [x] **DONE** — Fixed original-file downloads for in-memory `ArrayBuffer` books by creating and cleaning up a per-reader object URL; retained URL-based downloads.
- [x] **DONE** — Destroy the Reader instance if its route unmounts while asynchronous opening is still pending.
- [x] **DONE** — Desktop Chrome visual review on the populated sample confirmed a 1247×617 Reader with React chrome, a properly sized PDF spread and real page thumbnails. The preview navigation completed its page-turn animation; the reading position was restored to page 2 / 50. Escape closed the Reader desk dialog without leaving the Reader route.
- [x] **DONE** — A 393×852 responsive Chrome review confirmed the Reader controls fit and the full-screen preview dialog keeps its footer inside the viewport while the grid scrolls; the temporary browser viewport override was reset afterward.
- [x] **DONE** — Reviewed populated mobile Home, Shelf, Explore, Progress and Settings screens at 393×852; checked routes had no horizontal overflow. Added route scroll reset so Settings detail opens at the top after navigating from a long scrolled Settings page; manually confirmed scroll returned from about 741 px to 0.
- [x] **DONE** — Verified the original-download action generated the local sample PDF (1,129,926 bytes) in the browser Downloads folder.
- [x] **DONE** — `npm run build` passed after these changes. Vite reports the existing optional app chunk size advisory (>500 KB).
- [x] **DONE** — The focused SDK TypeScript pass passed at this checkpoint; its remaining 59 UI-project diagnostics were later resolved and the full `tsconfig.ui.json` check now passes under Section 23.
- [x] **DONE** — Reworked the 3D shelf into an open, cardless floating wall-shelf scene with discreet supports. A single row uses one board; a second board appears when needed. Covers remain front-facing, with a light page block and soft cast shadows to show book depth. The locally saved sample's cover art was visually confirmed on the shelf.
- [x] **DONE** — Reviewed the current floating-shelf composition and camera at 320, 375, 414, 768 and 1440 px. At 768 px the desktop sidebar and shelf content remain in separate columns; the mobile dock does not cover the board.
- [ ] **NOT TESTED** — Several real covers on both shelf rows, all shelf finishes, order changes, reduced-motion/WebGL failure fallback and full keyboard/screen-reader behavior remain open.
- [ ] **NOT TESTED** — Automated suites, other document formats, screen readers, Firefox/WebKit and physical devices remain open; the broader parity gaps remain listed in [app-feature-parity-audit.md](app-feature-parity-audit.md).

## 23. Responsive sweep and retired screen cleanup (2026-10-20)

- [x] **DONE** — Removed the retired DOM-built library screen modules: `advanced`, `collections`, `home-atmosphere`, `home-world`, `home-widgets`, `library-experience`, `library`, `personal`, `prayer-times`, `reading-desk`, `reading-progress`, and `weather`. The matching generated bundles are cleaned during build.
- [x] **DONE** — Removed the old `/mobile` Astro route and generated mobile app shell. The React app is the installed-library entry at `/app`; existing storage, provider, parser, and Reader SDK code stays as the active service/data layer.
- [x] **DONE** — Routed PWA file/share intake to React workspace import so it no longer mounts or imports the retired DOM screen.
- [x] **DONE** — Fixed the public mobile navigation at 320 px, where flex/grid sizing collapsed the logo below 1 px, and at 414 px, where brand text could meet the control row. The header now uses a two-row layout through 480 px.
- [x] **DONE** — Manually measured the public page at 320, 375, 393, 414, 430, 480, 481, 768, 1024, 1280 and 1440 CSS px. The logo retains its square aspect ratio, the document width matches the content viewport, and no image with `object-fit: fill` is visibly stretched.
- [x] **DONE** — Measured Home, Shelf, Explore, Progress, Settings and four settings detail routes at 320, 375, 414, 768, 1024, 1280 and 1440 CSS px. The checked routes stayed within the content viewport and image ratios remained intact.
- [x] **DONE** — Visually checked the populated floating shelf at 320, 375, 414, 768 and 1440 px. Its single row uses an open board, the cover art faces forward with visible depth, and the mobile dock stays clear of the shelf.
- [x] **DONE** — `npm run build` passed after the final public header fix. Retired library bundles and the old mobile output are absent. Vite still emits the existing >500 KB advisory for the optional Three.js shelf chunk.
- [x] **DONE** — `npx tsc --noEmit -p tsconfig.ui.json` now passes with no diagnostics, including the active backup, provider, format, OPDS and storage modules.
- [ ] **PARTIAL** — The app-route, PWA, incoming-file and appearance regression specs now use `/app` and current React selectors, and `/mobile` is asserted absent. The rest of the Playwright files still include pre-React DOM selectors; no automated suite was run in this pass. Browser/device parity remains limited to the manual Chrome checks recorded above.
- [ ] **NOT TESTED** — Destructive and network-dependent flows, offline installation, all themes and multi-row shelves, assistive technology, Firefox/WebKit, and physical devices remain open; see [app-feature-parity-audit.md](app-feature-parity-audit.md).

## 24. Post-checkpoint runtime and control cleanup (2026-10-20)

- [x] **DONE** — The PWA update guard now recognizes the React Reader route, active imports and open app dialogs. It excludes its own update notice so the confirmation button remains usable.
- [x] **DONE** — The topbar light/dark action updates `appearance` independently from the selected paper `theme`; a regression spec records that contract.
- [x] **DONE** — Refreshed the generated app/PWA assets with `npm run build`; the build passed. Vite still reports the optional >500 KB shelf chunk advisory.
- [ ] **NOT TESTED** — The updated Playwright specs and PWA install/offline behavior have not been executed. The remaining pre-React selector migration and non-Chromium/device checks remain open.

## 25. Cross-engine UAT follow-up (2026-10-21)

- [x] **DONE** — `npm run build` passed after the Reader, text-selection and app updates. The optional Three.js shelf-room bundle continues to trigger the existing >500 KB advisory.
- [x] **DONE** — `npm run typecheck` passed; `npm test` passed 92/92 unit tests.
- [x] **DONE** — The complete 450-case Playwright run executed across Chromium, Firefox and WebKit: 439 passed, 8 skipped and 3 failed. The full run is recorded as mixed rather than green.
- [x] **DONE** — Each of the three combined-run failures passed in an isolated rerun on its original engine: Firefox backup/export lock; WebKit paper-theme dropdown; WebKit Home sample button. No code workaround was added solely to hide the combined-run timeouts.
- [x] **DONE** — Full project suites then ran in fresh per-engine processes: Chromium 150/150 passed; Firefox 146 passed/4 skipped; WebKit 146 passed/4 skipped; zero per-engine failures.
- [x] **DONE** — Reader quote regression passed in Chromium, Firefox and WebKit. It verifies selectable `/app` text, light-DOM reading-position capture/restore, scoped heading selectors, and saving the selected passage as a local note.
- [x] **DONE** — Firefox Reader startup passes when native `ResizeObserver` is absent through conditional polyfill loading. Reader text position and archive navigation helpers accept both Shadow DOM and light DOM.
- [x] **DONE** — Prayer city setup works with Weather disabled; the prayer widget requests times only after the user asks. The city flow passed in the three-engine run, with a separate Chromium targeted pass.
- [x] **DONE** — Cover-led Discover detail, responsive layouts, topbar appearance independent from paper color, and the Light/Dark/OLED palette matrix were exercised by the three-engine suite. The combined-run WebKit theme-control timeout passed when rerun alone.
- [ ] **PARTIAL** — The aggregate three-engine command reported 3 timeouts although each browser's complete fresh-process suite passed. The cause has not been established; keep both results visible rather than assuming the combined-run failures are harmless.
- [ ] **NOT TESTED** — Physical iOS/Android devices, screen-reader and other assistive-technology behavior, genuine installed-PWA launch/offline behavior, and exhaustive multi-book shelf reorder/camera behavior remain outside this run.
- [x] **DONE** — Work stayed local; nothing was pushed or deployed.
