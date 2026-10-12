# Contributing to Sela 🌿

Small, reproducible improvements are welcome. Start with [current format limits](docs/formats.md), [compatibility](docs/compatibility.md) and [reading tools](docs/reading-experience.md).

## Report a problem

Include browser/OS versions, document format, reading mode, a minimal configuration, expected/actual behavior and reproduction steps. Use a small non-sensitive document you can legally share; do not attach intranet documents, tokens or authentication headers. For visual problems, add desktop/mobile screenshots and the theme in use.

## Develop

```sh
npm ci
npm run typecheck
npm run build
npm test
npm run test:types
npm run test:browser
npm run serve
```

Browser checks use Chromium in CI and Edge when installed locally on Windows. Run `npx playwright install chromium` when needed. DjVu's integration test loads the official external decoder and needs network access. Do not interpret emulated viewports as physical device validation.

Use Node.js 22.18 or later. Edit TypeScript in `src/` for the shared viewer and `app/library/`, `app/mobile/`, `app/site/` for application behavior. Edit public/reader markup in `ui/pages/*.tsx` and shared materials in `ui/tokens.css`; their HTML/CSS outputs are generated. Other CSS/assets and document fixtures retain their native formats. Tooling and tests are TypeScript too. Browser-facing `.js` files in `dist/`, `library/`, `mobile/`, `site/` and `examples/web-component.js` are generated; edit their `.ts` source and run `npm run build`.

The private library is a PWA, sharing the CDN viewer. Keep browser asset URLs, offline cache boundaries, framework independence and the public PDF API stable. Generated assets must match a clean rebuild. TypeScript declarations are generated from `src/public-api.ts`; the implementation factory is checked against that contract. See [TypeScript migration](docs/typescript-migration.md) for compiler scope and remaining dynamic types. User browser profiles must not be modified by tests.

Add new dependencies with pinned versions and notices. Keep decoder license boundaries explicit. New features should include accessible labels, keyboard behavior, cleanup/cancellation and documented resource limits. State what was verified and what remains untested in your pull request.

Use the shared local icon/control helpers for app actions and preserve accessible names when replacing text with icons. Material changes belong to app/reader chrome, never document canvases or gesture layers. Refresh product screenshots with `npm run screenshots`; optional real host matrix checks are described in [framework validation](docs/framework-validation.md).
