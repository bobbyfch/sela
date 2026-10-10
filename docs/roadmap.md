# Roadmap

Sela 1.3 focuses on two products: installable Reader web app and embeddable Viewer. The current goal is a compact personal reading experience with lazy document decoders, rather than every feature in a larger reader.

## Available

PDF, reflowable EPUB, CBZ and text; optional external DjVu decoder. Book/single/manga/webtoon/scroll modes follow format capabilities. Embedded outlines, search, transcript, browser/OS TTS, notes, text highlights, typography, fit/crop/low-power and global/per-book preferences. Reader adds a local bookshelf, collections, favorites, sorting, filters, batch actions, full ZIP backup and manual cloud sharing. Desktop and phone installation depend on browser PWA support.

## Next priorities

| Priority | Capability | Acceptance boundary |
| --- | --- | --- |
| P1 | EPUB CFI and range annotations | Stable resume and export across editions; no geometric PDF highlight claim |
| P1 | Accessibility and physical device audit | Screen readers, keyboard, contrast, small touch screens and actual Safari/Android behavior |
| P1 | Package registry release | Ownership, reproducible bundle and immutable version verified |
| P2 | OPDS discovery | Explicit provider requests, supported authentication and no silent book uploads |
| P2 | Optional cloud account synchronization | OAuth setup, user consent, conflict rules and restore tested before promising sync |
| P2 | Additional format adapters | Lazy loading and licensing reviewed; DRM remains outside current scope |
| Content | Limaraya stories | Finished, edited and licensed books before listing as available |

Browser-extension distribution is discontinued. Music, OCR, translation services and commercial AI voices are not bundled. No comparative speed/feature parity claim against Readest or foliate-js is made. See [validation](validation-reading-phase.md) and [format limits](formats.md).
