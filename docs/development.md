# Development

Sela ships a framework-independent document viewer, a personal-reader web app, and a public product site. The browser receives generated JavaScript and CSS; source modules and application logic are maintained in TypeScript. The viewer keeps its existing CDN entry points and does not require React or Node.js in the host site.

## Requirements

- Node.js 22.18 or newer
- npm
- A supported desktop browser for the browser test suite

## Local workflow

```sh
npm ci
npm run typecheck
npm run build
npm test
npm run test:types
npm run test:browser
npm run serve
```

Use `npm run serve` to open the public site and Reader locally. `npm run screenshots` captures product screenshots from the running app. Framework smoke checks use disposable files under `.build/` and can be run with `npm run test:frameworks` when their optional host runtimes are installed.

## Source and generated files

- `src/` contains the shared reader and public SDK.
- `app/` contains the Reader application, storage, and workers.
- `ui/` contains page templates and Tailwind v4 entrypoints and reusable component utilities. Public pages compile to `site/public.css`, the app to `site/mobile-app.css`, and the app's embedded reader to `dist/css/sela.app.css`.
- The standalone CDN viewer is compiled through `ui/viewer-tailwind.css` into `dist/css/sela.min.css`. It ships plain compiled CSS, scoped viewer utilities, and no Tailwind runtime or host-framework dependency, so React, Vue, PHP, static HTML, and other hosts can embed it without adopting Sela's build stack.
- `site/`, `mobile/`, `library/`, and `dist/` contain browser-ready assets and release output.
- `scripts/` and `tests/` contain build tools and verification.

Run `npm run build` after editing source. It updates generated runtime versions, public page HTML, distribution bundles, manifests, and cache identities. Keep the CDN paths stable and check the generated files into release changes. `package.json` is the single release-version authority; published tags and release assets are immutable.

## Integration and accessibility

The viewer API and generated declarations are checked together. Preserve its framework-neutral entry points, local-first document handling, existing asset URLs, keyboard controls, visible focus, reduced-motion behavior, and responsive controls. Run the browser suite after changing a reader, library, offline, or public-page flow. See [framework integration checks](framework-validation.md), [browser compatibility](compatibility.md), and [contribution guidance](../CONTRIBUTING.md).
