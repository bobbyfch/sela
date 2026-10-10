# Validation

Run `npm run build`, `npm test`, `npm run test:types` and `npm run test:browser`. Browser scenarios cover navigation, formats, archives, errors, inline embeds, app palettes, library backups and reader controls. CI runs Chromium, Firefox and WebKit.

Catalog and weather behavior tests use mocked download/API endpoints, including failures and cache behavior. Source URLs are checked separately for availability and CORS. Physical devices, installed PWA behavior, screen readers and operating-system voices need separate validation. See [compatibility](compatibility.md) and [catalog sources](library-sources.md).
