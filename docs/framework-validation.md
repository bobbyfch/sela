# Runtime integration validation

The seven host checks below were rerun for the personal-reader changes on 12 October 2026. See [Personal reader delivery](personal-reader-delivery.md) for app/browser validation and external-service limits.

Framework smoke apps live in ignored `.build/`; they are never shipped with the Reader or npm SDK. Start `npm run serve` before running component checks. Scripts create disposable browser contexts and stop the servers they start. Local port ranges: 4181–4185.

Verified on this Windows host:

| Host | Runtime | Result |
| --- | --- | --- |
| Next.js | 16.4.0 / React 19.3 / default Turbopack | SSR, client SDK import, self-hosted PDF open/close |
| Nuxt | 4.6.1 / Vue 3.5.43 | SSR, client SDK import, self-hosted PDF open/close |
| Svelte | 5.57.2 compiler and browser runtime | actual example mount, PDF open/close |
| Angular | 22.2.2 JIT browser runtime | actual standalone component, PDF open/close |
| CodeIgniter 3 | 3.1.13 / PHP 8.1.34 | real controller/view and self-hosted IIFE PDF open/close |
| CodeIgniter 4 | 4.7.5 / PHP 8.5.10 | real controller/view and self-hosted IIFE PDF open/close |
| Laravel | framework 13.35.0 / PHP 8.5.10 | real Blade view, named PDF route and self-hosted IIFE open/close |
| Astro / React app | repository versions | production build plus browser regression suite |
| Vue / HTML / ESM / Web Component | existing examples | repository browser compatibility suite |

These checks certify these specific host paths, not every version, authentication setup, CSP or production server. CDN behavior is tested with cross-origin fixtures; publication is separate.

Prepare optional JS host dependencies without changing application dependencies:

```powershell
npm install --prefix .build/framework-matrix --no-audit --no-fund --package-lock=false next@16.4.0 nuxt@4.6.1 react@19.3.0 react-dom@19.3.0 vue@3.5.43 svelte@5.57.2 @angular/core@22.2.2 @angular/compiler@22.2.2 @angular/common@22.2.2 @angular/platform-browser@22.2.2
node --experimental-strip-types scripts/framework-matrix.ts
node --experimental-strip-types scripts/component-matrix.ts
```

PHP checks expect Composer projects under `.build/ci3-host`, `.build/ci4-host`, `.build/laravel-host`. Create them using `codeigniter/framework:3.1.13`, `codeigniter4/appstarter:4.7.5` and `laravel/laravel:13.11.0`, `--no-dev --prefer-dist --no-interaction`. For CI3 use `--no-scripts`: its obsolete development-only `sed` hook assumes a Unix shell. Runtime files are installed without that hook. The script's PHP paths reflect this host's Laragon installation; adjust them for another machine.

```powershell
node --experimental-strip-types scripts/php-host-matrix.ts
```

Machine-readable results: `framework-runtime-results.json`, `component-runtime-results.json`, `php-runtime-results.json`. The Next/Nuxt examples accept `assetBase` for self-hosting and disable opening until their lazy import completes. Runtime-import directives in the built SDK must survive minification; Next/Turbopack exposed and verified this requirement.

The global Firefox installation failed at executable launch with `spawn UNKNOWN`. A fresh isolated Playwright Firefox download under `.build/browser-cache` launches successfully. The local Playwright configuration prefers that verified executable when present; CI uses its normal fresh installation. Chromium/WebKit mobile simulation cannot replace physical POCO F6/iOS validation of hardware Back, native fullscreen, battery and OS behavior.
