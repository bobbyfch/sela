# Integrations

Sela provides overlay and inline viewers. One overlay is active at a time; opening another overlay closes the previous overlay. Multiple inline viewers can coexist. It does not initialize arbitrary buttons
automatically, so it does not take over application event handling.

## CI3 / Laravel

See `examples/ci3.php` and `examples/laravel.blade.php`. Use escaped HTML data
attributes or safely serialized JSON. PDF URLs do not need to end with `.pdf`.
Keep authorization on the PDF endpoint. Same-origin session cookies work as
usual; `withCredentials:true` is available for a cross-origin endpoint that
explicitly allows credentialed CORS. Range support is owned by your server.
Do not move private PDFs into GitHub Pages.

## ESM / TypeScript / bundlers

This repo is not automatically published to npm. Install from the GitHub tag:

```sh
npm install github:bobbyfch/sela#v1.1.0
```

```ts
import Sela, { type SelaOptions } from '@bobbyfch/sela';
const options: SelaOptions = {
  pdfUrl: '/api/ebook/42',
  assetBase: 'https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.1.0/dist/'
};
const viewer = new Sela(options);
await viewer.open();
// Route/component cleanup:
viewer.destroy();
```

Raw ESM imports from `dist/js/sela.esm.js` resolve assets beside that file.
Bundled imports use the pinned CDN by default. To self-host, copy the complete
`dist` folder to the application's public assets and set `assetBase` to its
HTTP URL; importing JavaScript alone does not copy the worker/font/CMap assets.
SSR import and construction are safe; call `open()` only after mounting.

## Vue 3

`adapters/vue/SelaViewer.vue` is an optional source component, requiring Vue
3 and a Vue SFC build pipeline. Its options are typed. For bundlers resolving
the relative ESM file, use its adjacent `sela.esm.d.ts` declaration.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import SelaViewer from '@bobbyfch/sela/vue';
const visible = ref(false);
const options = { pdfUrl: '/api/ebook/42', title: 'E-book' };
</script>
<template>
  <button @click="visible = true">Read</button>
  <SelaViewer v-model="visible" :options="options" @error="console.error" />
</template>
```

The adapter watches visibility and options identity; replace the options object
to reopen with a new PDF. Unmount destroys loading/render tasks. Vue is not
included in the core. The core is browser-tested; this adapter's lifecycle is
tested separately with Vue's real runtime.

## Bootstrap / Tailwind

Use your own trigger button (`btn btn-primary` or utility classes). Sela
does not include their CSS/JS or reset the host page's styles. Its modal CSS
uses dedicated classes and explicit box sizing, with inline SVG icons.
Set `theme:'light'|'dark'|'auto'`. `auto` follows system color scheme; if your
app has a theme toggle, pass its current value. Set `zIndex` for app overlays.

Custom CSS variables can be set on `.library-reader-overlay`:
`--flippy-bg`, `--flippy-panel`, `--flippy-fg`, `--flippy-button`,
`--flippy-hover`, `--flippy-border`.

## CSP / offline

The default external worker uses a module blob wrapper, as cross-origin worker
URLs cannot be passed directly to Worker. Allow `worker-src blob:` for a CDN
setup and allow the asset host in `script-src`/`style-src`. The flip engine
injects its scoped styles, so a strict CSP must allow those styles too. Do not
weaken an existing app's CSP blindly; self-host the full `dist` folder and
configure your policy appropriately. `autoStyles:false` lets the app include
the shell stylesheet itself. Full offline use also requires a reachable or
cached PDF and all referenced PDF.js assets.

## Additional client frameworks

Examples: [React](../examples/react.tsx), [Svelte](../examples/svelte.svelte), [Angular](../examples/angular.ts), [Astro](../examples/astro.astro), [Web Component](../examples/web-component.js). They own one viewer and destroy it when removed. Examples are integration recipes; only the existing Vue adapter and core are exercised against a real framework in this repository. Test your framework version and router lifecycle in your app.

For React/Next, use a client component; for Nuxt/SvelteKit/Angular SSR, call open only after mount or a browser click. Imports are SSR-safe. CSS-framework choice is independent of the reader. Web Components use standard DOM APIs without extra runtime.

## Inline presentation

Create a connected host with an explicit height, then pass `presentation: "inline", container: "#reader-host"`. Use the same options and API as overlay. Focus inside an inline reader enables its shortcuts; outside focus belongs to your app. `destroy()` removes the reader on component teardown. Do not remove the host before destroying its reader.
