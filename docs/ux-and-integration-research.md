# Sela UX and integration research

**Reviewed:** 17 October 2026

**Scope:** local-first Reader app UI, integration fit, and current upstream documentation. This is a product and architecture review, not a complete accessibility, security, or cross-device certification.

## What was inspected

- The local `/app/` experience at 393 × 852 and 1440 × 960, plus Shelf, Explore, and Settings.
- Existing HTML import, OPDS profiles, reader host-extension contracts, annotation behavior, and optional home feeds.
- Upstream Readest, Foliate.js, Mozilla Readability, DOMPurify, Tesseract.js, Web Annotation, WCAG 2.2, and Web Share Target documentation.

The screenshots use the local app's current English setting and its empty personal shelf. No physical phone, account-backed catalog, or browser-extension package was tested.

## Findings from the UI review

### Fixed: Home feed text clipping and row overlap

The “On this day” feed can return a story without an image. Its CSS assumed the first child was always the cover, so it assigned the text column a 72-pixel width. The title's `block` class also overrode the display mode used by line clamping. Finally, four minimum-height rows could overflow the feed card and sit on top of the following widget.

The feed now gives image and text children explicit classes, lets line clamping control display, and sizes feed cards to their content. A local visual check confirmed the last row stays inside its card at both tested widths: 17 pixels clear on mobile and 19 pixels clear on desktop. Stories without an image use the full text width.

### Follow-up: make the Home screen reading-first and adjustable

The Home page is several phone screens long before its footer. The current page combines the reading timer, a sample book, reflection, calendar, history, hydration, and remote news; an enabled faith shelf adds another section. Each part is optional for many readers, but the page does not yet give users an obvious way to hide or reorder those modules.

Recommended direction: keep “Continue reading” and the personal shelf prominent, then let readers collapse, hide, and reorder the optional daily widgets. Preserve the existing ambience and default content as a simple preset rather than removing those features outright. Settings could use collapsible groups or a small “find a setting” control if the list keeps growing.

### Fixed: show available news while slower sources finish

On a cold local load, the “Around the world” widget was still showing skeletons after about two seconds. The auto source requests multiple providers and waited for every result before rendering. There was also a timeout mismatch: the UI passes its own `AbortController.signal`, and the request helper returned that signal directly instead of combining it with the helper's 10-second timeout. In this UI path, that meant the timeout was not enforced.

The helper now combines user cancellation with a 10-second deadline. In automatic source mode, each provider result is progressively merged and rendered while slower sources continue; completed requests are merged again at the end. A later browser check should exercise a fast source alongside a deliberately delayed source and verify the skeleton is replaced promptly. The widget still clears its list when manually refreshed, so a future polish could keep the previous stories visible during refresh.

### Fixed: tablet navigation covered Explore controls

At 768 pixels, the app's vertical navigation inherited the generic bottom bar's `right`, `bottom`, and `max-width` constraints. It stretched across the content column and intercepted clicks on the Explore source control. The redesign rail now resets those inherited constraints and stays within its grid column. The source sheet can be opened at 320, 393, 768, and 1280 pixels.

### Accessibility checkpoint

Use WCAG 2.2 as the next review checklist for pointer target spacing and keyboard focus under the fixed mobile navigation. WCAG 2.2 sets a 24 × 24 CSS-pixel minimum target-size criterion with exceptions and says focused controls must not be entirely hidden by author-created content. This quick visual review did not test every focus path or claim WCAG conformance.

## Integration and replacement options

### Tailwind, shadcn/ui, and component primitives

Sela already has Tailwind CSS 4.3 and React 19. Some app screens, including Home, are still composed with direct DOM helpers, while the mobile shell and reader have React surfaces. Tailwind is the styling engine; shadcn/ui is a React component source/CLI that adds editable components using Tailwind. Its current installation docs support Tailwind v4, and its July 2026 changelog says Base UI became its default primitive layer. This fits Sela's current Tailwind/React versions, but it does not convert existing DOM code into React or keep external links inside the app.

