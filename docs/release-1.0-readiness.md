# Sela 1.0 release readiness

**Initial review:** 19 October 2026  
**Latest update:** 21 October 2026  
**Current package version:** 0.9.0-beta.8  
**Release state:** Not ready to publish as 1.0 yet. Religious-content sign-off, physical-device and assistive-technology review, and broader format/source validation still need evidence.

**Latest verification:** Recovery fix merged to `main` as `240aaba9072e653a50cbd6e55ee783a0440a2683`. CI run [39624764621](https://github.com/bobbyfch/sela/actions/runs/39624764621) passed all 12 jobs; Pages run [39625890669](https://github.com/bobbyfch/sela/actions/runs/39625890669) deployed the commit. Live smoke checks opened the project home, `/app/`, and the 50-page sample PDF. This verifies the deployed route and sample flow, not every physical device or release gate.

## Product and stack decision

Sela already uses TypeScript for its maintained application, viewer, API, workers, and build scripts. Astro is already in the toolchain and produces the public pages. The generated JavaScript in `dist/` is part of the browser/CDN package: CI3, Laravel, Bootstrap, Vue, React, and plain HTML sites consume JavaScript bundles, so generated `.js` files are required outputs rather than leftover Flippy source.

Keep Astro for public, documentation, and other static routes. Keep the document viewer as a small framework-independent TypeScript package, with the app experience using React, Tailwind CSS 4, and Radix primitives through the local shadcn component source. A wholesale Astro rewrite would not remove the need for a browser-side reader, and would add migration risk without a user-facing gain. Astro 7.4 is current on this review date; its build-timing flag is a good next tool for identifying slow GitHub Pages deployments.

Radix fits the app shell because it provides accessible, unstyled React primitives that work with Tailwind. Keep viewer-critical controls native and framework-independent so the CDN embeds stay easy to install. Use utility classes for the main style layer, and reserve small custom utilities for reader-engine integration, page rendering, and effects that cannot be expressed cleanly as standard utilities.

## Work completed in this pass

- Refreshed the app mark, installed-app icons, and outline navigation icons; replaced retired character illustrations with original transparent 3D companion art and an animal atlas.
- Consolidated the palette list to eight visually distinct themes and updated settings into navigable, full-page categories with a back action. OLED remains a dedicated black-background option for dark appearance.
- Added `docs/design-system.md` and aligned the public page, app shell, and viewer styling with shared component and responsive rules.

- Added a visible, responsive add-books surface on the Sela shelf, alongside existing drag-and-drop and keyboard-accessible native file input flows.
- Reworked viewer audiobook and room atmosphere into separate visible cards. Audiobook selection remains local; EPUB Media Overlay narration uses embedded book assets. Rain, wind, stream, and wave ambience are generated in the browser with Web Audio, pause when the tab is hidden, and make no third-party audio requests.
- Replaced reading-mode and page-fit dropdowns with labeled choice cards. Replaced the collapsed reading-profile manager with a visible grid and inline save/update/delete controls.
- Added a reader setting to follow the app’s light/dark appearance, enabled by default and shared between the app and reader.
- Changed HTML/EPUB text pages to use the light reading surface instead of the surrounding gray canvas.
- Simplified viewer attribution to “Sela Books · © [current year]”.
- Reduced the active palette picker to eight distinct Indonesian-named palettes: Sela, Rimba, Sakura, Samudra, Lembayung, Kenanga, Senja, and Arunika. Legacy saved names continue to map to these current palettes.
- Added controls for showing or hiding five Home sections: continue reading, starter books, reflection, reading queue, and daily widgets. The selection persists on the device.
- Added a local reading-time tracker with daily totals, 7-day/30-day views, streak and peak-day summaries, plus a Home widget. Reading time is recorded only while a book is open in a visible tab.
- Added an optional Islamic prayer-time card. It sends saved weather coordinates to AlAdhan only after the user taps the request button, uses the KEMENAG RI calculation method, and labels results as estimates to confirm locally.
- Added local Orama-powered search with Indonesian intent expansion and stemming; book metadata stays in the browser.
- Added the fifth app area, Progress, and refreshed shelf details and explicit-selection interactions, centralized palette-aware default covers, and shelf material controls.
- Redrew the book launcher mark, favicon, 192/512 px PWA icons, Android maskable icon, and 180 px Apple touch icon. Updated manifest theme color and offline cache lists.
- Regenerated the public desktop/mobile product captures and social preview from the current app so they no longer show the retired book mark or install button.
- Re-audited the public page, all five app tabs, and viewer in 42 browser screenshots across 320, 393, 820, 1024, 1440, and 1920 px; found no page errors, horizontal overflow, or footer/bottom-navigation overlap.
- Added a public setup selector for a pinned CDN release or unversioned jsDelivr URL. The page recommends pinned releases and warns that latest can change without notice.
- Replaced the retired scene art with the transparent 3D chibi reader and companion atlas; lightweight daypart, weather, appearance, and palette-motif layers remain optional scene details.
- Kept the Home illustration responsive when WebGL is unavailable: the artwork-only fallback now continues to update daypart and weather filters, and the desktop prayer card has slightly tighter vertical spacing.
- Added Quran topic cards for eight everyday-life starting points and retained verse/surah references. The complete cited surah opens in the reader. These cards are not a complete topic index or religious ruling.
- Expanded the Islamic reading rail to 25 distinct prophet references with selected surah and verse anchors. The rail is explicitly a Quran passage index, not a set of complete biographies or a dated chronology; figures with brief Quran mentions are marked.
- Confirmed each Quran surah header uses a surah-specific generated scene background.

## User-request audit

| Area | Current status | Evidence or remaining gate |
| --- | --- | --- |
| App identity icons | The source uses the Sela story-mage artwork across the site, app, favicon, PWA, and platform install icons. PWA icon URLs use individual PNG content hashes, and manifest URLs use a combined icon-set hash, so artwork refreshes invalidate browser-installed icon caches without changing the beta version. | Unit coverage verifies generated manifest and icon URLs against the actual PNG hashes. Pages run `39083315383` deployed the hashed URLs; live app, manifest, three PWA icons, and Apple touch icon all return 200 with correct PNG types and bytes matching local assets. GitHub Pages currently returns `max-age=600`; a physical-device launcher refresh still needs a real-device check. |
| File pickers | Improved in the shelf and audiobook surfaces; the public playground already exposes a drop area, selection name, and clear action. | Include picker error, canceled-selection, keyboard, drag/drop, and unsupported-format checks in release smoke testing. |
| Audio and room atmosphere | Split into separate cards, with local upload, EPUB narration, sleep timer, and four generated room sounds. | No hosted music library is bundled. A future provider requires explicit rights, attribution, privacy, availability, and offline review. |
| Viewer settings | Reading mode, fit, and profiles use visible choice grids. | Filters and some format-specific controls remain selects because the option list is longer; verify those controls at 320–1440 px. |
| Viewer navigation/actions | The browser suite exercises page navigation, bookmarks, contents, search, page previews, sharing, settings, Escape/back flows, visible controls, and dead-fragment-link checks. | The carousel test checks its actual viewport before advancing and passes 6/6 repeated local runs across Chromium, Firefox, and WebKit. CI run `39082801499` passes the checks job, Chromium, Firefox, all eight WebKit shards, and a separate network-mocked Quran navigation smoke. The earlier run `39080723187` exposed stale manifest expectations, a WebKit canvas visibility assumption, and runner shutdown during the lengthy full Quran settings sequence; those issues are corrected. |
| Light text-page surface | HTML and EPUB chapter backgrounds now use the reading panel token. | Reader light-surface and long-text checks pass locally in Chromium, Firefox, and WebKit. |
| Responsive layouts | Public page, five app tabs, and viewer were visually rechecked in 42 Chromium viewport captures at 320, 393, 820, 1024, 1440, and 1920 px; no page errors, horizontal overflow, or footer/navigation overlap were found. Home artwork is preloaded before its lazy scene module; cold-cache Home and live sample-PDF reader smoke checks pass from 320 through 1440 px. | Physical-device and assistive-technology review remain release gates; automated browser coverage cannot replace those checks. |
| Viewer credit | Shows Sela Books and the current copyright year, linked to the Sela repository. | No personal name is displayed in this reader credit. |
| Palettes | Eight palettes now share one name/color/motif catalog across the app, reader chrome, quote cards, and swatches; each accent passes 4.5:1 with white text. Chromium exercises every palette in light/dark at phone, tablet, and desktop widths. | Physical-device and assistive-technology review remain release gates. |
| Long buttons/icons | Reader controls are primarily icon buttons with accessible names; profile and ambience choices stay labeled. | Do not remove visible text from controls where the icon alone would be ambiguous. |
| App theme sync | Reader follows app appearance by default; users can turn sync off in viewer settings. | Verify embedded viewers and app reader independently. |
| Liquid glass | Used as a restrained translucent surface on the new audio and ambience cards. | Keep text contrast and focus indicators independent of backdrop blur; glass is decorative and should remain optional under reduced effects. |
| Quran life topics | Eight cited starting points are now grouped under everyday-life themes. | An exhaustive, reviewed topic index needs a qualified editor and references for scope and context. |
| Translation/transliteration | QuranEnc translations preserve source edition/version and Arabic text. Indonesian official Kemenag links provide Latin reading and tafsir references; the linked tajwid guide covers Juz Amma only. | QuranEnc’s documented translation endpoint does not return transliteration. Do not create Latin text with machine translation or inferred transliteration. Select and validate an authoritative licensed source before embedding transliteration for all 114 surahs. |
| Prophet stories/timeline | The rail contains 25 distinct Quran passage references and opens the cited surah at the selected verse; the LPMQ Kemenag study on prophets before Ibrahim is linked with its scope named. | The rail is not a full storybook or dated chronology. Some prophets have only brief Quran mentions. Do not invent dates/order where sources do not establish them. A reviewed set of full narratives and any historical timeline remain a 1.0 content gate. |
| Host integrations | Runtime smoke tests mounted/opened/closed the viewer in Next.js, Nuxt, Svelte, Angular, CodeIgniter 3, CodeIgniter 4, and Laravel. | PHP 8.1 was used for CI3; PHP 8.5 was selected for CI4/Laravel to satisfy the installed host projects’ runtime requirements. |
| System notifications | Not implemented. | Sela has no push-sending backend or dependable cross-browser daily scheduler. Keep reminders off until a user-controlled delivery design, permission flow, and delivery service are built and reviewed. |
| Limaraya member portraits | The page now identifies the five members as fictional characters and lists their names and roles. It does not attach unrelated real artist photography to those characters. | Original individual character portraits are still a separate art task if wanted. |
| Clone deterrence / watermark | The site has normal creator attribution and metadata; no hidden watermark or anti-copy mechanism is claimed. | Public static pages can be copied; attribution helps identify origin but cannot prevent copying. |
| Free eBooks | Sela Picks currently lists 227 curated classic catalog records; readable text is fetched from pinned GITenberg revisions only when opened, and copyright status depends on location. | At the 18 October direct-link check, all 8 then-configured Gutenberg/GITenberg text URLs returned HTTP 200 as non-HTML `text/plain` with a matching title marker. Dynamic catalog results vary by source, region, availability and rights; not every record is a downloadable edition. |
| Smart search | Orama 3.1.18 and Indonesian/English stemmers are bundled into a 73 KB lazy-loaded browser module (24.5 KB gzip), included in the offline app shell. Indonesian intent expansion stays on-device. | Run a physical-device performance check on a large library; search remains local and does not promise semantic recommendations from remote catalogs. |
| CDN “latest” option | Public setup playground generates both pinned and unversioned jsDelivr snippets; both were checked in Chromium. The version shown is 0.9.0-beta.8. | Pin a release for production. jsDelivr advises against unversioned production URLs because their contents can change without notice. |
| Home customization | Five Home sections have visible toggles and persist in local storage. | The current user choice is section visibility, not arbitrary drag-and-drop layout. Validate first-run, empty-shelf, returning-reader, and language-switch states. |
| Astro migration | Astro is already used for the public site. | No framework migration is recommended. Measure actual build stages before considering structural changes. |
| Prayer times | Optional estimates use AlAdhan’s KEMENAG RI method and are requested only after an explicit tap. A Jakarta sample request returned HTTP 200 with Asia/Jakarta timings on 17 October 2026; browser checks rendered five prayer times without console errors at 320, 768, and 1440 px. | The new 503/error-and-retry regression passes in Chromium, Firefox, and WebKit. Calculated times can differ from local mosque schedules; users should confirm locally. |
| arboTTS | Reviewed the upstream project and its browser/WASM demo. | Not integrated: model/runtime downloads need a measured lazy-load design, per-voice licensing/attribution review, and mobile memory checks. Built-in speech options remain available. |
| Release feature gaps | See the release gates below. | Religious content completeness, physical-device PWA icon refresh, and assistive-technology review remain unresolved release risks. Live Home artwork and sample-PDF reader smoke checks are complete. |

## Faith content policy for release

The in-app Quran reader currently uses source-published translations from QuranEnc, records the selected edition and version, displays source footnotes, and preserves the translation text. QuranEnc’s published API terms prohibit modifying, adding to, or deleting text when republishing it and require attribution, version information, transcript information, and updates. Keep every source edition as a distinct selectable edition.

The Kemenag Quran reference includes Arabic, Indonesian translation, Latin reading, and tafsir. Its public API page asks developers to submit a formal access request to LPMQ; the app therefore keeps its current QuranEnc translation integration and links users to the official Kemenag verse page for Latin reading and tafsir instead of scraping or copying an unapproved feed. Its official color-tajwid guide linked from Sela is specifically for Juz Amma; do not imply it covers the full Quran. For other languages, keep the selected publisher’s edition and make its provenance explicit. Do not send Quran text through a general machine-translation widget or silently replace an edition.

The current prophet rail is a cited reading aid, not a complete account or verified historical chronology. LPMQ’s official study linked from the app specifically covers prophets before Ibrahim. Until a qualified source set and content rights are confirmed, do not synthesize missing events, dates, or historical ordering. The same source-and-edition rule applies to Christian, Catholic, Confucian, and other religious content; where API credentials or reuse rights are unavailable, link to the original publisher instead of substituting text.

## 1.0 release gates

1. **Build and functional checks:** The latest required CI run, `39624764621`, passed all 12 jobs on the recovery merge commit, including build/generated-artifact checks, unit and type checks, Chromium, Firefox, all eight WebKit shards, and the real service-worker update/offline-reading regression. The optional `npm run test:frameworks` matrix was not part of this recovery workflow; earlier successful framework-host checks are recorded in the dated history above.
2. **Responsive and accessibility review:** 320 px reflow, keyboard-only navigation, visible focus, accessible icon names, 24 CSS px minimum targets or adequate spacing, contrast checks, reduced motion, and no horizontal overflow on representative screens.
3. **Supported-format matrix:** PDF, EPUB, text/HTML, comic archive, DJVU, DOCX/ODT, malformed files, large files, password-protected inputs, backup/restore, and offline reopen.
4. **Book catalogue review:** verify each fixed direct link and test at least one successful read/save flow per source; show country and rights caveats for dynamic/free API results.
5. **Faith content sign-off:** edition provenance, reuse terms, versioning/update process, Indonesian Latin source coverage, tajwid scope, topic references, prophet narrative references, and an explicit decision about the unsourced/contested chronology gaps.
6. **Deployment review:** Pages run `39625890669` successfully deployed merge commit `240aaba9072e653a50cbd6e55ee783a0440a2683` without a second build. A live check opened the public homepage, `/app/`, and the sample PDF through page 50. The route and sample flow are verified; physical-device install/icon behavior and assistive-technology review remain 1.0 gates.

## Competitive feature gaps and order

Current reader products set useful expectations around device sync, annotation portability, screen-reader support, OPDS/library access, and voice reading. BookFusion documents cross-device reading-position/highlight sync and smart shelves; Thorium documents text controls, keyboard navigation, read-aloud, and major screen-reader support; calibre-web documents searchable, tagged libraries and browser reading. Sela already offers local/offline reading, several catalog sources, reading-position storage, notes/bookmarks, backup/restore, and read-aloud. The gaps below are a product roadmap, not a recommendation to add every cloud feature.

**Before 1.0:** close the release gates above; add reproducible deployed-site smoke checks; finish the full mobile/tablet/desktop and theme audit; and resolve the religious-content source, reuse, transliteration, and narrative-timeline scope with a qualified source review.

**Next, after 1.0:**

1. Export book highlights, notes, and bookmarks in a portable format, with source-location metadata preserved where the format permits it.
2. Offer opt-in, user-controlled cross-device sync (for example, a user’s own WebDAV/OPDS storage) only after conflict handling, encryption, recovery, and deletion behavior are designed and reviewed. Keep account-free local reading intact.
3. Add saved searches and smart shelves using the existing local metadata/tags so large libraries remain easy to browse.
4. Improve source and edition management for public catalogs: show last-checked status, direct download/open affordances, region-specific rights caveats, and fallback sources.
5. Continue assistive-technology validation with screen readers and switch controls; automated contrast/overflow tests do not replace those checks.

Avoid adding a cloud account requirement, public social feed, or automatic machine-translated sacred text merely to match a feature checklist. Those choices change Sela’s privacy and content promises and need explicit product decisions.

## Research references

- [Tailwind responsive design](https://tailwindcss.com/docs/responsive-design) — mobile-first breakpoints and container queries.
- [W3C WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — content reflow at a 320 CSS px viewport.
- [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) — keyboard navigation, focus management, labeling, and contrast responsibilities.
- [Orama JavaScript documentation](https://docs.orama.com/docs/orama-js) — local full-text search, supported search options, and stemming integration.
- [Orama search API](https://docs.orama.com/docs/orama-js/search) — query and result behavior used by the local bookshelf index.
- [Astro 7.4 release notes](https://astro.build/blog/astro-740/) — current release and `astro build --timings`.
- [Playwright CI guidance](https://playwright.dev/docs/ci) — one worker per CI runner for stability and job sharding for larger suites; it notes that caching browser binaries often does not reduce install time.
- [GitHub Actions dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching) — setup-node npm cache and cache-versus-artifact use.
- [Google Books API filtering](https://developers.google.com/books/docs/v1/using) and [volume access fields](https://developers.google.com/books/docs/v1/reference/volumes) — retained as reference material for regional rights checks; Google Books is not an active source.
- [QuranEnc API and reuse terms](https://quranenc.com/en/home/api/) — translation endpoints, attribution, version, transcript, and no-modification requirements.
- [Qur’an Kemenag API](https://quran-api.lpmqkemenag.id/) — the official landing page requests a formal access application to LPMQ.
- [Kemenag Juz Amma tajwid/Latin guide](https://quran.kemenag.go.id/assets/files/Juz-Amma-Metode-Tilawah.pdf) — scope and official study material.
- [LPMQ Kemenag prophet study](https://pustakalajnah.kemenag.go.id/detail/35) — official source covering prophets before Ibrahim.
- [AlAdhan prayer-times API](https://aladhan.com/prayer-times-api) — method 20 is KEMENAG RI and calculated timings may differ from local authorities.
- [jsDelivr GitHub CDN documentation](https://www.jsdelivr.com/?docs=gh) — unversioned URLs follow latest files and are not recommended for production.
- [arboTTS upstream repository](https://github.com/ARBO-TEAM/arboTTS) — source and license for the browser/WASM TTS project reviewed for possible integration.
- [BookFusion documentation](https://docs.bookfusion.com/docs/) — cross-device reading, highlights, smart shelves, and library integration examples.
- [Thorium Reader](https://www.thoriumreader.com/) — format support, reading controls, keyboard access, and screen-reader goals.
- [calibre-web](https://www.calibre-web.com/) — searchable/tagged self-hosted library and browser-reader reference.
