# Taman Bacaan data contract

Taman Bacaan (Reading garden) is a lens inside Discover. It lists optional, user-installed **content packs**.
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

## Not stored in backups

The last-read entry per pack is in `localStorage` key `sela:taman:last-read`. Installed packs are not part of Sela backups;
they can be downloaded again. This is intentional for the pilot and is a known gap.

## Adding a pack

Write the manifest and payload, run `scripts/packs.ts --write`, write the notice, record the source and rights in
[taman-bacaan-sources.md](taman-bacaan-sources.md). Do not ship placeholders (`TO_BE_COMPUTED`, `bytes: 0`).
