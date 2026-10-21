# Reader deployment regression

## Verified baseline

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

## Release verification

This branch must pass its complete Viewer checks, including the real PWA update browser job, before deployment is considered. Production URL, SDK, lazy chunks, and PDF worker checks are not claimed until measured against a live deployment. A successful build alone is not release evidence.
