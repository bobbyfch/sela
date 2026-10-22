# Taman Bacaan data contract

Taman Bacaan (Reading garden) is a lens inside Discover. It lists optional, user-installed **content packs** of two kinds: hosted editorial packs and publisher packs.
Nothing is bundled into the app JavaScript, precached by the service worker, or added to the shelf.

## Files

| Path | Role |
|---|---|
| `library/packs/<id>.manifest.json` | Hand-written manifest source. No `sha256` or `bytes`. |
| `library/packs/<payload>.json` | The payload the pack installs. |
| `library/packs/index.json` | **Generated.** Catalogue the app fetches. Holds the real `sha256` and `bytes`. |
| `licenses/<notice>.md` | Rights notice named by `license.noticePath`. |
| `app/library/content-packs.ts` | Types, validation, download, verify, install, remove. |
| `scripts/packs.ts` | Validates sources and rebuilds `index.json`. |

```sh
node --experimental-strip-types scripts/packs.ts            # dry run
node --experimental-strip-types scripts/packs.ts --write    # write index.json
node --experimental-strip-types scripts/packs.ts --check    # exit 1 if stale
```

`npm test` fails when `index.json` does not match the payload bytes (`tests/unit/content-packs.test.ts`).

## Manifest (schemaVersion 1)

`id`, `kind` (`editorial-collection`), `status` (`pilot` or `complete`), `category`, `language`, `title{id,en}`,
`description{id,en}`, `edition`, `itemCount`, optional `plannedItemCount`, `source[{label,url}]` (https only),
`license{code,name,noticePath}`, `payload{path,sha256,bytes}`. A payload may not exceed 8 MiB; the catalogue 256 KiB.

## Install lifecycle

1. User presses **Download for offline**. Never automatic.
2. Fetch `payload.path` relative to the deployed app (`packUrl`, so `/sela/` sub-paths work).
3. Stream with a hard cap at `payload.bytes`. Cancel aborts and saves nothing.
4. Compare length, then SHA-256 (`crypto.subtle`). Mismatch discards the download.
5. Validate shape against the manifest (item count, unique slugs, every section has a Quran reference, related links resolve).
6. One IndexedDB `put` into database `sela-content-packs`. This is separate from `sela-private-library`.

Remove deletes only that record. Shelf books, notes, highlights, progress and backups are in other stores and are untouched.
Reading an installed pack makes no network request. Quran reference links open the existing Quran reader, which is online.

## Payload: `editorial-collection`

Each article has `slug`, `order`, `name`, `arabic`, `lede`, `sections[{heading, paragraphs, refs[{surah,from,to?}]}]`,
`notes[]` (SELA interpretation, each starting `Catatan SELA (bukan wahyu)`), `accuracy`, `related[]`.
Story text, citations (`refs`) and interpretation (`notes`) are separate fields and render in separate blocks.

## Adding a pack

Write the manifest and payload, run `scripts/packs.ts --write`, write the notice, record the source and rights in
[taman-bacaan-sources.md](taman-bacaan-sources.md). Do not ship placeholders (`TO_BE_COMPUTED`, `bytes: 0`).

## Publisher packs (QuranEnc and HadeethEnc)

These are not hosted by Sela. `app/library/source-packs.ts` downloads them from the publisher's API when the reader presses a button.
Both publishers allow re-use only if the text is unchanged, credited, versioned and kept current, so Sela stores the response verbatim.

| Kind | Source calls | Check before saving | Stored as |
|---|---|---|---|
| `quran-edition` | `translations/list/id`, then `translation/sura/<key>/1..114` | 114 surahs, each with exactly the Hafs verse count (`app/library/quran-structure.ts`), 6,236 verses in total, no empty Arabic or translation | `QuranEditionPayload` |
| `hadith-collection` | `categories/list/`, `hadeeths/list/` (paged), `hadeeths/one/` per id | each record has the requested id, a title and text; the list is not empty | `HadithPayload`, all fields kept except the `translations` language list |

- Four requests run at once, each retried twice. One failure cancels the install and saves nothing.
- Asking for a list contacts the publisher. That only happens on a button press.
- An installed Quran edition is read from the device. When it is the selected edition, the Quran reader makes no request to QuranEnc. The edition dropdown asks for the online list only when opened.
- Version shown: the publisher's `version` for Quran editions; the fetch date for hadith, because the API has none.
- **Update**: Quran editions show it when the listed version differs. Both kinds have **Download again**.
- Size: Quran about 2 to 3 MB. Hadith about 3 KB each; the largest category (Fikih, 1,102 items) is a few MB and takes minutes. A pack over 40 MB is refused.

## Saved entries and backups

Saved entries and the last entry read are stored in the personal store (`tamanSaved`, `tamanLast`), so Sela backups and restores carry them.
Pack payloads are not in backups. They can be downloaded again, and saved entries reappear once the pack is installed.
