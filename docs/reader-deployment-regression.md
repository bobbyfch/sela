# Reader deployment regression

## Historical baseline before recovery

- Repository: bobbyfch/sela
- Main HEAD checked: 14f7889bfb950775abbf72875863bacf1452c990
- The app is served at /app/; the GitHub Pages project root is /sela/.
- Before this change, web/app/ui/reader-sdk.ts resolved the SDK against window.location.origin using a leading /dist path. That points to /dist/js/sela.esm.js at the host root and escapes the project prefix on GitHub Pages.
- Reader-local CSS and engine assets use ../dist/ from the app base. The SDK entry now uses the same document-relative base and a URL resolver covered for root hosting, a local subpath, and the GitHub Pages subpath.
- The default Playwright projects block service workers for deterministic tests. Existing tests/browser/pwa.spec.ts overrides that setting and already covers first install plus offline reading. The missing regression was an actual old-worker to new-worker update of the app at the same scope.

## Recovery behavior

The app now bounds IndexedDB file reads, byte preparation, and engine imports to 20 seconds; cancels its wait when the reader screen unmounts; shows a bounded loading status; and offers retry or return-to-shelf actions after recoverable failures. A missing local file is identified separately and directs the reader to re-import or restore a backup. The existing SDK contract and shelf schema are unchanged.

## Regression coverage

- tests/unit/reader-sdk.test.ts: deterministic root, local subpath, and Pages URL cases.
- tests/browser/app-reader.spec.ts: failed SDK request, visible recovery action, then successful retry.
- tests/browser/pwa.spec.ts: preserved original real service-worker offline reading tests.
- tests/browser/pwa-update.spec.ts: separate Chromium project that activates a newer worker on the existing app scope, verifies cache replacement, then opens a locally stored book offline.
- Regular browser projects remain service-worker-blocked.

## Release verification · 21 October 2026

- Recovery fix merged to `main` as `240aaba9072e653a50cbd6e55ee783a0440a2683`.
- CI run [39624764621](https://github.com/bobbyfch/sela/actions/runs/39624764621) passed all 12 required jobs, including build/generated-artifact, unit, type, Chromium, Firefox, eight WebKit shards, and the enabled-service-worker update/offline-reading check.
- Pages run [39625890669](https://github.com/bobbyfch/sela/actions/runs/39625890669) deployed the merge commit successfully.
- Live smoke checks opened the project homepage, `/app/`, and the “Yang Tidak Ikut Pulang” sample PDF; all 50 pages rendered.

These checks confirm the deployed app route and sample PDF path. Physical-device installation and the full supported-format matrix still need their own release review.

## If it comes back

1. In DevTools, Network, filter by `sela.esm`. Read the full resolved URL and status.
2. In Application, Service Workers, confirm the controlling worker and cache name match the deployed version.
3. Do not clear IndexedDB. Shelf data lives there. Use the in-app retry action, which reloads the engine only.

## Local re-verification · 22 October 2026

Run on a Windows checkout of `main` at `b32619a` (PR #3 and #4 merged): `npm run typecheck` PASS, `npm test` PASS, `npm run build` PASS,
full Chromium project 156/156 PASS, `chromium-pwa` project PASS. See [faith-readings-design.md](faith-readings-design.md) for the later faith readings work.
`tests/browser/pwa-readings.spec.ts` adds a real-service-worker offline reload of an installed reading pack.
