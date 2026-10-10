import { build, transform } from 'esbuild';
import { mkdir, copyFile, cp, readFile, writeFile, stat, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const banner = '/*! Sela v1.5.0 | MIT Bobby Fajar Christian | PDFlipbook MIT Symple NZ | see THIRD_PARTY_NOTICES.md */';
const copyText = async (source, target) => writeFile(target, (await readFile(source, 'utf8')).replace(/\r\n/g, '\n'));
for (const dir of ['dist/js', 'dist/css', 'dist/types', 'dist/vendor/pdfjs/build', 'dist/vendor/pdfjs/legacy/build']) await mkdir(dir, { recursive: true });
await build({ entryPoints: ['src/browser.js'], outfile: 'dist/js/flippy.min.js', bundle: true, minify: true, format: 'iife', target: 'es2020', banner: { js: banner }, legalComments: 'none' });
await build({ entryPoints: ['src/module.js'], outfile: 'dist/js/flippy.esm.js', bundle: true, minify: true, format: 'esm', target: 'es2020', banner: { js: banner }, legalComments: 'none' });
for (const [name,entry] of [['archive','src/archive.js'],['djvu','src/djvu.js']]) await build({entryPoints:[entry],outfile:'dist/js/flippy.'+name+'.js',bundle:true,minify:true,format:'esm',target:'es2020',legalComments:'none'});
for (const [name,entry] of [['metadata','src/book-metadata.js'],['app','library/reader-shell.js'],['tools','src/reading-tools.js'],['text','src/text.js']]) await build({entryPoints:[entry],outfile:'dist/js/sela.'+name+'.js',bundle:true,minify:true,format:'esm',target:'es2020',legalComments:'none'});
for(const name of ['min','esm','archive','djvu'])await copyFile('dist/js/flippy.'+name+'.js','dist/js/sela.'+name+'.js');
await copyFile('node_modules/fflate/LICENSE','dist/fflate-LICENSE.txt');
const appCss=await transform(await readFile('library/reader.css','utf8'),{loader:'css',minify:true});await writeFile('dist/css/sela.app.css',appCss.code);
const css = await transform(await readFile('src/sela.css', 'utf8'), { loader: 'css', minify: true });
await writeFile('dist/css/flippy.min.css', `${banner}\n${css.code}`);
await copyFile('dist/css/flippy.min.css','dist/css/sela.min.css');
await copyText('src/index.d.ts', 'dist/types/index.d.ts');
await copyText('src/index.d.ts', 'dist/js/flippy.esm.d.ts');
await copyText('src/index.d.ts','dist/js/sela.esm.d.ts');
await copyText('site/index.html', 'index.html');
await copyText('src/compat.js', 'dist/js/flippy.compat.js');
await copyText('src/compat.js', 'dist/js/sela.compat.js');
for (const folder of ['build', 'legacy/build']) {
  for (const file of ['pdf.min.mjs', 'pdf.worker.min.mjs']) await copyFile(`node_modules/pdfjs-dist/${folder}/${file}`, `dist/vendor/pdfjs/${folder}/${file}`);
}
for (const folder of ['cmaps', 'standard_fonts']) await cp(`node_modules/pdfjs-dist/${folder}`, `dist/vendor/pdfjs/${folder}`, { recursive: true });
await copyFile('node_modules/pdfjs-dist/LICENSE', 'dist/vendor/pdfjs/LICENSE');
await copyFile('licenses/PDFlipbook-MIT.txt', 'dist/PDFlipbook-LICENSE.txt');
const manifest = { version: '1.5.0', pdfjs: '4.10.38', assets: {} };
for (const path of ['dist/js/flippy.min.js', 'dist/js/flippy.esm.js', 'dist/js/flippy.compat.js', 'dist/js/flippy.archive.js', 'dist/js/flippy.djvu.js', 'dist/js/sela.min.js', 'dist/js/sela.esm.js', 'dist/js/sela.compat.js', 'dist/js/sela.archive.js', 'dist/js/sela.djvu.js', 'dist/js/sela.tools.js', 'dist/js/sela.text.js', 'dist/js/sela.app.js', 'dist/js/sela.metadata.js', 'dist/css/sela.app.css', 'dist/css/sela.min.css', 'dist/css/flippy.min.css', 'dist/sound/turnPage.mp3', 'dist/vendor/pdfjs/build/pdf.min.mjs', 'dist/vendor/pdfjs/build/pdf.worker.min.mjs']) {
  const data = await readFile(path);
  manifest.assets[path] = { bytes: (await stat(path)).size, gzip: gzipSync(data).length, sha256: createHash('sha256').update(data).digest('hex') };
}
await writeFile('dist/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
const shell=['index.html','site/demo.css','site/demo.js','site/motion.js','site/pwa.js','site/platform.js','site/products.js','site/product-language.js','site/flag-en.svg','site/flag-id.svg','logo.svg','favicon.svg','manifest.webmanifest','site/icon-192.png','site/icon-512.png','dist/js/sela.compat.js','dist/js/sela.min.js','dist/css/sela.min.css','dist/js/sela.tools.js','dist/js/sela.text.js'];
const allowed=[...shell,'example/story/cover.jpg'];
for (let i=0;i<shell.length;i++) if (/^(site\/.*\.(js|css)|dist\/js\/sela\.compat\.js)$/.test(shell[i])) shell[i]+='?v='+manifest.version;
async function offlinePaths(folder){for(const file of await readdir(folder,{withFileTypes:true})){const path=folder+'/'+file.name;if(file.isDirectory())await offlinePaths(path);else allowed.push(path);}}
await offlinePaths('dist');await offlinePaths('site');await offlinePaths('mobile');await offlinePaths('library');
await writeFile('offline-assets.json',JSON.stringify({version:manifest.version,shell,mobileShell:['example/story/cover.jpg','mobile/index.html','mobile/mobile.css','mobile/gate.js','mobile/app.js','mobile/pwa.js','mobile/manifest.webmanifest','site/platform.js','site/icon-192.png','site/icon-512.png','site/flag-en.svg','site/flag-id.svg','library/library.css','library/library.js','library/library-experience.js','library/reader.css','library/book-info.js','library/share-card.js','dist/js/sela.metadata.js','library/themes.js','library/catalog.js','library/backup.js','library/cloud.js','library/network.js','library/open-catalog.js','library/storage.js','library/updates.js','logo.svg','favicon.svg','dist/js/sela.esm.js','dist/js/sela.app.js','dist/css/sela.app.css','dist/js/sela.tools.js','dist/js/sela.text.js','dist/css/sela.min.css'],allowed:[...new Set(allowed)].sort()},null,2)+'\n');
