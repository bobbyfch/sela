# Sela work progress

## 21 October 2026 · Viewer recovery

### Baseline
- Main HEAD: 14f7889bfb950775abbf72875863bacf1452c990.
- Baseline run 39582416727: build, unit, types, and static checks passed; browser checks failed across Chromium, Firefox, and WebKit.
- Observed failures: Discover had 457–491px internal overflow at a 320px viewport; the mobile focus-timer assertion scrolled only to the viewport edge and measured its fixed dock overlap; the faith-shortcut test queried the old class .islamic-reading-shelf, while the implemented component is .islamic-reading-shortcuts.
- Pages deploy and Reader/Viewer release workflows were skipped after that failed browser run.
- The uploaded brief's confirmed SDK path bug also exists at this HEAD: its root-relative /dist/js/sela.esm.js URL escapes /sela/ on GitHub Pages.
- The repo already had an enabled-service-worker test covering first install and offline reading. The missing CI case was an actual worker replacement under the same app scope.

### Changes on codex/sela-viewer-recovery-2026-10-21
- Resolve the SDK from the app document base and cover root/subpath paths.
- Bound reader initialization, cancel pending waits on unmount, and add clear retry/re-import actions.
- Stack Discover headings and controls at narrow widths.
- Align the shortcut browser test with the current component and center the focus-timer card before asserting dock clearance.
- Preserve existing PWA tests and add a Chromium real-worker old-to-new cache update plus offline book-opening test.
- Add this handoff note and docs/reader-deployment-regression.md.

### Verification status
- Local checkout is not present in this Work workspace; local build and tests have not run.
- Branch CI and browser verification now pass on the recovery branch; see the final verification record below.
- Live production path and deployment are not yet verified.

### CI follow-up · 21 October 2026
- Run 39593295854 at commit ef05d5afed6328f7ba4a1c57c45424cda51935b3: build/generated-artifact check, unit tests, test types, and typecheck passed.
- The first enabled-service-worker test stopped before browser interaction because its matcher assumed single-quoted worker constants; the generated worker uses double quotes. The test is being corrected to support the emitted format. The old-to-new worker behavior remains unverified until the rerun passes.

### CI browser follow-up · 21 October 2026
- Run 39593295854: the WebKit layout suite exposed remaining 320px Discover internal overflow (488px scroll width inside a 320px container). The first fix did not remove the underlying overflowing descendant; the next regression run adds the descendant measurements needed to target it.
- The new SDK failure test's sample button matcher also needed the app's Indonesian labels for WebKit's default locale. That matcher now covers both English and Indonesian.
- At that point the separate PWA rerun was in progress; its final result is recorded below.

### PWA locale follow-up · 21 October 2026
- Run 39593650404 reached the real update notice successfully. The app localized it to Indonesian from the browser's default preferences, while the test expected English. The PWA test now sets English explicitly before app startup so it checks one stable copy rather than depending on the CI locale.
- At that point the old-to-new cache replacement and offline reopen assertions still needed a passing run; the final result is recorded below.

### Reader error follow-up · 21 October 2026
- Failed dynamic imports now show a recoverable, non-technical reader-engine message; timeouts keep their separate timeout copy. The test fixes app language to English and verifies a failed SDK request can be retried successfully.
- At that checkpoint, production GitHub Pages was not verified; the later live check is recorded below.

### Final verification · 21 October 2026
- Run 39611043615 on code commit 1de247444b2bda82f39e2b1892a2fbe88ec79faa completed successfully: build and generated-artifact checks, unit tests, test types, typecheck, Chromium, Firefox, all 8 WebKit shards, and the installed-PWA worker/cache update plus offline-reading test.
- The mobile pass also covers the Discover and shelf layouts at narrow widths, including the constrained full-screen drop prompt and stable responsive measurements.
- The optional multi-framework matrix (`npm run test:frameworks`) was not run. Its host runtimes are not provisioned by this recovery workflow, so it is outside the required CI gate.
- At this checkpoint the Work workspace had no local checkout and Pages verification was still outstanding. The subsequent merge and live deployment are recorded below.

