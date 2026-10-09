# Sela 1.0: a fresh identity

Authoritative source: [bobbyfch/sela](https://github.com/bobbyfch/sela). Demo: [bobbyfch.github.io/sela](https://bobbyfch.github.io/sela/).

Sela starts at **1.0.0** in its own repository and release namespace. FlippyPDF is retired. No new integrations should use its CDN. Legacy v3 was removed with a full local Git/release backup; previously public CDN caches cannot be recalled. Sela 1.0.0 remains immutable; current examples pin 1.1.0. New integrations should use:

```
https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.1.0/dist/js/sela.min.js
https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.1.0/dist/js/sela.compat.js
https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.1.0/dist/js/sela.esm.js
https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.1.0/dist/css/sela.min.css
```

Import `Sela` and `SelaOptions`; Vue component: `adapters/vue/SelaViewer.vue`. Package: `@bobbyfch/sela` via a GitHub tag until npm registry publication. `Flippy` globals/types and `flippy.*` dist files are compatibility aliases only, not the primary Sela API or CDN.

Overlay remains the default. Inline presentation adds `presentation: 'inline'` and a connected `container` selector/HTMLElement. Give that host an explicit height. Inline viewers do not lock body scrolling, steal focus on open, trap Tab, or receive shortcuts when focus is outside. Multiple independent embeds can coexist; only one overlay is active at a time.

The old demo shelf is retired. The new PWA is a viewer only; the bookshelf remains a dedicated extension. Extension books live under a separate extension origin and IndexedDB database; existing demo shelf data is not silently migrated. Retain original files and exported notes. The new standard and new-tab packages have separate identities and shelf storage. Sample content is replaced completely by **Yang Tidak Ikut Pulang**, a 50-page novelet with twelve chapters, four illustrations and real PDF/EPUB navigation. The CBZ is an illustration gallery, not the complete prose.
