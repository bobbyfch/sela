# Sela Books visual reset: research and decisions

**Reviewed:** 2026-10-19  
**Scope:** public product page, installed app brand, home artwork, and navigation materials.  
**Design method:** Hallmark page rebuild plus one original ImageGen still-life asset.

## Research findings

| Reference | Useful observation | Application to Sela |
| --- | --- | --- |
| Apple Human Interface Guidelines: Materials | Liquid Glass belongs to functional navigation and controls layered above content. Use it sparingly, and preserve legibility as content moves beneath it. | Glass on the sticky site header, app navigation, and compact control surfaces. Keep book pages, covers, and editorial sections matte. |
| Apple Books library guidance | A reading library benefits from familiar collection, sorting, and grid/list organization. | Keep the public page's path to the personal library direct; make the app's book collection the product focus. |
| BOOX Go 10.3 | A monochrome ePaper device pairs black and white with paper-like texture and a restrained reading interface. | Use warm paper, ink, linen, graphite, and quiet monochrome book photography rather than colorful decorative illustration. |
| Readwise Reader long-form guide | Long-form reading benefits from a dedicated, uncluttered reading layout and natural page movement. | Keep the reader's page content visually separate from app chrome and avoid glass overlays on book pages. |
| WCAG 2.2 and browser accessibility guidance | Keyboard focus, contrast, touch targets, and reduced motion preferences are part of the interface, not finish work. | Retain visible focus, labelled controls, usable touch targets, and reduced-motion/transparency fallbacks. |

## Design decisions

- Reset the previous card-heavy public composition into five steps: navigation, editorial hero, two product routes, a sample/file workbench, and the Viewer setup flow.
- Use an original photorealistic book still life as the only branded hero art. Remove visible mascot choices and use a static matte image on the app home.
- Redraw the open-book mark in charcoal and paper tones, and regenerate the PWA launcher icons from that mark.
- Apply warm monochrome tokens in light and dark themes. Preserve stored palette keys while changing their displayed labels and values to neutral paper tints.
- Treat Liquid Glass as a web approximation of Apple's native layer: CSS translucency, blur, a fine border, restrained shadow, and an inner highlight for navigation and controls only.
- Keep functionality tied to existing hooks: sample open, local file selection, Reader modes and settings, theme/language controls, PWA installation guidance, and live Viewer configuration.
- No additional runtime dependency or external plugin is required. The existing `sharp` development dependency prepares app icons and screenshot assets.

## Sources

- [Apple Human Interface Guidelines — Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple — Liquid Glass overview](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass?changes=_3__6)
- [Apple — Organize books in the Books app](https://support.apple.com/guide/iphone/organize-books-iphab219b91/ios)
- [BOOX Go 10.3](https://shop.boox.com/products/go103)
- [Readwise Reader — Long-form reading](https://docs.readwise.io/reader/guides/workflows/longform-reading)
- [Apple WWDC — Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [MDN — Using media queries for accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility)

## Validation record

- **PASS** — `npm run build` completed after the final copy and public screenshot updates.
- **PASS** — Product screenshots were regenerated from the local build, including the 1440 × 900 public hero preview at `site/screenshots/public-home-desktop.png`, the full public page, and app home captures.
- **PASS** — Fresh local Chromium review covered the public page in light/dark themes and the installed app home in light theme at desktop and 393 × 852 mobile, plus dark theme at desktop.
- **PASS** — Public layout widths 320, 375, 393, 414, 768, 1024, 1120, 1280 and 1440 CSS px showed no horizontal overflow in the responsive audit.
- **NOT TESTED** — Unit/browser suites were not rerun after this visual reset. Screen readers, Firefox/WebKit, physical devices, PWA installation/offline behavior, Lighthouse and field Core Web Vitals were not measured.
- The implementation uses CSS materials on the web. It does not make the website a native iOS app or use Apple's private system rendering APIs.
