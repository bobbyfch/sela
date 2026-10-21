import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { gzipSync } from 'node:zlib';

test('public and app shells ship their current framework styles without retired mobile assets', async () => {
  const [publicCss, appCss, appReaderCss, viewerCss, publicHtml, appHtml, publicEntry, appReaderEntry, viewerEntry, manifest] = await Promise.all([
    readFile('site/public.css', 'utf8'),
    readFile('app/app.css', 'utf8'),
    readFile('dist/css/sela.app.css', 'utf8'),
    readFile('dist/css/sela.min.css', 'utf8'),
    readFile('index.html', 'utf8'),
    readFile('app/index.html', 'utf8'),
    readFile('ui/public-tailwind.css', 'utf8'),
    readFile('ui/app-reader-tailwind.css', 'utf8'),
    readFile('ui/viewer-tailwind.css', 'utf8'),
    readFile('offline-assets.json', 'utf8'),
  ]);

  assert.ok(publicCss.includes('flex-wrap'), 'public utility CSS should include the responsive navigation layout');
  assert.ok(publicCss.includes('grid-cols-1') || publicCss.includes('grid-template-columns'), 'public utility CSS should include responsive grid rules');
  assert.match(appCss, /\.sela-app/);
  assert.match(appCss, /mantine-Button/);
  assert.doesNotMatch(appCss, /@import\s+["']tailwindcss["']/);
  assert.match(appReaderCss, /\.app-reading-top\{/);
  assert.match(appReaderCss, /\.app-quran-navigation\{/);
  assert.match(appReaderCss, /\[data-product-reader=app\]\[data-reading-direction=rtl\] \.app-reading-actions\{/);
  assert.doesNotMatch(appReaderCss, /\[data-product-reader="app"\] \[data-reading-direction=rtl\] \.app-reading-actions/);
  assert.match(appReaderCss, /\.tw\\:/);
  assert.match(viewerCss, /tailwindcss v4\.3\.3/);
  assert.match(viewerCss, /\.library-reader-overlay/);
  assert.match(viewerCss, /\.sela-tools/);
  assert.doesNotMatch(viewerCss, /\.tw\\:|--tw-spacing|--tw-color-|@import|@utility|\.hidden\{|\.grid\{|\.block\{/);
  assert.ok(gzipSync(appCss).length < 100_000, `framework app CSS is ${gzipSync(appCss).length} compressed bytes`);
  assert.ok(gzipSync(appReaderCss).length < 40_000, `app reader CSS is ${gzipSync(appReaderCss).length} compressed bytes`);
  assert.ok(gzipSync(viewerCss).length < 11 * 1024, `standalone viewer CSS is ${gzipSync(viewerCss).length} compressed bytes`);
  assert.match(publicHtml, /site\/public\.css\?v=/);
  assert.match(publicHtml, /class="public-nav/);
  assert.match(publicHtml, /class="hero/);
  assert.match(appHtml, /href="\.\/app\.css"/);
  assert.match(appHtml, /src="\.\/app\.js"/);
  assert.doesNotMatch(appHtml, /mobile-app\.css|\/mobile\//);
  assert.match(publicEntry, /@import "tailwindcss" prefix\(tw\)/);
  assert.match(publicEntry, /@import "@phosphor-icons\/web\/fill"/);
  assert.match(publicEntry, /@import "\.\/public-site\.css"/);
  assert.match(appReaderEntry, /app-reader-utilities\.css/);
  assert.match(viewerEntry, /viewer-tailwind-utilities\.css/);
  assert.match(manifest, /app\/app\.css/);
  assert.match(manifest, /app\/app\.js/);
  assert.doesNotMatch(manifest, /(?:site\/demo\.css|library\/library\.css|library\/shelf\.css|mobile\/)/);
  await Promise.all(['site/demo.css', 'library/library.css', 'library/shelf.css', 'mobile', 'site/mobile-app.css', 'ui/app-tailwind-utilities.css', 'ui/mobile-tailwind.css', 'site/app-materials.css', 'site/tokens.css', 'ui/app-materials.css', 'ui/mobile-library.css', 'ui/mobile-pwa.css', 'ui/mobile-shelf.css', 'ui/tokens.css', 'library/reader.css', 'src/sela.css'].map(async (path) => {
    await assert.rejects(access(path, constants.F_OK));
  }));
});