### Catalog failure follow-up · 21 October 2026
- Run 39612168669 passed build, unit/type checks, PWA, Chromium, and most WebKit jobs, but Firefox found one failure in the failed-catalog-download test: the error alert did not remain visible after a 503 response.
- The catalog search effect could still have a debounced request pending when the Search form was submitted. The submit handler now cancels that timer, preventing a second request from clearing the download error. The tracked app bundles and offline asset manifest were regenerated from the CI build output.
- Run 39614776545 on commit 984a2efd4524260e40fe404cbc11240feeefddd5 passed the build/generated-artifact check, unit tests, test types, typecheck, Chromium, Firefox, all 8 WebKit shards, and the installed-PWA worker/cache update plus offline-reading test.
- The optional multi-framework matrix remains unrun because its host runtimes are not provisioned by this recovery workflow. At this catalog-failure checkpoint, local tests and direct production Pages verification were still outstanding; see the later deployment record below.

## Recovery deployment · 21 October 2026

The earlier “not deployed” bullets above describe their individual pre-deployment checkpoints. The recovery fix was later merged as PR [#3](https://github.com/bobbyfch/sela/pull/3), commit `240aaba9072e653a50cbd6e55ee783a0440a2683`. CI run [39624764621](https://github.com/bobbyfch/sela/actions/runs/39624764621) passed all 12 jobs, and Pages run [39625890669](https://github.com/bobbyfch/sela/actions/runs/39625890669) succeeded. Live smoke checks opened the homepage, `/app/`, and all 50 pages of the sample PDF. The optional framework matrix and physical-device/assistive-technology checks remain unrun.

## 22 October 2026 · Taman Bacaan MVP

### Starting point
- Local branch: `codex/reader-polish-transfer-2026-10`, based on PR [#5](https://github.com/bobbyfch/sela/pull/5), originally at `63c1e3db9a4378e2d072f410e9276150868280ff`. The latest feature code is at `281c9691afc2aa940a0c0ea71a450a192cbac512`; the PR remains open and unmerged.
- The existing P0 recovery and Pages-base work remains in place. The latest run on the prior PR head, [39655995025](https://github.com/bobbyfch/sela/actions/runs/39655995025), completed successfully; it does not include this new Taman Bacaan change.

### Changes in this slice
- Added a Taman Bacaan lens inside Discover and retained all nine source cards behind a separate in-page view. The selected view is URL-addressable with `?view=sources`.
- Added local metadata search plus category, language, content-type, rights-note and availability filters.
- Listed eight existing collections with accurate scope counts, edition/language/source notes and delivery labels. The Taman view adds no book text or cover images.
- Reused the existing local book/chapter browser. Clarified that included text enters the service-worker cache after a successful fetch; the files are allowlisted but not pre-cached in the install-time app shell.
- Fixed the compiled local-edition asset path and linked the Dhammapada reader to its exact SuttaCentral edition page.
- Added unit and browser tests, source/rights notes, and a design record. The Chromium browser job exports 375px and 1440px Playwright screenshots for review.

### Verification
- **PASS** — `npm run build` completed. It emitted the existing >500 KB app-shell warning; the prior checked-in `app/app.js` was 509,420 bytes and the regenerated file is 510,288 bytes.
- **PASS** — `npm test`: 104 tests passed, including data-count, source-rights-note, and PWA-cache-allowlist checks for Taman Bacaan.
- **PASS** — `npm run test:types`.
- **PASS** — `npm run typecheck`.
- **PASS** — `git diff --check`.
- **NOT TESTED locally** — `npm run test:browser -- tests/browser/reading-garden.spec.ts --project=chromium` could not launch: the Playwright Chromium executable is not installed in this workspace. No page assertion ran.
- **PASS in CI** — [Run 39702081623](https://github.com/bobbyfch/sela/actions/runs/39702081623) passed build/generated-artifact checks, all 104 unit tests, test types, typecheck, Chromium, Firefox, all 8 WebKit shards and installed-PWA offline/update checks.
- **PASS visual review** — the 375px and 1440px Chromium captures were reviewed from the `taman-bacaan-playwright-screenshots` artifact. The responsive test also passed at 320, 375, 414, 768 and 1440 px.

### Next action
Continue with the optional pack lifecycle and a rights-validated pack pilot. Keep PR #5 open; do not merge or deploy as part of this step.
