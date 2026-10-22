# Taman Bacaan · MVP

**Updated:** 22 October 2026

**Status:** Implemented in the current feature branch; browser verification and screenshots pending.

**Surface:** Discover, with a separate source-browsing view.

## Interaction and hierarchy

- Discover opens on **Taman Bacaan**. A two-button switch keeps the existing nine-provider source browser available inside the same screen; its selected view is retained in the Discover URL as `?view=sources`.
- Search stays in the browser and matches collection metadata only. It does not send personal shelf titles or queries to a catalog provider.
- Collection filters cover category, language, content type, rights note and delivery state. Every item shows its edition, language, scope/count, source, rights note and an honest access note.
- Existing local editions open through the current source-attributed book/chapter browser. The Quran and 25-prophet passage index use their existing reader routes. SELA Picks returns to the existing metadata-first Gutenberg catalog.
- The first view uses Sela's paper-and-ink palette, Newsreader display type, existing UI type, hairline rules and restrained book marks. It does not invent cover art for texts without a licensed cover.
- Layout reference widths are 320, 375, 414, 768 and 1440 px. On small phones, filters stack into one column and collection cards become one column; wider layouts use a three-column collection grid.

## Catalogue in this milestone

Counts are checked against the shipped data, not hand-entered descriptions alone.

| Collection | Scope | Delivery shown | Source / rights note |
| --- | --- | --- | --- |
| World English Bible | 66 books · English | Included with Sela; cached after a successful load | eBible.org says public domain; preserve the exact named text |
| Douay-Rheims 1899 | 73 books · English | Included with Sela; cached after a successful load | eBible.org identifies the edition as public domain |
| Dhammapada · Bhikkhu Sujato | 26 chapters · English | Included with Sela; cached after a successful load | SuttaCentral's edition page identifies CC0 |
| The Song Celestial · Bhagavad-Gita | 18 chapters · English | Included with Sela; cached after a successful load | Project Gutenberg #2388: public domain in the USA; check local law |
| The Analects · James Legge | 20 books · English | Included with Sela; cached after a successful load | Project Gutenberg #3330: public domain in the USA; check local law |
| Quran | 114 surahs · Arabic with Indonesian, English or Japanese translation choices | Online | QuranEnc edition/version and attribution rules apply; no surah text is copied into this catalogue |
| Quran prophet passage index | 25 concise notes with Quran references | Included with Sela; cached after a successful load | SELA editorial notes; not presented as 25 complete biographies |
| SELA Picks · world classics | 227 English-language records | Metadata only; text is fetched after user selection in the existing source view | Project Gutenberg rights can vary by country and by record |

## Offline and pack boundary

“Included with Sela” describes text shipped with the app. These files are in `offline-assets.json`'s `allowed` list, not the install-time `appShell`; the service worker caches them after a successful fetch. The UI therefore asks readers to open an included edition once online before expecting offline use. Quran translations remain online in this slice.

This is a curated index over existing assets, not the full pack manager milestone. It does not offer install/uninstall, transfer or cancellation for separate optional packs, nor dynamically report per-file cache state. Those are still required before calling a collection an optional installed pack. Nothing is automatically added to the user's shelf by browsing a card.

## Rights sources reviewed

- [World English Bible copyright](https://ebible.org/engwebp/copyright.htm) and [Douay-Rheims 1899 copyright](https://ebible.org/engDRA/copyright.htm).
- [SuttaCentral Dhammapada · Bhikkhu Sujato](https://suttacentral.net/edition/dhp/en/sujato) and [SuttaCentral licensing](https://suttacentral.net/licensing).
- [Project Gutenberg #2388](https://www.gutenberg.org/ebooks/2388), [Project Gutenberg #3330](https://www.gutenberg.org/ebooks/3330), and [Project Gutenberg terms](https://www.gutenberg.org/policy/terms_of_use.html).
- [QuranEnc API and translation reuse terms](https://quranenc.com/en/home/api/). Translation content is left online in this milestone; before making a pack, preserve its exact version, transcript information and attribution and follow its update conditions.

## Verification record

The unit test checks catalogue counts against the bundled JSON/prophet data and confirms bundled texts are service-worker-cacheable after fetching. Browser checks cover metadata search, filter behavior, existing source navigation, the edition browser and horizontal overflow across the five reference widths. Record actual results and add the Playwright captures here after the run completes.