| Option | Fit for Sela | Recommendation |
| --- | --- | --- |
| shadcn/ui with Base UI | Current shadcn docs support Tailwind v4, and new projects have used Base UI by default since July 2026. It offers editable React component source plus accessible behavior for dialog, drawer, menu, popover, and select. | Use it for the ongoing React migration. Keep Sela's theme tokens and visual design; move the existing DOM-built sheets one at a time through a compatibility layer. |
| Radix Primitives | Headless React primitives with WAI-ARIA patterns, keyboard support, focus handling, and portal utilities. | Good alternative if an existing component already uses Radix. Avoid mixing primitive families without a concrete benefit. |
| Base UI directly | Unstyled React components designed to work with Tailwind or other CSS, with keyboard and focus handling documented. | Strongest behavioral layer for Sela if the visual components remain custom; it can be adopted without shadcn's preset visual language. |
| Full app rewrite to shadcn | Would require converting many `app/library/*.ts` DOM-built views and maintaining React and DOM integration during the migration. | User has now explicitly requested this migration. Do it progressively by screen, starting with React-compatible overlays and repeated controls while retaining working routes and data behavior. |

If “keluar-keluar” means controls or menus spilling outside the screen, anchored popovers should use a primitive with collision-aware positioning, and dialogs/sheets should use portals, focus management, and responsive max-height. A primitive reduces repeated interaction bugs but still needs visual checks at mobile and desktop sizes.

If it means leaving Sela when opening a story, component libraries do not decide link destinations. Home feed items currently use `target="_blank"`, which intentionally opens the publisher in a browser tab. A safe in-app reading flow could add a preview/details sheet and keep an explicit “Open original source” link. Reading arbitrary third-party pages inside an iframe is not reliable because many sites block framing; browser scripts also cannot read arbitrary cross-origin pages without the site's CORS permission. Preserve clear source attribution and an explicit way to visit the publisher.

The user-facing theme and component choices should remain local to Sela. Adding shadcn does not require a hosted service, remote plugin, or external runtime. The upstream docs describe components copied/generated into the app, though package dependencies may still be installed for their behavior.

| Option | Fit for Sela | Recommendation |
| --- | --- | --- |
| Mozilla Readability + DOMPurify | Extracts the readable article and metadata from the active page. Sela already accepts HTML documents. Readability explicitly recommends sanitizing its output because it does not make that output safe itself. | Best new feature candidate: a small, optional browser clipper that runs only after a user action, sanitizes the article, and hands a local `.html` file to Sela. Avoid a server account or broad host access. |
| Readest | Strong feature and interaction reference: clipping, search, annotations, OPDS/Calibre, TTS, and accessibility are documented. It is built on Next.js/Tauri and its repository is AGPL-3.0. | Study its user flows; do not wholesale replace Sela's reader or copy its application code into this MIT project without a licensing review. Its extension and inbox architecture is larger than Sela needs for a local clipper. |
| Foliate.js | MIT-licensed, modular browser book engine with EPUB CFI and several additional formats. Its own README says the API is unstable, it has no release, and its PDF adapter is experimental. | No replacement now. A contained EPUB adapter experiment would need to prove compatibility with Sela's navigation, notes, reading positions, and shared Viewer before any migration decision. |
| Tesseract.js | Browser/WebAssembly OCR with workers and more than 100 language packs. It does not read PDF files directly; scanned pages must first be rendered to images, for example through the PDF.js already in Sela. Its normal setup may fetch worker/core/language assets from a CDN. | Add only as a lazy, user-invoked scan tool if scanned PDFs are a real use case. Bundle the worker and chosen language data locally for offline use, and OCR the current page or a selected range rather than the whole book by default. |
| W3C Web Annotation Data Model | Standard JSON model with text quote selectors (`exact`, `prefix`, `suffix`) and position selectors for sharing annotations across systems. | A good later export/import format for notes and highlights; it does not require adopting an annotation service or changing local storage first. |
| More OPDS services | Sela already supports OPDS 1 Atom and OPDS 2 JSON, including compatible Calibre-Web, Kavita, and Komga profiles. | Keep the current adapter. Add a specific service only when a real compatibility gap appears; remote profiles still depend on HTTPS, CORS, and each server's auth setup. |

### Browser clipper shape

An ordinary web page cannot reliably fetch and read arbitrary cross-origin pages because of browser origin restrictions. A browser extension can process the active tab after the user clicks its button. The compact flow is:

1. Run Readability against a clone of the active page document.
2. Sanitize the extracted HTML with DOMPurify and retain title, byline, source URL, language, and capture date.
3. Save a portable `.html` file, then import it through Sela's existing local-file path.

