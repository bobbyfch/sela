# Repository map

This map separates editable source from the files that the browser and GitHub Pages serve directly.

## Editable source

| Path | Purpose |
| --- | --- |
| `src/` | Shared reader engine, public API, document handling, and core TypeScript modules. |
| `ui/` | TSX page templates, reusable shadcn/Radix components in `ui/components/ui/`, shared social brand icons, and Tailwind/CSS source for the public site and reader app. `components.json` records the local shadcn configuration. |
| `app/library/` | TypeScript source for the local bookshelf, discovery, OPDS, settings, and reader integration. |
| `web/app/ui/` | Mantine React source for the single responsive app at `/app/`. |
| `web/app/platform/` | App-scoped PWA worker and offline registration source. |
| `app/site/` | TypeScript source for the public product demo and site behavior. |
| `web/` | Astro page source. |
| `scripts/` | Build, local server, capture, and maintenance scripts. |
| `tests/` | Unit, browser, and type-contract checks. |
| `docs/`, `examples/`, `example/`, `licenses/` | Documentation, framework samples, reader fixtures/assets, and notices. |

## Browser and release outputs

| Path | Purpose |
| --- | --- |
| `dist/` | Packaged SDK, format adapters, styles, and vendor assets. |
| `library/` | Generated browser modules and assets consumed by the reader routes. |
| `site/` | Public-site CSS/JavaScript outputs plus static images, fonts, and flags. |
| `app/` root files | The single published `/app/` entry, generated JavaScript, manifest, service worker, and third-party notices. |

`scripts/build.ts`, `offline-assets.json`, the service workers, and `.github/workflows/pages.yml` share responsibility for these paths. Move or rename a generated directory only as a coordinated change to its build output, URL references, offline cache, and Pages staging.

`node_modules/`, `.astro/`, `.build/`, and `test-results/` are dependency, build, or test artifacts; inspect their owner and purpose before cleaning them.
