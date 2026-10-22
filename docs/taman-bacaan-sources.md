# Taman Bacaan source register

Free to read is not permission to mirror. Each edition keeps its own rights. MIT covers SELA code and SELA-written text only.
Status values: **SHIPPED** (in the repo and tested), **NOT STARTED**, **BLOCKED** (needs a rights decision or access first).

| Collection | Status | Rights basis | Next step |
|---|---|---|---|
| Kisah 25 Nabi, 5 of 25 (Nuh, Ibrahim, Yusuf, Musa, Muhammad) | **SHIPPED**, pilot | Original SELA prose, MIT, see `licenses/sela-prophets-NOTICE.md`. Cites verses by number only; copies no Quran text or translation. | Scholar review. Then the other 20, only with checked references. |
| Quran Arabic offline | NOT STARTED | Tanzil text is CC BY 3.0, verbatim and unaltered, with attribution (https://tanzil.net/docs/Text_License). Download needs the Tanzil form, not scripted here. | Fetch the exact package by hand, record version and hash, test verse counts (6236). |
| Quran Indonesian translation offline | NOT STARTED | QuranEnc edition terms not yet reviewed for redistribution. Online per-surah use already exists. | Read the edition's terms. Pin version. No silent edits. |
| Hadith, Indonesian | NOT STARTED | HadeethEnc forbids changes, additions and deletions. Terms must be re-read before import. | Review terms and the official export. Keep SELA summaries separate from the source text. |
| Indonesian folklore and classics | NOT STARTED | Needs per-work and per-transcription rights checks. | Pick 1 to 3 verified Wikisource editions. |
| SuttaCentral, Sefaria, Standard Ebooks, Aozora, OpenStax packs | NOT STARTED | Licence is per edition. | Propose a collection first. |
| Existing local texts (WEB, DRA, Dhammapada, Gita, Analects) | Already shipped, not part of Taman Bacaan | See `THIRD_PARTY_NOTICES.md`. | Surface them as Taman Bacaan collections later. Do not duplicate them. |

## Sources used for the 5 pilot articles

Quran Kemenag RI (LPMQ), https://quran.kemenag.go.id/ , and Pustaka Lajnah, https://pustakalajnah.kemenag.go.id/detail/35 , are the declared starting references.
Every claim carries a verse reference. Details not in the verses (for example the name of the sacrificed son, the wife of the Egyptian governor, the Hira scene) are stated as outside the Quran in each article's accuracy note.

## Review status

Not reviewed by a scholar. The UI shows the Pilot badge and each article says so. Verse numbers were checked automatically
against the Hafs verse counts (`tests/unit/content-packs.test.ts`). That proves the verse exists, not that the summary is right.
