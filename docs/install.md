# Install Sela 1.2

[Choose Reader or Viewer](https://bobbyfch.github.io/sela/#products) · [Install Reader web app](pwa.md)

## Quick start

```html
<script src="https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.3.1/dist/js/sela.min.js"></script>
<button id="read" type="button">Read PDF</button>
<script>
const reader = new Sela({
  pdfUrl: '/books/story.pdf', title: 'My story',
  mode: 'book', // book | single | webtoon | manga
  theme: 'auto', language: 'en', soundEnabled: false
});
document.querySelector('#read').addEventListener('click', () => {
  reader.open().catch(error => console.error(error));
});
</script>
```

CSS loads automatically on first open. For explicit loading/CSP:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.3.1/dist/css/sela.min.css">
```

Pin releases in production. New CDN: `bobbyfch/sela@v1.3.1`; historical FlippyPDF tags are not rewritten. [Migration](docs/migration.md).

### ESM / TypeScript

```sh
npm install github:bobbyfch/sela#v1.3.1
```

```ts
import Sela from '@bobbyfch/sela';
const reader = new Sela({ pdfUrl: '/story.pdf', mode: 'manga', filter: 'grayscale' });
await reader.open();
reader.next().setFilter('sepia');
reader.addEventListener('pagechange', event => console.log(event.detail.page));
reader.destroy(); // component cleanup
```

Bundled imports use the pinned CDN for renderer assets. Self-hosting/offline: serve all of `dist/` and set `assetBase: '/assets/sela/dist/'`. Keep module and worker versions matched.

### Older browsers

Use `dist/js/sela.compat.js` instead of the main script. This ES5 entry checks capabilities before loading the modern viewer:

```html
<script src="https://cdn.jsdelivr.net/gh/bobbyfch/sela@v1.3.1/dist/js/sela.compat.js"></script>
<script>
document.getElementById('read').onclick = function () {
  var start = function () { new Sela({ pdfUrl: '/story.pdf' }).open(); };
  if (window.SelaReady) SelaReady.then(start).catch(function () {
    window.location.assign('/story.pdf');
  }); else start();
};
</script>
```

Keep a normal PDF link for disabled JavaScript and load failures. Very old browsers receive the original PDF. [Verified capabilities and limits](docs/compatibility.md).

## Embed or overlay

Overlay is the default. Inline embeds keep the same navigation, themes, filters, search, narration, notes and fullscreen controls. Give the host a height; multiple inline readers can coexist. Keyboard shortcuts act only when focus is inside that embed, and page scrolling stays available.

```html
<div id="reading-room" style="height:640px"></div>
<script>
new Sela({ url: '/story.pdf', presentation: 'inline', container: '#reading-room',
  theme: 'auto', language: 'auto' }).open().catch(console.error);
</script>
```


For protected endpoints and framework integration, see [integrations](integrations.md).
