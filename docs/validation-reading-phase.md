# Sela Reader 1.3 validation — 10 October 2026

Current products: universal installable Reader web app and Viewer CDN/ESM. Browser-extension source and packaging scripts have been removed after local backup. Shared library modules are in `library/`.

- Build and TypeScript declarations passed; 10 unit tests passed.
- Final local Chromium regression: 60 scenarios passed on the actual Reader and Viewer routes.
- Final local WebKit regression: 59 passed, one intentionally skipped Chromium service-worker offline scenario. GitHub Actions checks all three engines before release and Pages deployment.
- Desktop app installation is enabled; 320/390/768/1440 widths, settings theme/language, storage fallback, full backup round trip and tamper rejection tested.
- Visual review: public hero, desktop home/side rail, phone dark home, settings and full-page phone reader.

Local Firefox could not launch (`spawn UNKNOWN`); this is not a compatibility pass. Linux CI runs Chromium, Firefox and WebKit. Physical old iPhones/Android and lock-screen/background narration are not verified. Cloud backup is manual, not automatic OAuth sync.

Core gzip: 27,357 bytes (~26.7 KiB), CSS 3,988 bytes; optional tools 9,845 bytes, archive adapter 10,968 bytes, text adapter 3,103 bytes. Decoders, documents and app assets count separately. No comparative speed or memory claim against Readest is made.

[Reading capabilities and limits](reading-experience.md) · [Products](products.md) · [Install app](pwa.md).

Patch 1.3.2: initial/duplicate notifications and internal panel changes no longer reset manual zoom. The keyboard/demo scenario passed 10 consecutive Chromium runs; delayed-notification, panel dismissal and actual viewport resize regressions passed Chromium and WebKit. The prior Linux matrix passed 172 scenarios; the patch matrix runs before publication.

Reader 1.3.2 adds a dedicated app UI regression for independent chrome, persisted palettes, page navigation, seamless Webtoon, fit, contents, panel dismissal, close and unchanged Viewer chrome. Responsive app visuals reviewed at phone, tablet and desktop sizes in light/dark palettes. After the final fullscreen/theme adjustments, the focused app and PWA rerun passed 5 scenarios with the same one intentional WebKit offline skip.


Reader 1.4.0: metadata, local quote/page PNGs, optional app-style inline CDN UI, one tools close control, portrait public covers and compact home were checked in Chromium and WebKit at 320, 390, 768 and 1440 pixels. Unit tests: 11 passed; TypeScript check passed. Local full matrix: 128 passed, one intentional WebKit offline skip, one Vue/WebKit timeout; the Vue case then passed three repeats. Final app/metadata/share regressions passed both browser projects, including actual PNG downloads, native-share API dispatch/fallback, metadata editing and backup/restore. Physical OS share-sheet behavior remains device-dependent. The final Firefox/Chromium/WebKit matrix runs on Linux before release and Pages publication.

Release 1.4.0 passed 193 browser scenarios across Linux Chromium, Firefox and WebKit, with two intentional offline skips. Pages and core/app/metadata/style CDN hashes were verified live. Patch 1.4.1 adds immediate bookmark-list refresh for dock and keyboard changes while the contents panel remains open.
