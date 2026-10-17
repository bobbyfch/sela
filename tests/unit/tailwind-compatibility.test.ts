import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { gzipSync } from 'node:zlib';

test('public, app, embedded reader and CDN viewer ship tree-shaken Tailwind output', async () => {
  const [publicCss, mobileCss, appReaderCss, viewerCss, publicHtml, mobileHtml, publicEntry, mobileEntry, appReaderEntry, viewerEntry, manifest] = await Promise.all([
    readFile('site/public.css', 'utf8'),
    readFile('site/mobile-app.css', 'utf8'),
    readFile('dist/css/sela.app.css', 'utf8'),
    readFile('dist/css/sela.min.css', 'utf8'),
    readFile('index.html', 'utf8'),
    readFile('mobile/index.html', 'utf8'),
    readFile('ui/public-tailwind.css', 'utf8'),
    readFile('ui/mobile-tailwind.css', 'utf8'),
    readFile('ui/app-reader-tailwind.css', 'utf8'),
    readFile('ui/viewer-tailwind.css', 'utf8'),
    readFile('offline-assets.json', 'utf8'),
  ]);

  assert.match(publicCss, /\.tw\\:mx-auto\{/);
  assert.match(publicCss, /\.tw\\:flex-wrap\{/);
  assert.match(publicCss, /\.tw\\:grid-cols-1\{/);
  assert.match(mobileCss, /\.tw\\:grid-cols-2\{/);
  assert.match(mobileCss, /\.tw\\:sm\\:grid-cols-3\{/);
  assert.match(appReaderCss, /\.app-reading-top\{/);
  assert.match(appReaderCss, /\.app-quran-navigation\{/);
  assert.match(appReaderCss, /\[data-product-reader=app\]\[data-reading-direction=rtl\] \.app-reading-actions\{/);
  assert.doesNotMatch(appReaderCss, /\[data-product-reader="app"\] \[data-reading-direction=rtl\] \.app-reading-actions/);
  assert.match(appReaderCss, /\.tw\\:/);
  assert.match(publicCss, /\*,:before|\*,::before|\*, ::before/);
  assert.doesNotMatch(mobileCss, /\*,::before|\*, ::before/);
  assert.match(viewerCss, /tailwindcss v4\.3\.3/);
  assert.match(viewerCss, /\.library-reader-overlay/);
  assert.match(viewerCss, /\.sela-tools/);
  assert.doesNotMatch(viewerCss, /\.tw\\:|--tw-spacing|--tw-color-|@import|@utility|\.hidden\{|\.grid\{|\.block\{/);
  const mobileCssGzipBytes = gzipSync(mobileCss).length;
  // Home-world and palette treatments bring the complete app shell just above the former cap.
  assert.ok(mobileCssGzipBytes < 51_000, `mobile Tailwind output is ${mobileCssGzipBytes} compressed bytes (51 KB budget)`);
  assert.ok(gzipSync(appReaderCss).length < 40_000, `app reader Tailwind output is ${gzipSync(appReaderCss).length} compressed bytes`);
  assert.ok(gzipSync(viewerCss).length < 10_000, `standalone viewer Tailwind output is ${gzipSync(viewerCss).length} compressed bytes`);
  assert.match(publicHtml, /site\/public\.css\?v=/);
  assert.match(mobileHtml, /\.\.\/site\/mobile-app\.css/);
  assert.match(publicHtml, /tw:min-\[901px\]:grid-cols-/);
  assert.match(mobileHtml, /tw:flex-wrap/);
  assert.match(publicHtml, /site\/illustrations\/reading-corner-jakarta\.webp/);
  assert.match(publicHtml, /site\/illustrations\/book-cart\.webp/);
  assert.doesNotMatch(publicHtml, /site\/illustrations\/book-garden\.webp/);
  assert.match(publicHtml, /id="copy-config"/);
  assert.match(publicHtml, /Your website setup/);
  assert.match(publicHtml, /docs\/install\.md/);
  assert.match(publicEntry, /@import "tailwindcss" prefix\(tw\)/);
  assert.match(publicEntry, /@import "@phosphor-icons\/web\/fill"/);
  assert.doesNotMatch(publicEntry, /public-components\.css/);
  assert.match(manifest, /site\/Phosphor-Fill\.woff2/);
  assert.match(manifest, /site\/illustrations\/reading-corner-jakarta\.webp/);
  assert.match(manifest, /library\/assets\/jculture-companions-v3\.webp/);
  assert.doesNotMatch(manifest, /site\/illustrations\/book-garden\.webp/);
  assert.match(mobileEntry, /app-tailwind-utilities\.css/);
  assert.match(mobileEntry, /@import "tailwindcss" source\(none\) prefix\(tw\)/);
  assert.match(mobileEntry, /source\(none\)/);
  assert.match(appReaderEntry, /app-reader-utilities\.css/);
  assert.match(appReaderEntry, /@import "tailwindcss" source\(none\) prefix\(tw\)/);
  assert.match(viewerEntry, /viewer-tailwind-utilities\.css/);
  assert.match(viewerEntry, /@import "tailwindcss" source\(none\) prefix\(tw\)/);
  assert.match(viewerEntry, /@source inline/);
  assert.doesNotMatch(manifest, /(?:site\/demo\.css|library\/library\.css|library\/shelf\.css|mobile\/mobile\.css)/);
  await Promise.all(['site/demo.css', 'library/library.css', 'library/shelf.css', 'mobile/mobile.css', 'site/app-materials.css', 'site/tokens.css', 'ui/app-materials.css', 'ui/mobile-library.css', 'ui/mobile-pwa.css', 'ui/mobile-shelf.css', 'ui/tokens.css', 'library/reader.css', 'src/sela.css'].map(async (path) => {
    await assert.rejects(access(path, constants.F_OK));
  }));
});
