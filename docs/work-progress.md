# Work progress

## 22 October 2026 · branch `codex/taman-bacaan-mvp`, based on `main` at `b32619a`

### Done

| Area | Result |
| --- | --- |
| Viewer recovery (P0) | Already fixed upstream in PR #3. Re-verified locally. |
| Faith tab on the shelf | Built. Appears only when a faith or tradition is chosen. The earlier Discover lens was removed. |
| Settings drives the experience | The faith choice shapes the shelf tab, Home daily reading and prayer tools, the Home prompt, and a new downloads manager in Library tools |
| Reading packs | Three kinds: editorial, text collection, publisher. Checksum, size and shape checks. Atomic install. |
| Kisah 25 Nabi | All 25 written, draft, not reviewed by a scholar |
| Quran and hadith | Downloaded unchanged from QuranEnc and HadeethEnc, Indonesian and English |
| Text collections | Alkitab TSI, Pali suttas (English and Indonesian), Christian, Buddhist, Hindu and Confucian classics. See [sources](faith-readings-sources.md). |
| Saved entries | Stored in the personal store, so backups carry them |
| Whole-app audit | Browser pass over 14 routes at 3 widths and 3 appearances, plus axe-core. Findings fixed, listed below. |
| Documentation | README (English and Indonesian), CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, documentation index, faith readings docs, notices, changelog |
| CI | Added a reading-pack catalogue check |

### Audit findings fixed

- Calendar header buttons and the add-books button had no accessible name.
- Filled buttons in dark and OLED appearance showed white text on a light fill (contrast 2.4). Text now uses the paper colour.
- Several muted texts, the reflection citation and outside calendar days were below 4.5:1. Muted tokens were darkened and the dimming by opacity was removed.
- The brand link and the Discover result buttons had accessible names that did not contain their visible text.
- Public site: muted text contrast, a link distinguishable only by colour, and a scrollable code block that was not focusable.
- Faith reader headers are now banner landmarks.

### Verification (local, Windows, Node 24)

- `npm run typecheck`: PASS.
- `npm test`: PASS, 116 tests.
- `npm run build`: PASS.
- Full Playwright run (Chromium, Firefox, WebKit and the real service-worker project, 503 cases): 492 passed, 8 skipped, 3 failed. The 3 failures were one test that still used the old Settings label. After fixing the label it passed in all three engines.
- Browser pass with no page errors, console errors, failed local requests, horizontal overflow, or unlabelled controls on any route. One `h1` per page.
- axe-core on every app route in light and dark: no critical or serious violations. Remaining moderate findings are landmark suggestions for hidden file inputs and the drop prompt.
- axe-core on the public site: no violations.
- Live checks against QuranEnc (all three Indonesian editions, 114 of 114 surahs each) and HadeethEnc passed earlier. The browser suite mocks both publishers.

### Known limits

- The 25 prophet stories are not scholar-reviewed. Verse numbers are machine-checked for existence, and about 40 ranges were compared by hand.
- Pack payloads are not in backups. Saved entries and the reading position are.
- Highlights and notes inside pack entries are not built.
- The Catholic tab has no Indonesian Bible. The Indonesian editions in common use are not freely licensed.
- The Alkitab TSI has the complete New Testament and 21 Old Testament books.
- Small touch targets remain on a few older controls (a 30 px Discover button, a 28 px water-goal button). They were not changed.
- No physical-device, screen-reader or deployed-URL test. Nothing was pushed or deployed.
- On this machine `npm ci` failed with EPERM on a locked native file. `npm install` worked.

### Next

1. A qualified reader reviews the 25 stories. Then change `status` to `complete`.
2. Pick from the [roadmap](faith-readings-roadmap.md) and check rights per edition first.
3. Push the branch and open a pull request when authorised.
