# Sela: research and remaining priorities

Reviewed **9 October 2026**. This is a product recommendation, not a release schedule. The shipped 1.0 baseline below is implemented; the remaining priorities are proposals, not release commitments.

## Positioning

**One delightful reading interface, optional capabilities, many stacks.** Focus on embedding PDF, EPUB and comics into existing websites, with an honest download budget and thoughtful manga/webtoon controls. GitHub stars reflect adoption and community interest; no feature set guarantees a ranking.

## What adjacent projects already do

| Project / primary source | Observed strength | Implication for Sela |
| --- | --- | --- |
| [PDF.js](https://github.com/mozilla/pdf.js) | General-purpose PDF parsing/rendering, established viewer and contributor documentation | Keep the proven decoder; improve our reading UI and optional integrations |
| [foliate-js](https://github.com/johnfactotum/foliate-js) | Modular browser ebook rendering, several ebook formats, book/renderer interfaces and auxiliary search/annotation modules | Multi-format alone is not a differentiator; define stable, small adapter contracts |
| [Readest](https://github.com/readest/readest#features) | Cross-platform reading, full-text search and annotations/highlights | Search and useful reading tools are a baseline expectation for richer readers |
| [StPageFlip](https://github.com/Nodlik/StPageFlip) | Dedicated realistic page-turning library | Animation needs polish, but cannot be the whole product proposition |

These projects serve different scopes. No relative speed, memory or bundle superiority is claimed without equivalent measurements.

## Shipped in Sela 1.0

Embedded PDF outlines; EPUB navigation/NCX and anchor links; cancellable extractable-text search and a selectable transcript; optional Web Speech narration with local-voice default; local page/chapter notes and JSON export/import; text adapters (TXT, basic MD, safe HTML, text-only FB2); dedicated extension IndexedDB library with covers, clock, coffee pause, Standard/New Tab packages and context-menu document opening; overlay/inline presentation; portrait/spread adaptation and capability-gated orientation lock.

The core is approximately 23.4 KiB gzip. Optional tools are approximately 4.5 KiB; text formats about 2.5 KiB. These are build artifact measurements, not comparative application speed or memory benchmarks. PDF.js, fonts, documents and extension assets count separately.

## Remaining priorities

| Priority | Proposal | Why it matters | Lightweight approach / acceptance criterion |
| --- | --- | --- | --- |
| P0 | Aligned PDF text layer and highlights | Readers need to find, copy and navigate content; canvas-only PDFs have accessibility limits | Load on demand, cancellable indexing, keyboard navigation; verify text alignment at zoom and RTL |
| P0 | EPUB CFI locations, reflow pagination and publisher typography | Chapter-only progress is too coarse; layout changes should not lose position | Parse navigation/NCX, stable anchors; preserve position after font-size changes and reopen |
| P0 | Performance evidence + browser/device matrix | A documented budget is more credible than “super lightweight” | Measure interface versus decoder versus document; cold/warm loads, peak canvas memory, long books, Safari/Firefox and physical touch devices |
| P1 | Comic panel focus and gutter/crop presets | A clear manga/webtoon specialty that can work on small screens | Start with user-defined panel regions and non-destructive cropping; avoid shipping a mandatory AI model |
| P1 | Portable highlights, notes and reading progress | Useful for students and reading apps; users should own their data | Local first, JSON/Markdown export, versioned location format, optional host-provided sync adapter |
| P1 | Reproducible embed/config links and integration starter examples | Makes a striking demo useful to actual developers | Whitelist public demo parameters; never embed tokens/private URLs; offer copyable config and tested SSR cleanup examples |
| P1 | Npm distribution and adapter extension API | Reduce setup friction; let contributors add capabilities without bloating core | Publish only after package ownership/release checks; stable adapter lifecycle and conformance tests |
| P2 | Reading ruler / OPDS catalog | Broaden learning and library use cases | Browser capability detection and separate modules; opt-in permissions, no compulsory backend |
| P2 | Host-controlled AI hooks | Allow apps to provide search assistance or summaries | Explicit opt-in callback/provider; no silent document upload and no mandatory provider SDK |

## Growth work that supports adoption

- Put real screenshots and a working playground above long documentation.
- Keep English documentation primary, Indonesian translation linked, and feature limits visible.
- Publish reproducible small integration examples; identify recipes versus maintained adapters.
- Provide a release changelog, issue reproduction guidance and contributor entry points.
- After benchmark evidence exists, publish a short demo with setup, real use cases and measured costs. Invite organic feedback and contributions; avoid artificial stars or unsupported “fastest” claims.

## Current gaps, stated plainly

PDF has extractable-text search and a separate transcript, but no aligned text/highlight layer or OCR. EPUB uses sanitized reader typography, chapter/anchor navigation and relative scroll resume, without publisher layout fidelity or encrypted resources. Archives are bounded but synchronously extracted. DjVu is optional and depends on an external GPL-2.0 decoder. Physical Safari/iOS checks, long-book profiling, npm-registry publication and a public third-party adapter API remain outstanding.

[Current capabilities](formats.md) · [Compatibility](compatibility.md) · [Contributing](../CONTRIBUTING.md)

## Comparison and implementation policy

[Readest's feature list](https://github.com/readest/readest#features) and [narration documentation](https://www.readest.com/docs/listen) establish expectations for search, annotation, navigation and speech. [foliate-js](https://github.com/johnfactotum/foliate-js) provides modular ebook parsing, CFI, search/annotation helpers and MOBI/KF8/FB2. Sela borrows product patterns and implements its own small optional tools; no source from either project was copied into this release. Our narrower EPUB fidelity/format coverage and lack of sync mean feature parity is not claimed.

Next: aligned PDF text selection and portable highlights; EPUB CFI/reflow pagination and publisher typography; optional tested MOBI/AZW3 decoder; OPDS and host-owned sync adapters; manual comic-panel regions. Each new parser should be lazy, licensed, bounded against malformed input and tested with real fixtures. Cloud AI, neural TTS and automatic OCR models must remain optional providers to preserve the embedding budget.

## Shipped in Sela 1.1

PWA viewer installation, clear CDN/extension routes, accessible reading-tools tabs, twelve filters, document brightness and dim controls, daily/manual stable-release notifications (manual code updates for unpacked packages). Core ~23.9 KiB gzip, optional tools ~6 KiB. Original example replaced with a 50-page mystery, twelve chapters and four minimalist illustrations. OPDS, CFI/highlights, OCR, sync, music playback and store signing remain future work.