The PWA Web Share Target API is another route for URLs or files shared by the operating system, but it works only after the PWA is installed and shared input must be validated. A shared URL alone is not the article body; the app would still need the extension or a permitted fetch path to extract it.

## UI migration status and next steps

The local migration uses Tailwind CSS 4, shadcn/ui's `base-nova` style, and Base UI primitives. The setup includes reusable Button, Dialog, NativeSelect, and Popover components. The PWA navigation and static Reader controls use Button; the public page's theme controls, demo controls, story card, and reading-mode cards use the same component while preserving the IDs and `data-*` hooks used by existing scripts. Popovers default to flip/shift collision handling with 12-pixel viewport padding; Dialog content has a viewport-based maximum height and internal scrolling.

NativeSelect shares the Tailwind field styling while still rendering a real `<select>`. The bookshelf controllers mutate its options, listen to its native `change` event, and move it into a filter sheet, so replacing those controls with a custom popup before bridging those contracts would break behavior. Base UI recommends an accessible label for every Select and a Combobox rather than a non-filterable Select when the option list needs search; use its positioned popup for React-owned controls where that behavior is needed.

The shared `bottomSheet()` boundary now announces sheet lifecycle events to a React `ControlSheetHost`, which supplies Base UI's controlled Dialog root, portal, and backdrop. The existing HTML dialog and DOM-built contents stay in place so library controllers can keep querying their selectors and controls; the dialog moves into the Base UI popup while open and remains queryable in the document while closed. Escape dismissal and focus return passed the browser checks. This is a compatibility bridge for modal behavior, not a migration of sheet contents into React.

On 17 October 2026, TypeScript checks and the production build passed. The combined Chromium regression run across material controls, discovery, Explore layout, Home widgets, reading desk, library refinement, shelf selection, product pages, and reader stability passed 53/53 tests. This does not certify Firefox, WebKit, or physical-device behavior.

The rest of the bookshelf still builds many screens and sheet contents directly through `app/library/*.ts` DOM helpers. These remain the main migration work. Move one surface at a time into reusable React components while keeping selectors, events, local data behavior, and reader contracts stable; then consolidate legacy CSS after responsive and theme checks.

Recommended order:

1. Migrate the source/settings sheet contents and theme/language controls into reusable React components; keep the compatibility bridge until each consumer is moved and checked for keyboard behavior, focus return, and dark mode.
2. Convert repeated Home, Shelf, Explore, and Settings controls into shared components while preserving current storage and reader contracts.
3. Consolidate legacy utility CSS after each screen passes responsive and theme checks.
4. Add an optional local article clipper with Readability and DOMPurify only if it fits the core reading workflow.
5. Add Web Annotation import/export for portable notes; consider local OCR only if scanned pages are a common use case.

Keep the shared Viewer and existing offline library path. Add one optional adapter at a time; do not introduce a general-purpose plugin marketplace for the first integration.

## Sources checked on 17 October 2026

- [Readest README and license](https://github.com/readest/readest/blob/main/README.md) · [Readest architecture](https://github.com/readest/readest/blob/main/apps/readest-app/docs/architecture.md)
- [Foliate.js README](https://github.com/johnfactotum/foliate-js/blob/main/README.md)
- [Mozilla Readability README](https://github.com/mozilla/readability/blob/main/README.md)
- [DOMPurify README](https://github.com/cure53/DOMPurify/blob/main/README.md) · [DOMPurify licenses](https://github.com/cure53/DOMPurify)
- [Tesseract.js FAQ](https://github.com/naptha/tesseract.js/blob/master/docs/faq.md) · [Tesseract.js local installation](https://github.com/naptha/tesseract.js/blob/master/docs/local-installation.md)
- [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) · [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [MDN Web Share Target](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target)
- [shadcn/ui installation](https://ui.shadcn.com/docs/installation) · [shadcn/ui changelog](https://ui.shadcn.com/docs/changelog) · [Base UI overview](https://base-ui.com/react/overview/about) · [Base UI accessibility](https://base-ui.com/react/overview/accessibility) · [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [shadcn/ui Base UI as the default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default) · [Base UI popover positioning and collision handling](https://base-ui.com/react/components/popover) · [Base UI Select accessibility and usage guidance](https://base-ui.com/react/components/select)
- [MDN same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy) · [MDN anchor behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a)
- In-repository behavior: [reading experience](reading-experience.md), [host extensions](host-extensions.md), and [library sources](library-sources.md).
