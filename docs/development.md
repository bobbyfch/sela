# Development

The 12 October personal-reader implementation and its validation boundaries are recorded in [Personal reader delivery](personal-reader-delivery.md). The [brainstorming record](visual-brainstorm.md) retains the original decisions.

```sh
npm ci
npm run typecheck
npm run build
npm test
npm run test:types
npm run test:browser
```

`package.json` → `version` is the single release-version authority. Change it, then run `npm run build`. The build generates runtime version modules, both page headers, structured metadata, asset manifests, cache identities and pinned CDN installation examples. Do not edit generated versions or `index.html` / `mobile/index.html` directly; their templates live in `ui/pages/public.tsx` and `ui/pages/reader.tsx`.

Sela is at `0.9.0-beta.2`; public headers identify the beta channel. Releases containing a prerelease suffix are published as GitHub prereleases. Update checks include beta releases for beta installations and stable releases for stable installations. Subsequent releases use SemVer. Published release assets and tags are immutable.

Sources are TypeScript ESM modules: `src/` contains the shared viewer, `app/` the application and workers, and `scripts/`/`tests/` TypeScript tooling and tests. Node.js 22.18+ runs local TypeScript tools; browsers receive generated JavaScript at the existing URLs. The compiler emits declarations from `src/public-api.ts`, and the viewer factory is checked against that contract. [Migration scope and remaining dynamic types](typescript-migration.md).

Run a build before testing generated distribution assets. Browser tests cover responsive reader, library, formats and offline/update behavior; real hardware validation is separate.

## Modern build

Vite 8 builds the framework-independent SDK and React 19 app shell. Astro 7 generates the public/reader pages from `web/pages/` and `ui/pages/`; the public page sends static HTML and its existing native interactions. The custom JSX renderer has been removed. `app/mobile/react-app.tsx` owns React startup and navigation; engine/storage controllers stay shared.

TypeScript 7 runs checks. `typescript-api` is a pinned TypeScript 6 development-only bridge for declaration emission and AST tooling; TypeScript 7 no longer exposes the old compiler API at its package root. Scripts explicitly select the TypeScript 7 CLI to avoid alias bin ambiguity. `.build/` and `.astro/` are ignored staging outputs; Astro never clears the repository or `dist/`.

After `npm run serve`, run `npm run profile` for local fixture open/close measurements at 393x852. Results are saved to `.build/profiles/latest.json`. This desktop measurement does not certify physical Android/iOS performance.

Material/control styling is maintained in `ui/app-materials.css`, copied to the app and incorporated into optional viewer CSS with package-local textures. Use `npm run screenshots` for actual app captures, and the isolated matrix described in [framework validation](framework-validation.md) for host smoke checks. Generated JS remains a distribution artifact; obsolete source alternatives and unused artwork are removed.
