# Work progress

## 22 October 2026 · branch `codex/taman-bacaan-mvp`, based on `main` at `b32619a`

### Audit of the all-in-one brief

| Item | State found | Action |
|---|---|---|
| P0 Viewer URL bug in `reader-sdk.ts` | Already fixed upstream (PR #3). | Re-verified locally. |
| P0 real service-worker tests | Already present (`pwa.spec.ts`, `pwa-update.spec.ts`, project `chromium-pwa`). | Re-verified. Added `pwa-taman.spec.ts`. |
| P0 error, retry, stale-chunk states | Present. | Not changed. |
| Taman Bacaan in Discover | Missing. | **Built.** |
| Content pack model, install, remove, checksum | Missing. | **Built.** |
| Kisah 25 Nabi | Only short passage starters. | **All 25 written** (draft, not scholar-reviewed). |
| Quran Indonesian with Arabic, offline | Online only. | **Built**, 3 QuranEnc editions, downloaded from the publisher. |
| Hadith, Indonesian, offline | Missing. | **Built**, 7 HadeethEnc categories, downloaded from the publisher. |
| Saved entries, last read, backup | Missing. | **Built**, in the personal store so backups carry them. |
| Built-in scripture texts in Taman Bacaan | Only on Home. | **Listed** (5 editions, values tested against the JSON files). |
| Import and validate script with dry run | Missing. | **Built**, `scripts/packs.ts`. |
| Design, sources, data contract docs | Missing. | **Written** (`docs/taman-bacaan-*.md`). |
| Tanzil Arabic text | Missing. | **Declined**, QuranEnc already returns the Arabic. |
| Indonesian folklore and classics, SuttaCentral, Sefaria, Standard Ebooks, Aozora, OpenStax packs | Missing. | **NOT STARTED**, each edition needs its own rights check. |

### Verification (local, Windows, Node 24)

- `npm run typecheck`: PASS.
- `npm test`: PASS, 112 tests.
- `npm run build`: PASS.
- Full Playwright run (all 4 projects, 482 cases, 18.6 min): 474 passed, 8 skipped, 0 failed.
- Publisher APIs: the browser suite mocks QuranEnc and HadeethEnc. A separate live run in Chromium installed the real Indonesian Quran edition "Sabiq" (114 surahs, 6,236 verses, 2.2 MB) and the real hadith category "Hadis dan Ilmu Hadis" (10 items). All three Indonesian editions were checked against the Hafs verse counts: 114 of 114 surahs each.
- Not run live: the large hadith categories (Fikih has 1,102 items).

### Known limits

- The 25 articles are not scholar-reviewed. The UI shows a Draft badge and every article says so.
- Verse numbers are machine-checked for existence. About 40 verse ranges were also compared by hand with the Kemenag translation. Accuracy of each summary is not machine-checkable.
- Pack payloads are not in backups. Saved entries and last-read are.
- Highlights and notes inside pack articles are not built.
- HadeethEnc gives no version number, so the fetch date is shown as the version.
- No physical-device, screen-reader or deployed-URL test. Nothing was pushed or deployed.
- On this machine `npm ci` failed with EPERM on a locked native file (`@tailwindcss/oxide`). `npm install` worked.
- `npm run build` rewrites hashed files under `app/chunks/`, `app/app.js`, `sela-sw.js` and `offline-assets.json`. These are committed generated files.

### Next explicit action

1. A qualified reader reviews the 25 articles. Change `status` to `complete` in the manifest only after that.
2. Pick the next collection and check its rights per edition before writing code.
3. Push the branch and open a PR when authorised.
