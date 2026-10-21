# Reader deployment regression

## Verified baseline

- Repository: \`bobbyfch/sela\`
- Main HEAD checked: \`14f7889bfb950775abbf72875863bacf1452c990\`
- The app is served at \`/app/\`; the GitHub Pages project root is \`/sela/\`.
- Before this change, \`web/app/ui/reader-sdk.ts\` resolved the SDK against \`window.location.origin\` using a leading \`/dist\` path. That points to \`/dist/js/sela.esm.js\` at the host root and escapes the project prefix on GitHub Pages.
- Reader-local CSS and engine assets use \`../dist/\` from the app base. The SDK entry now uses the same document-relative base and a URL resolver covered for root hosting, a local subpath, and the GitHub Pages subpath.

## Recovery behavior

The app now bounds IndexedDB file reads, byte preparation, and engine imports to 20 seconds; cancels its wait when the reader screen unmounts; shows a bounded loading status; and offers retry or return-to-shelf actions after recoverable failures. A missing local file is identified separately and directs the reader to re-import or restore a backup. The existing SDK contract and shelf schema are unchanged.

## Regression coverage

- \`tests/unit/reader-sdk.test.ts\`: deterministic root, local subpath, and Pages URL cases.
- \`tests/browser/app-reader.spec.ts\`: request failure, visible recovery action, then successful retry.
- \`tests/browser/pwa.spec.ts\`: separate Chromium project with service workers enabled; install, open a local sample, bookmark a page, go offline, reload, and confirm the page and bookmark survive.
- The regular browser projects remain service-worker-blocked for deterministic runs.

## Release verification

This branch must pass its complete Viewer checks, including the PWA browser job, before a deployment is considered. Production URL, SDK, lazy chunks, and PDF worker checks are not claimed until measured against a live deployment. A successful build alone is not release evidence.
