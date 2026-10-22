# Faith readings: data contract

The Faith tab on the shelf lists optional, user-installed **reading packs**. There are three kinds. Nothing is bundled into the app JavaScript, precached by the service worker, or added to the shelf.

| Kind | Manifest `kind` | Payload | Hosted by Sela |
| --- | --- | --- | --- |
| Editorial collection | `editorial-collection` | Stories with Quran references and separate interpretation notes | Yes |
| Text collection | `text-collection` | Works split into sections of verses or paragraphs | Yes |
| Publisher pack | none, built at runtime | Quran edition or hadith category, exactly as the publisher sent it | No |

## Files

| Path | Role |
| --- | --- |
| `library/packs/<id>.manifest.json` | Hand-written manifest source. It has no `sha256` or `bytes` |
| `library/packs/<payload>.json` | The payload the pack installs |
| `library/packs/index.json` | **Generated.** The catalogue the app fetches, with the real `sha256` and `bytes` |
| `licenses/<notice>.md` | Rights notice named by `license.noticePath` |
| `app/library/content-packs.ts` | Types, validation, download, verify, install, remove |
| `app/library/source-packs.ts` | Publisher packs |
| `app/library/quran-structure.ts` | Hafs verse counts used to reject truncated Quran downloads |
| `scripts/packs.ts` | Validates sources and rebuilds `index.json` |
| `scripts/import-readings.ts` | Builds the text-collection payloads from their sources |

```sh
node --experimental-strip-types scripts/packs.ts            # dry run
node --experimental-strip-types scripts/packs.ts --write    # write index.json
node --experimental-strip-types scripts/packs.ts --check    # exit 1 if stale
node --experimental-strip-types scripts/import-readings.ts --dry-run   # report what the importer would write
node --experimental-strip-types scripts/import-readings.ts sela-sa-id  # rebuild one pack
```

`npm test` fails when `index.json` does not match the payload bytes, when a pack has no notice, or when a payload still carries Project Gutenberg boilerplate.

## Manifest (schemaVersion 1)

`id`, `kind`, `status` (`pilot`, `draft` or `complete`), `faiths` (one or more of `islam`, `protestantism`, `catholicism`, `buddhism`, `hinduism`, `confucianism`), `category`, `language`, `title{id,en}`, `description{id,en}`, `edition`, `itemCount`, `source[{label,url}]` (https only), `license{code,name,noticePath}`, `payload{path,sha256,bytes}`.

`faiths` decides which tradition's Faith tab lists the pack. A payload may not exceed 16 MiB. The catalogue may not exceed 256 KiB.

## Text collection payload

```json
{ "schemaVersion": 1, "packId": "sela-sa-id",
  "works": [ { "id": "samyukta-agama", "title": "…", "author": "…",
    "sections": [ { "id": "sa1", "title": "SA 1 · …", "paragraphs": ["…"] },
                  { "id": "chapter-1", "title": "Matius 1", "verses": [ { "n": "1", "text": "…" } ] } ] } ] }
```

Ids match `[a-z0-9][a-z0-9-]{1,40}` and are unique within their parent. A section has `paragraphs`, `verses`, or both, and never neither. Line breaks inside a paragraph are kept for verse. Reader routes are `/readings/<pack>`, `/readings/<pack>/<work>` and `/readings/<pack>/<work>/<section>`.

## Install lifecycle (hosted packs)

1. The reader presses **Download for offline**. Never automatic.
2. Fetch `payload.path` relative to the deployed app (`packUrl`, so `/sela/` sub-paths work).
3. Stream with a hard cap at `payload.bytes`. Cancel aborts and saves nothing.
4. Compare length, then SHA-256 (`crypto.subtle`). A mismatch discards the download.
5. Validate the shape against the manifest: item count, unique ids, text present, references and related links resolve.
6. One IndexedDB `put` into the database `sela-content-packs`, separate from `sela-private-library`.

Remove deletes only that record. Shelf books, notes, highlights, progress and backups live in other stores.

## Publisher packs (QuranEnc and HadeethEnc)

`app/library/source-packs.ts` downloads these from the publisher's API when the reader presses a button. Both publishers allow re-use only if the text is unchanged, credited, versioned and kept current, so Sela stores the response verbatim.

| Kind | Calls | Check before saving | Stored as |
| --- | --- | --- | --- |
| `quran-edition` | `translations/list/<lang>`, then `translation/sura/<key>/1..114` | 114 surahs, each with exactly the Hafs verse count, 6,236 verses in total, no empty Arabic or translation | `QuranEditionPayload` |
| `hadith-collection` | `categories/list/`, `hadeeths/list/` (paged), `hadeeths/one/` per id | each record has the requested id, a title and text, and the list is not empty | `HadithPayload`, all fields except the `translations` language list |

- Languages offered: Indonesian and English. The default follows the interface language.
- Four requests run at once, each retried twice. One failure cancels the install and saves nothing.
- Asking for a list contacts the publisher, and only on a button press.
- An installed Quran edition is read from the device. While it is the selected edition the Quran reader makes no request to QuranEnc. The edition dropdown asks for the online list only when opened.
- Version shown: the publisher's version for Quran editions, the download date for hadith, because that API has none.
- **Update** appears for Quran editions when the listed version differs. Every publisher pack has **Download again**.
- Size: a Quran edition is about 2 to 3 MB. A hadith is about 3 KB, so the largest category (Fikih, 1,102 items) is a few MB and takes minutes. A pack over 40 MB is refused.

## Saved entries and backups

Saved entries and the last entry read are stored in the personal store (`readingsSaved`, `readingsLast`), so Sela backups and restores carry them. Pack payloads are not in backups. They can be downloaded again, and saved entries reappear when the pack is installed.

## Adding a pack

1. Check the licence of the exact edition and record it in [Faith readings: sources](faith-readings-sources.md).
2. Add a spec to `scripts/import-readings.ts` (or write the payload by hand for original text), and write the notice under `licenses/`.
3. Run `scripts/packs.ts --write`, then `npm test`.
4. Do not ship placeholders such as `TO_BE_COMPUTED` or `bytes: 0`.
