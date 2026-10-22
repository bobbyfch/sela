# Work progress

## 22 October 2026 · branch `feature/faith-readings`, based on `main` at `b32619a`

### Done

| Area | Result |
| --- | --- |
| Viewer recovery (P0) | Already fixed upstream in PR #3. Re-verified locally. |
| Faith tab on the shelf | Built. Appears only when a faith or tradition is chosen. The earlier Discover lens was removed. |
| Settings drives the experience | The faith choice shapes the shelf tab, Home daily reading and prayer tools, the Home prompt, and a downloads manager in Library tools |
| Reading packs | Three kinds: editorial, text collection, publisher. Checksum, size and shape checks. Atomic install. |
| Kisah 25 Nabi | All 25 written and listed as complete. Not reviewed by a scholar, and the card and every entry say so |
| Quran and hadith | Downloaded unchanged from QuranEnc and HadeethEnc, Indonesian and English. The largest hadith category (1,102 items, 4.1 MB) was downloaded live in 92 seconds. |
| Text collections | 14 hosted packs: Alkitab TSI, World English Bible deuterocanon, Pali suttas (DN, MN, SN, AN, short collections, Samyukta Agama in Indonesian), Christian, Buddhist, Hindu and Confucian classics, Mencius, Syair Perahu and Gurindam Dua Belas. See [sources](faith-readings-sources.md). |
| Notes and quotes | One note per entry and saved quotes from selected text, listed on the Faith tab, in the personal store so backups carry them |
| Whole-app audit | Browser pass over 14 routes at 3 widths and 3 appearances, plus axe-core. Findings fixed. |
| Documentation | README (English and Indonesian), CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, documentation index, faith readings docs, roadmap, notices, changelog |
| CI | Added a reading-pack catalogue check |

### Audit findings fixed

- Calendar header buttons, the add-books button and the notice close button had no accessible name.
- Filled buttons in dark and OLED appearance showed white text on a light fill (contrast 2.4). Text now uses the paper colour.
- Several muted texts, the reflection citation and outside calendar days were below 4.5:1. Muted tokens were darkened and the dimming by opacity was removed.
- The brand link and the Discover result buttons had accessible names that did not contain their visible text.
- Public site: muted text contrast, a link distinguishable only by colour, and a scrollable code block that was not focusable.
- Faith reader headers are now banner landmarks.
- Touch targets raised to 40 to 44 px on the Discover surprise button, the water-goal button and the password toggle.

### Verification (local, Windows, Node 24)

- `npm run typecheck`: PASS.
- `npm test`: PASS, 117 tests.
- `npm run build`: PASS.
- Full Playwright run (Chromium, Firefox, WebKit and the real service-worker project, 509 cases): 501 passed, 8 skipped, 0 failed.
- axe-core on the Faith tab, the contents page and a reading page with notes, in light, dark and OLED: no critical or serious violations. Earlier passes covered every other app route and the public site.
- Live checks against QuranEnc (all three Indonesian editions, 114 of 114 surahs each) and HadeethEnc, including the 1,102-item Fikih category. The browser suite mocks both publishers.

### Known limits

- The 25 prophet stories are not scholar-reviewed. Verse numbers are machine-checked for existence, and about 40 ranges were compared by hand.
- Pack payloads are not in backups. Saved entries, notes, quotes and the reading position are.
- Coloured highlights drawn over the text are not built. Notes and saved quotes are.
- The Catholic tab uses the Alkitab TSI. It is a Protestant-origin translation without the deuterocanonical books, which the tab offers separately in English. The Indonesian Catholic editions in common use are not freely licensed.
- The Alkitab TSI has the complete New Testament and 21 Old Testament books.
- A few hidden file inputs and the drop prompt are reported by axe-core as outside a landmark (moderate).
- No physical-device, screen-reader or deployed-URL test. Nothing was pushed or deployed.
- On this machine `npm ci` failed with EPERM on a locked native file. `npm install` worked.

### Next

1. A qualified reader reviews the 25 stories. Then change `status` to `complete`.
2. Pick from the [roadmap](faith-readings-roadmap.md) and check rights per edition first.
3. Push the branch and open a pull request when authorised.
