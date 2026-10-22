# Contributing to Sela

Small, reproducible improvements are welcome. Before you start, read [current format limits](docs/formats.md), [compatibility](docs/compatibility.md) and [reading tools](docs/reading-experience.md). Everyone taking part follows the [code of conduct](CODE_OF_CONDUCT.md).

## Report a problem

Open a [bug report](https://github.com/bobbyfch/sela/issues/new/choose) and include:

- browser and OS versions
- document format and reading mode
- a minimal configuration
- expected and actual behaviour
- reproduction steps

Use a small, non-sensitive document you may legally share. Do not attach intranet documents, tokens or authentication headers. Report security problems privately, see [SECURITY.md](SECURITY.md).

## Set up

Requirements: Node.js 22.18 or newer (24 recommended) and npm.

```sh
npm ci
npm run typecheck
npm run build
npm test
npm run test:types
npm run test:browser
npm run serve
```

Browser tests use Chromium, Firefox and WebKit in CI, and Edge when installed locally on Windows. Run `npx playwright install` when a browser is missing. DjVu's integration test loads the official external decoder and needs network access. Emulated viewports are not physical devices: say so when you report results.

If `npm ci` fails with `EPERM` on a native `.node` file, an editor or language server is holding it. Close it and retry, or run `npm install`.

## Where things live

| Path | What belongs there |
| --- | --- |
| `src/` | Shared viewer engine and public API |
| `app/library/` | Library, catalogue, backup, reading-pack and reader integration services |
| `web/app/ui/` | The installed React app |
| `app/site/`, `ui/` | Public site behaviour and shared styles |
| `library/packs/` | Hosted reading packs and their generated `index.json` |
| `scripts/` | Build, local server and content importers |
| `tests/` | Unit, browser and type-contract checks |

The full map is in [Repository map](docs/repository-map.md). Generated files (`app/app.js`, `app/chunks/`, `dist/`, `library/*.js`, `offline-assets.json`, service workers) must match a clean `npm run build`. Commit them with the change that produced them.

## Changing code

- Keep browser asset URLs, offline cache boundaries, framework independence and the public Viewer API stable.
- Prefer clear names and small functions over comments. Do not add comments that restate the code.
- New features need accessible names, keyboard behaviour, cancellation and cleanup, and documented resource limits.
- Add dependencies with pinned versions, a notice entry, and an explicit licence boundary.
- Material changes belong to app and reader chrome, never to document canvases or gesture layers.
- Use the shared icon and control helpers, and keep accessible names when you replace text with an icon.
- Refresh product screenshots with `npm run screenshots` when the interface changes.

## Changing reading packs

Read [Faith readings: data contract](docs/faith-readings-data-contract.md) first. In short:

1. Check the licence of the exact edition. Free to read is not permission to copy.
2. Add or update the importer in `scripts/import-readings.ts`, then record the source in [Faith readings: sources](docs/faith-readings-sources.md).
3. Write a notice file under `licenses/`.
4. Run `node --experimental-strip-types scripts/packs.ts --write`, then `npm test`.

Never edit scripture text by hand. Text that Sela does not host (Quran editions and hadith) must stay unchanged, credited and versioned.

## Commits and pull requests

- Use short, imperative commit subjects with a type: `feat:`, `fix:`, `test:`, `docs:`, `build:`, `ci:`.
- One logical change per pull request. Describe what changed and why, what you verified, and what you could not verify.
- Every change that touches behaviour needs a test. Bug fixes need a regression test that fails without the fix.
- Read [Deployment](docs/deployment.md) before you touch a workflow or the Pages packaging.
- A pull request is ready when `npm run typecheck`, `npm test` and the browser tests pass, and the build output is committed.
