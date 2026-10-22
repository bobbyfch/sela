# Taman Bacaan design

Implemented, not a mockup. Code: `web/app/ui/features/taman/`. Styles: the `taman-*` block at the end of `web/app/ui/app.css`.

## Place in the app

Discover gets a two-option switch: **Jelajah sumber** (existing external catalogues, unchanged) and **Taman Bacaan**.
The choice lives in `?lens=taman`, so it survives reload and back/forward. No new top-level tab.
Reading uses the full-screen reader layout at `#/taman/<packId>` (index) and `#/taman/<packId>/<slug>` (article).

## Tokens

No new tokens. It reuses the paper-and-ink variables: `--color-paper-raised`, `--color-ink`, `--color-muted`, `--color-accent`,
`--color-rule`, `--color-focus`, `--font-display` (Newsreader) for titles and prose, DM Sans for metadata.
Dark, OLED and all paper palettes work because nothing is hard-coded.

## Screens

- **Landing order**: saved entries, hosted collections, publisher packs (Quran, hadith), then scripture editions already built into Sela.
- **Landing**: eyebrow, one headline, one sentence about consent and sources, search. Cards list status (Pilot), state (Available or Downloaded), entry count ("5 of 25"), language, licence, edition, size, sources. Real actions: Download, Cancel with a real byte progress bar, Read or Continue, Update when the checksum changed, Remove with a confirm dialog.
- **Index**: numbered list with the Arabic name, two-line lede, and an honest "5 of 25 written" note.
- **Article**: 68ch measure, section headings, Quran references as chips that open the Quran reader at that verse. SELA interpretation sits in a separate accent-ruled block titled "not scripture". The accuracy note has a quieter rule. Previous and next, related links, reading time.

## States

Loading skeleton, catalogue error with Try again, offline notice that keeps installed packs usable, empty search, download error (checksum or size), cancelled download, storage error, pack missing, entry missing, remove confirmation.

## Responsive and accessibility

Checked at 320 px (no horizontal overflow, tested) and 375 px and 1280 px (screenshots). Controls are at least 44 px tall.
Headings are real headings, cards are `article` with labelled titles, lists are `ol`, status text uses `aria-live`.
Arabic text has `lang="ar" dir="rtl"`. Reduced motion is honoured because nothing animates.

## Deliberately not built

Category row, language and licence filters: with one collection they would be empty controls. They appear when there is more than one to filter.
Highlights and notes inside pack articles: not done. Saving an entry and the last-read position are done.

## Publisher packs

A "From the publishers" section explains that Sela does not host the text. Two buttons load the publisher's list (this contacts the publisher, and the copy says so).
Cards show version, publisher, size on device and the source link. Quran editions open in the existing Quran reader. Hadith open in a searchable index with 50 rows per page, then one entry per page with the Arabic text, the publisher's grade, narrator reference, explanation and lessons, and a credit line.
Hadith text is rendered as plain text, never as HTML.
