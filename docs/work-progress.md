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
| Kisah 25 Nabi | Only short passage starters. | **5 of 25 written** (pilot). 20 not written. |
| Quran Arabic and Indonesian offline | Missing. | NOT STARTED, needs manual download and a rights check. See [taman-bacaan-sources.md](taman-bacaan-sources.md). |
| Hadith offline | Missing. | NOT STARTED, terms review first. |
| P2 scripture, literature, textbook packs | Missing. | NOT STARTED. |
| Import and validate script with dry run | Missing. | **Built**, `scripts/packs.ts`. |
| Design, sources, data contract docs | Missing. | **Written** (`docs/taman-bacaan-*.md`). |

### Verification (local, Windows, Node 24)

- `npm run typecheck`: PASS.
- `npm test`: PASS, 108 tests.
- `npm run build`: PASS.
- `tests/browser/taman-bacaan.spec.ts`: PASS in Chromium, Firefox and WebKit.
- `tests/browser/pwa-taman.spec.ts`: PASS in `chromium-pwa`.
- Full Playwright run (all 4 projects, 473 cases, 17.2 min): 461 passed, 8 skipped, 4 failed. All 4 failures were WebKit (`personal-reader` x2, `products` x2), none in Taman Bacaan files. Rerun in isolation: 24/24 passed. Cause of the combined-run timeouts is not established; earlier notes show the same WebKit pattern under load.

### Known limits

- Pilot text is not scholar-reviewed. The UI and every article say so.
- Verse numbers are machine-checked for existence only. Accuracy of each summary is not machine-checkable.
- Installed packs are not part of Sela backups. Last-read position is in `localStorage`.
- Bookmarks and highlights inside pack articles are not built.
- No physical-device, screen-reader or deployed-URL test. Nothing was pushed or deployed.
- On this machine `npm ci` failed with EPERM on a locked native file (`@tailwindcss/oxide`). `npm install` worked. Close editors and language servers before `npm ci`.
- `npm run build` rewrites hashed files under `app/chunks/`, `app/app.js`, `sela-sw.js` and `offline-assets.json`. These are committed generated files.

### Next explicit action

1. A scholar or qualified reader reviews the five pilot articles.
2. Write the other 20 only with verified references; keep short entries short (Idris, Zulkifli, Ilyasa).
3. Decide the Quran offline source and licence, then build the second pack type.
