import { build, transform } from 'esbuild';
import { mkdir, copyFile, cp, readFile, writeFile, stat, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import {appCacheIdentity} from './cache-identity.mjs';

const {version: VERSION} = JSON.parse(await readFile('package.json','utf8'));
const lock=JSON.parse(await readFile('package-lock.json','utf8'));
lock.version=VERSION;lock.packages[''].version=VERSION;
await writeFile('package-lock.json',JSON.stringify(lock,null,2)+'\n');
const LABEL = VERSION.replace(/^(\d+)\.(\d+)\.0-beta(?:\.0)?$/, '$1.$2 beta');
await writeFile('library/version.js',`// Generated from package.json by npm run build.\nexport const VERSION = ${JSON.stringify(VERSION)};\n`);
const render = text => text.replaceAll('{{SELA_VERSION}}',VERSION).replaceAll('{{SELA_LABEL}}',LABEL);
const banner = `/*! Sela v${VERSION} | MIT Bobby Fajar Christian | PDFlipbook MIT Symple NZ | see THIRD_PARTY_NOTICES.md */`;
const copyText = async (source, target) => writeFile(target, (await readFile(source, 'utf8')).replace(/\r\n/g, '\n'));
for (const dir of ['dist/js', 'dist/css', 'dist/types', 'dist/vendor/pdfjs/build', 'dist/vendor/pdfjs/legacy/build']) await mkdir(dir, { recursive: true });
await build({ entryPoints: ['src/browser.js'], outfile: 'dist/js/sela.min.js', bundle: true, minify: true, format: 'iife', target: 'es2020', banner: { js: banner }, legalComments: 'none' });
await build({ entryPoints: ['src/module.js'], outfile: 'dist/js/sela.esm.js', bundle: true, minify: true, format: 'esm', target: 'es2020', banner: { js: banner }, legalComments: 'none' });
for (const [name,entry] of [['archive','src/archive.js'],['djvu','src/djvu.js']]) await build({entryPoints:[entry],outfile:'dist/js/sela.'+name+'.js',bundle:true,minify:true,format:'esm',target:'es2020',legalComments:'none'});
for (const [name,entry] of [['profiles','library/reader-profiles.js'],['office','src/office.js'],['metadata','src/book-metadata.js'],['app','library/reader-shell.js'],['tools','src/reading-tools.js'],['text','src/text.js']]) await build({entryPoints:[entry],outfile:'dist/js/sela.'+name+'.js',bundle:true,minify:true,format:'esm',target:'es2020',legalComments:'none'});
await copyFile('node_modules/fflate/LICENSE','dist/fflate-LICENSE.txt');
const appCss=await transform(await readFile('library/reader.css','utf8'),{loader:'css',minify:true});await writeFile('dist/css/sela.app.css',appCss.code);
const css = await transform(await readFile('src/sela.css', 'utf8'), { loader: 'css', minify: true });
await writeFile('dist/css/sela.min.css', `${banner}\n${css.code}`);
await copyText('src/index.d.ts', 'dist/types/index.d.ts');
await copyText('src/index.d.ts', 'dist/js/sela.esm.d.ts');
await writeFile('index.html',render(await readFile('site/index.html','utf8')));
await writeFile('mobile/index.html',render(await readFile('site/mobile.html','utf8')));
await writeFile('sela-sw.js',render(await readFile('site/viewer-sw.js','utf8')));
await copyText('src/compat.js', 'dist/js/sela.compat.js');
for (const folder of ['build', 'legacy/build']) {
  for (const file of ['pdf.min.mjs', 'pdf.worker.min.mjs']) await copyFile(`node_modules/pdfjs-dist/${folder}/${file}`, `dist/vendor/pdfjs/${folder}/${file}`);
}
for (const folder of ['cmaps', 'standard_fonts']) await cp(`node_modules/pdfjs-dist/${folder}`, `dist/vendor/pdfjs/${folder}`, { recursive: true });
await copyFile('node_modules/pdfjs-dist/LICENSE', 'dist/vendor/pdfjs/LICENSE');
await copyFile('licenses/PDFlipbook-MIT.txt', 'dist/PDFlipbook-LICENSE.txt');
const manifest = { version: VERSION, pdfjs: '4.10.38', assets: {} };
for (const path of ['dist/js/sela.min.js', 'dist/js/sela.esm.js', 'dist/js/sela.compat.js', 'dist/js/sela.archive.js', 'dist/js/sela.djvu.js', 'dist/js/sela.tools.js', 'dist/js/sela.text.js', 'dist/js/sela.office.js', 'dist/js/sela.app.js', 'dist/js/sela.metadata.js', 'dist/js/sela.profiles.js', 'dist/css/sela.app.css', 'dist/css/sela.min.css', 'dist/sound/turnPage.mp3', 'dist/vendor/pdfjs/build/pdf.min.mjs', 'dist/vendor/pdfjs/build/pdf.worker.min.mjs']) {
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
await writeFile('offline-assets.json',JSON.stringify({version:manifest.version,shell,mobileShell:['example/story/cover.jpg','mobile/index.html','mobile/mobile.css','mobile/gate.js','mobile/app.js','mobile/pwa.js','mobile/manifest.webmanifest','site/platform.js','site/icon-192.png','site/icon-512.png','site/flag-en.svg','site/flag-id.svg','library/library.css','library/shelf.css','library/library.js','library/version.js','library/library-experience.js','library/reader.css','library/book-info.js','library/share-card.js','dist/js/sela.metadata.js','library/themes.js','library/catalog.js','library/backup.js','dist/js/sela.archive.js','dist/js/sela.profiles.js','library/weather.js','library/reading-desk.js','library/public-books.json','library/network.js','library/open-catalog.js','library/storage.js','library/collections.js','library/file-format.js','library/shelf-interactions.js','library/home-atmosphere.js','library/reading-room.svg','dist/js/sela.office.js','library/discovery.js','library/book-sources.js','library/opds.js','library/updates.js','logo.svg','favicon.svg','dist/js/sela.esm.js','dist/js/sela.app.js','dist/css/sela.app.css','dist/js/sela.tools.js','dist/js/sela.text.js','dist/css/sela.min.css'],allowed:[...new Set(allowed)].sort()},null,2)+'\n');
const cachedShell=JSON.parse(await readFile('offline-assets.json','utf8')).mobileShell;
const worker=await readFile('mobile/sw.js','utf8');
const identity=appCacheIdentity(manifest.version,[...await Promise.all(cachedShell.map(async path=>[path,await readFile(path)])),['dist-integrity',Buffer.from(JSON.stringify(manifest.assets))],['worker-source.js',Buffer.from(worker.replace(/const CACHE='[^']+'/,"const CACHE='build'"))]]);
await writeFile('mobile/sw.js',worker.replace(/const CACHE='[^']+'/,"const CACHE='"+identity+"'"));

const releasePins = text => text.replace(/(bobbyfch\/sela(?:@|#)v)[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z0-9.]+)?/g,'$1'+VERSION);
for(const folder of ['docs','examples']) { for(const file of await readdir(folder)) { if(/\.(md|html|tsx|js)$/.test(file)){const path=folder+'/'+file;await writeFile(path,releasePins(await readFile(path,'utf8')));}}}
for(const path of ['README.md','README.id.md']){const badge=encodeURIComponent(LABEL.replaceAll('-','--').replaceAll(' ','_'));const text=releasePins(await readFile(path,'utf8')).replace(/https:\/\/img.shields.io\/github\/v\/release\/bobbyfch\/sela\?include_prereleases&/g,`https://img.shields.io/badge/version-${badge}-31725a?`).replace(/(https:\/\/img.shields.io\/badge\/version-)[^?]+?-31725a/g,'$1'+badge+'-31725a');await writeFile(path,text);}
