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
- `app/library/` contains local-first book storage, catalogs, backups, and reader integration modules.
- `web/app/ui/` is the Mantine 9.7 React application and builds only to `/app/`. The public page compiles to `site/public.css`; the embeddable reader remains at `dist/css/sela.app.css`.
- The standalone CDN viewer is compiled through `ui/viewer-tailwind.css` into `dist/css/sela.min.css`. It ships plain compiled CSS, scoped viewer utilities, and no Tailwind runtime or host-framework dependency, so React, Vue, PHP, static HTML, and other hosts can embed it without adopting Sela's build stack.
- `app/`, `site/`, `library/`, and `dist/` contain browser-ready assets and release output. The installed React application is emitted only under `app/`.
- `scripts/` and `tests/` contain build tools and verification.

Run `npm run build` after editing source. It updates generated runtime versions, public page HTML, distribution bundles, manifests, and cache identities. Keep the CDN paths stable and check the generated files into release changes. `package.json` is the single release-version authority; published tags and release assets are immutable.

## Integration and accessibility

The viewer API and generated declarations are checked together. Preserve its framework-neutral entry points, local-first document handling, existing asset URLs, keyboard controls, visible focus, reduced-motion behavior, and responsive controls. Run the browser suite after changing a reader, library, offline, or public-page flow. See [framework integration checks](framework-validation.md), [browser compatibility](compatibility.md), and [contribution guidance](../CONTRIBUTING.md).
