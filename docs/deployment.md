# Deployment

Sela is a static site. GitHub Pages serves it from the `main` branch through two workflows.

## Pipeline

| Workflow | Runs on | What it does |
| --- | --- | --- |
| **Viewer checks** (`ci.yml`) | Every pull request and every push to `main` | Builds, checks that generated files match a clean rebuild, runs unit and type tests, verifies the reading-pack catalogue, then runs the browser suites (Chromium, Firefox, WebKit in 8 shards) and the real service-worker suite |
| **GitHub Pages** (`pages.yml`) | After Viewer checks succeeds on `main`, or by hand | Downloads the site package that Viewer checks validated, deploys it, then runs a live check |

On a push to `main`, Viewer checks packages the site with `scripts/package-pages.ts` and uploads it. Pages deploys that exact artifact, so what was tested is what is served. Newer runs of the same pull request cancel older ones. Every job has a timeout.

## Live check

After each deploy the `verify` job runs `scripts/verify-deployment.ts` against the live URL. It retries for up to three minutes while Pages propagates, and fails the run if any of these is wrong:

- the site, the app, the Viewer scripts, both service workers and the offline manifest do not answer with the right content type
- the reading-pack catalogue does not validate
- any pack payload is missing, has a different size, or has a different SHA-256 than the catalogue lists
- any pack licence notice is missing

Run it yourself against any copy of the site:

```sh
node --experimental-strip-types scripts/verify-deployment.ts https://bobbyfch.github.io/sela/
```

## Package locally

```sh
npm run build
node --experimental-strip-types scripts/package-pages.ts pages-site
```

`pages-site/` is exactly what Pages serves. It is about 50 MB, well under the 1 GB Pages limit. Reading packs are optional downloads and are never precached by the service worker.

## Deploy by hand

Open **Actions → GitHub Pages → Run workflow**. This checks out `main`, builds it, packages it and deploys it. Use it to redeploy without a new commit.

## Roll back

Pages has no separate release history, so roll back through Git:

1. Revert the faulty commit on `main` (`git revert <sha>`) and push it through a pull request, or
2. Open **Actions → GitHub Pages → Run workflow** on a known-good commit.

Installed copies update the next time the app loads. The service worker keeps the previous shell until the new one is ready, and local books, notes and downloaded readings are not touched by an update.

## Dependency updates

Dependabot opens weekly pull requests for GitHub Actions (pinned by commit SHA) and npm packages. They go through the same checks as any other pull request.
