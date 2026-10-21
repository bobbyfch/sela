# SELA work progress

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
- Branch CI and browser verification are pending.
- Live production path and deployment are not yet verified.


### CI follow-up · 21 October 2026
- Run 39593295854 at commit ef05d5afed6328f7ba4a1c57c45424cda51935b3: build/generated-artifact check, unit tests, test types, and typecheck passed.
- The first enabled-service-worker test stopped before browser interaction because its matcher assumed single-quoted worker constants; the generated worker uses double quotes. The test is being corrected to support the emitted format. The old-to-new worker behavior remains unverified until the rerun passes.


### CI browser follow-up · 21 October 2026
- Run 39593295854: the WebKit layout suite exposed remaining 320px Discover internal overflow (488px scroll width inside a 320px container). The first fix did not remove the underlying overflowing descendant; the next regression run adds the descendant measurements needed to target it.
- The new SDK failure test's sample button matcher also needed the app's Indonesian labels for WebKit's default locale. That matcher now covers both English and Indonesian.
- The separate PWA rerun is in progress; Viewer/PWA release gates remain open.


### PWA locale follow-up · 21 October 2026
- Run 39593650404 reached the real update notice successfully. The app localized it to Indonesian from the browser's default preferences, while the test expected English. The PWA test now sets English explicitly before app startup so it checks one stable copy rather than depending on the CI locale.
- The old-to-new cache replacement and offline reopen assertions still need a passing run.
