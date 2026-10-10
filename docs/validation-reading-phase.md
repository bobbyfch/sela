# Sela Reader 1.3 validation — 10 October 2026

Current products: universal installable Reader web app and Viewer CDN/ESM. Browser-extension source and packaging scripts have been removed after local backup. Shared library modules are in `library/`.

- Build and TypeScript declarations passed; 10 unit tests passed.
- Final Chromium regression: 57 scenarios passed on the actual Reader and Viewer routes.
- Final WebKit regression: 56 passed, one intentionally skipped Chromium service-worker offline scenario. Additional Chromium offline tests passed after the cache update. GitHub Actions checks all three engines before release and Pages deployment.
- Desktop app installation is enabled; 320/390/768/1440 widths, settings theme/language, storage fallback, full backup round trip and tamper rejection tested.
- Visual review: public hero, desktop home/side rail, phone dark home, settings and full-page phone reader.

Local Firefox could not launch (`spawn UNKNOWN`); this is not a compatibility pass. Linux CI runs Chromium, Firefox and WebKit. Physical old iPhones/Android and lock-screen/background narration are not verified. Cloud backup is manual, not automatic OAuth sync.

Core gzip: 27,262 bytes (~26.6 KiB), CSS 3,988 bytes; optional tools 9,845 bytes, archive adapter 10,968 bytes, text adapter 3,103 bytes. Decoders, documents and app assets count separately. No comparative speed or memory claim against Readest is made.

[Reading capabilities and limits](reading-experience.md) · [Products](products.md) · [Install app](pwa.md).
