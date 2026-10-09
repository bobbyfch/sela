# Contributing to Sela 🌿

Small, reproducible improvements are welcome. Start with [current format limits](docs/formats.md), [compatibility](docs/compatibility.md) and the [proposed roadmap](docs/roadmap.md). A roadmap item is not a promise that it will be implemented.

## Report a problem

Include browser/OS versions, document format, reading mode, a minimal configuration, expected/actual behavior and reproduction steps. Use a small non-sensitive document you can legally share; do not attach intranet documents, tokens or authentication headers. For visual problems, add desktop/mobile screenshots and the theme in use.

## Develop

```sh
npm ci
npm run build
npm test
npm run test:types
npm run test:browser
npm run serve
```

Browser checks use Chromium in CI and Edge when installed locally on Windows. Run `npx playwright install chromium` when needed. DjVu's integration test loads the official external decoder and needs network access. Do not interpret emulated viewports as physical device validation.

Edit `src/` for runtime changes and `site/` for the playground; regenerate `dist/` and root `index.html` with the build. Generated assets must match a clean rebuild. Keep historical CDN paths and release tags intact, preserve the PDF API, and make optional features lazy. Use behavior tests for relevant changes; do not add broad framework dependencies to the core.

The private library belongs in `extension/`, separately from the public viewer playground and core. `npm run package:extension` creates Standard/New Tab packages; `node scripts/test-extension.mjs` exercises the Chromium New Tab edition in a disposable browser profile, including actual offline reading. User browser profiles must not be modified by tests.

Add new dependencies with pinned versions and notices. Keep decoder license boundaries explicit. New features should include accessible labels, keyboard behavior, cleanup/cancellation and documented resource limits. State what was verified and what remains untested in your pull request.
