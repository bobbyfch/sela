# Taman Bacaan source register

Free to read is not permission to mirror. Each edition keeps its own rights. MIT covers SELA code and SELA-written text only.
Status values: **SHIPPED** (in the repo, tested), **NOT STARTED**, **DECLINED** (deliberately not done, with the reason).
Terms below were read on 22 October 2026 and must be re-read before any change to how a source is used.

| Collection | Status | How it reaches the reader | Rights basis |
|---|---|---|---|
| Kisah 25 Nabi (25 of 25 written, draft) | **SHIPPED** | Hosted pack `library/packs/prophets-id-v1.json`, SHA-256 checked | Original SELA prose, MIT, `licenses/sela-prophets-NOTICE.md`. Cites verses by number only; copies no Quran text or translation. |
| Quran, Indonesian, with Arabic (3 QuranEnc editions) | **SHIPPED** | Downloaded by the reader's browser from `quranenc.com/api/v1` on request. Sela hosts nothing. | QuranEnc terms: no modification, addition or deletion; credit publisher and QuranEnc.com; show the version; keep transcript information; keep current; no inappropriate ads. Met by storing the response verbatim with its version and offering Download again. |
| Hadith, Indonesian (7 HadeethEnc categories) | **SHIPPED** | Downloaded by the reader's browser from `hadeethenc.com/api/v1` on request. Sela hosts nothing. | HadeethEnc has the same seven conditions. The API gives no version number, so the fetch date is shown as the version. |
| Quran Arabic from Tanzil | **DECLINED** | n/a | QuranEnc already returns the Arabic with each edition. A second Arabic source would mix editions, which Tanzil's "verbatim only" licence makes risky. |
| Built-in scripture texts (WEB, Douay-Rheims, Dhammapada, Gita, Analects) | Already shipped, now listed in Taman Bacaan | Bundled JSON in `library/assets/` | See `THIRD_PARTY_NOTICES.md`. Card values are tested against those files. |
| Indonesian folklore and classics | NOT STARTED | n/a | Needs a rights check of the work, the transcription and any modern translation. Discover > Jelajah sumber > Wikisumber already reaches Indonesian Wikisource online. |
| SuttaCentral suttas, Sefaria, Standard Ebooks, Aozora, OpenStax packs | NOT STARTED | n/a | Licence is per edition. Each needs a named proposal first. OpenStax and Gutenberg are already reachable through Discover. |

## Sources for the 25 articles

Quran Kemenag RI (LPMQ), https://quran.kemenag.go.id/ , and Pustaka Lajnah, https://pustakalajnah.kemenag.go.id/detail/35 , are the declared references.
Every section carries verse references. Details not in the verses (for example the name of the sacrificed son, the wife of the Egyptian governor, the Hira scene, the city of Lut) are stated as outside the Quran in each article's accuracy note.

## Checks and their limits

- Every cited verse exists in the Hafs verse counts (`tests/unit/content-packs.test.ts`).
- A sample of claims was compared by hand against the Indonesian Kemenag translation from QuranEnc (about 40 verse ranges). This found and fixed one wrong phrase (Syuaib's punishment "on a dark day" was "the day of the shadowing cloud").
- Not reviewed by a scholar. The UI shows a Draft badge and each article says so. Machine checks prove a verse exists, not that a summary is right.
