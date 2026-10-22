# Faith readings: design

Implemented, not a mockup. Code: `web/app/ui/features/readings/`. Styles: the `readings-*` block at the end of `web/app/ui/app.css`.

## Place in the app

The shelf gains a two-option switch, **My books** and **Faith**. It appears only when a faith or tradition is chosen in Settings, so a reader who wants none sees none. The tab is in the address (`#/shelf?tab=faith`), so reload and back work. There is no new top-level tab.

Settings is the single control. Changing the faith there changes, immediately:

| Surface | Effect |
| --- | --- |
| Shelf | The Faith tab appears with that tradition's readings only |
| Home | The sourced daily reading, and prayer times for Islam |
| Home prompt | Explains the setting while none is chosen |
| Settings, Library tools | Lists every download with its size and removes it on request |

Reading opens full screen at `#/readings/<pack>`, with the same header and controls as the Quran reader.

## Tokens

No new tokens. It uses the paper-and-ink variables: `--color-paper-raised`, `--color-ink`, `--color-muted`, `--color-accent`, `--color-rule`, `--color-focus`, `--font-display` (Newsreader) for titles and prose, and DM Sans for metadata. Dark, OLED and every paper palette work because nothing is hard-coded.

## Faith tab

Order: saved entries, hosted collections for the tradition, publisher packs (Islam only), then scripture editions already built into Sela.

Each card shows status (only when not complete), state (Available or Downloaded), contents, language, licence, edition, size and sources. Real actions: Download with a byte progress bar and Cancel, Read or Continue, Update when the checksum changed, Remove with a confirm dialog.

## Readers

- **Stories**: a numbered index with the Arabic name and a two-line lede. An article uses a 68-character measure. Quran references are chips that open the Quran reader at that verse. SELA interpretation sits in a separate accent-ruled block titled "not scripture". The accuracy note has a quieter rule.
- **Text collections**: works list, then contents with a filter and 100-row pages, then one section per page with previous and next, a Save button, reading time and the licence line. Verse numbers are small and tabular. Line breaks in verse are kept.
- **Hadith**: a searchable index with 50 rows per page, then one entry per page with the Arabic text, the publisher's grade and narrator reference, explanation and lessons, and a credit line. Text is rendered as plain text, never as HTML.

## States

Loading skeleton, catalogue error with Try again, offline notice that keeps installed packs usable, empty search, download error (checksum or size), cancelled download, storage error, pack missing, entry missing, remove confirmation.

## Responsive and accessibility

Checked at 320 px (no horizontal overflow, in the browser suite) and at 390, 768 and 1280 px with axe-core in light, dark and OLED appearance. Controls are at least 44 px tall. Headings are real headings, cards are `article` elements with labelled titles, lists are `ol`, and status text uses `aria-live`. Arabic text has `lang="ar" dir="rtl"`. Badges are plain bordered labels rather than coloured fills so their contrast holds in every palette.

## Not built

Highlights and notes inside pack entries. Saving an entry and the reading position are built.
