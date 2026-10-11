# Development

```sh
npm ci
npm run build
npm test
npm run test:types
npm run test:browser
```

`package.json` → `version` is the single release-version authority. Change it, then run `npm run build`. The build generates runtime version modules, both page headers, structured metadata, asset manifests, cache identities and pinned CDN installation examples. Do not edit generated versions or `index.html` / `mobile/index.html` directly; their templates live in `site/index.html` and `site/mobile.html`.

Sela starts with `0.9.0-beta.0`; public headers show `0.9 beta`. Releases containing a prerelease suffix are published as GitHub prereleases. Update checks include beta releases for beta installations and stable releases for stable installations. Subsequent releases use SemVer. Published release assets and tags are immutable.

Source is JavaScript with ESM modules. Type declarations support consumers; they do not imply a TypeScript implementation. Run a build before testing imports from the generated distribution. Browser tests cover responsive reader, library, formats and offline/update behavior; real hardware validation is separate.
