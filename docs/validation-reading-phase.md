# Validation

Run `npm run build`, `npm test`, `npm run test:types` and `npm run test:browser`. Browser scenarios cover navigation, formats, archives, errors, inline embeds, app palettes, library backups and reader controls. CI runs Chromium, Firefox and WebKit.

Cloud connector tests use mocked provider endpoints and SDKs. Real OAuth login requires a registered application and an account consent session; automated mocks do not establish live provider compatibility. Physical devices, installed PWA behavior, screen readers and operating-system voices need separate validation. See [compatibility](compatibility.md) and [cloud setup](cloud.md).
