# Sela 1.0: a fresh identity

Authoritative source: [bobbyfch/sela](https://github.com/bobbyfch/sela). Demo: [bobbyfch.github.io/sela](https://bobbyfch.github.io/sela/).

Sela starts at **1.0.0** in its own repository and release namespace. FlippyPDF is retired. No new integrations should use its CDN. Legacy v3 was removed with a full local Git/release backup; previously public CDN caches cannot be recalled. Sela 1.0.0 remains immutable; current examples pin 1.2.0. New integrations should use:

```
https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.2.0/dist/js/sela.min.js
https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.2.0/dist/js/sela.compat.js
https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.2.0/dist/js/sela.esm.js
https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.2.0/dist/css/sela.min.css
```

Import `Sela` and `SelaOptions`; Vue component: `adapters/vue/SelaViewer.vue`. Package: `@bobbyfch/sela` via a GitHub tag until npm registry publication. `Flippy` globals/types and `flippy.*` dist files are compatibility aliases only, not the primary Sela API or CDN.

Overlay remains the default. Inline presentation adds `presentation: 'inline'` and a connected `container` selector/HTMLElement. Give that host an explicit height. Inline viewers do not lock body scrolling, steal focus on open, trap Tab, or receive shortcuts when focus is outside. Multiple independent embeds can coexist; only one overlay is active at a time.

Sela now has three products: Viewer CDN, Home desktop extension and Bookshelf mobile app. Existing Home extension shelves are retained under their original identities/database. The new mobile app uses its own Pages-origin IndexedDB; export/import original files to transfer. Historical Standard remains a compatibility edition. FlippyPDF main restores its original v1.0.0 assets with a migration landing page; historical tags remain unchanged.
