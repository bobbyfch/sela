import { posix } from 'node:path';
import ts from 'typescript-api';
import { transform } from 'esbuild';
import { build as viteBuild } from 'vite';
import { build as astroBuild } from 'astro';
import { mkdir, copyFile, cp, readFile, writeFile as writeFileRaw, stat, readdir, unlink, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import {appCacheIdentity} from './cache-identity.ts';

const {version: VERSION} = JSON.parse(await readFile('package.json','utf8'));
async function writeAtomic(path:string,data:string|Uint8Array){const temp=path+'.'+process.pid+'.tmp';await writeFileRaw(temp,data);try{await rename(temp,path);}catch(error){await unlink(temp).catch(()=>{});throw error;}}
const writeFile=writeAtomic;
const lock=JSON.parse(await readFile('package-lock.json','utf8'));
lock.version=VERSION;lock.packages[''].version=VERSION;
await writeFile('package-lock.json',JSON.stringify(lock,null,2)+'\n');
const LABEL = VERSION.replace(/^(\d+)\.(\d+)\.0-beta(?:\.(\d+))?$/, (_match, major, minor, beta) => `${major}.${minor} beta${beta && beta !== '0' ? `.${beta}` : ''}`);
await writeFile('app/library/version.ts',`// Generated from package.json by npm run build.\nexport const VERSION = ${JSON.stringify(VERSION)};\n`);
const render = text => text.replaceAll('{{SELA_VERSION}}',VERSION).replaceAll('{{SELA_LABEL}}',LABEL);
const banner = `/*! Sela v${VERSION} | MIT Bobby Fajar Christian | PDFlipbook MIT Symple NZ | see THIRD_PARTY_NOTICES.md */`;
const generatedBanner = (source: string) => '// Generated from '+source+' by npm run build. Do not edit.\n';
const copyText = async (source, target) => writeFile(target, (await readFile(source, 'utf8')).replace(/\r\n/g, '\n'));
for (const dir of ['dist/js', 'dist/css', 'dist/types', 'dist/vendor/pdfjs/build', 'dist/vendor/pdfjs/legacy/build']) await mkdir(dir, { recursive: true });
// Vite library builds keep the universal SDK free of React/framework runtimes.
async function bundle(entry: string, file: string, format: 'es' | 'iife' = 'es') {
 await viteBuild({configFile:false,logLevel:'warn',build:{target:'es2020',outDir:'.build/sdk',emptyOutDir:false,minify:true,lib:{entry,formats:[format],name:'SelaBundle',fileName:()=>file},rolldownOptions:{output:{banner}}}});
 const compiled=await transform(await readFile('.build/sdk/'+file,'utf8'),{minify:true,target:'es2020',legalComments:'none'});
 // Minifiers remove ordinary comments. Restore runtime-import directives after
 // minification using AST positions, so host bundlers never bundle private URLs.
 const parsed=ts.createSourceFile(file,compiled.code,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 const positions:number[]=[];
 const visit=(node:ts.Node)=>{if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword)positions.push(compiled.code.indexOf('(',node.expression.end)+1);ts.forEachChild(node,visit);};visit(parsed);
 let output=compiled.code;for(const position of positions.sort((a,b)=>b-a))output=output.slice(0,position)+'/* webpackIgnore: true */ /* turbopackIgnore: true */ /* @vite-ignore */'+output.slice(position);
 await writeFile('dist/js/'+file,(file==='sela.min.js'||file==='sela.esm.js'?banner+'\n':'')+output);
}
await bundle('src/browser.ts','sela.min.js','iife');
await bundle('src/module.ts','sela.esm.js');
for (const [name,entry] of [['archive-worker','src/archive-worker.ts'],['archive','src/archive.ts'],['djvu','src/djvu.ts'],['host','src/host-integration.ts'],['profiles','app/library/reader-profiles.ts'],['office','src/office.ts'],['metadata','src/book-metadata.ts'],['app','app/library/reader-shell.ts'],['tools','src/reading-tools.ts'],['text','src/text.ts']]) await bundle(entry,'sela.'+name+'.js');
await copyFile('node_modules/fflate/LICENSE','dist/fflate-LICENSE.txt');
await copyFile('node_modules/three/LICENSE','dist/three-LICENSE.txt');
const materialCss=(await readFile('ui/app-materials.css','utf8')).replaceAll('../site/materials/','../materials/');
await cp('site/materials','dist/materials',{recursive:true});
const appCss=await transform((await readFile('library/reader.css','utf8'))+'\n'+materialCss,{loader:'css',minify:true});await writeFile('dist/css/sela.app.css',appCss.code);
const css = await transform(await readFile('src/sela.css', 'utf8'), { loader: 'css', minify: true });
await writeFile('dist/css/sela.min.css', `${banner}\n${css.code}`);
await copyText('ui/tokens.css','site/tokens.css');
await copyText('ui/app-materials.css','site/app-materials.css');
// Emit the public declaration from the checked TypeScript SDK contract.
const declarationOptions: ts.CompilerOptions = {declaration:true,emitDeclarationOnly:true,allowImportingTsExtensions:true,strict:true,skipLibCheck:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext};
const declarationHost=ts.createCompilerHost(declarationOptions);
const declarations = new Map<string,string>();
declarationHost.writeFile=(path,text)=>{declarations.set(posix.basename(path),text);};
const declarationProgram=ts.createProgram(['src/public-api.ts','src/host-integration.ts','src/host-controls.ts'],declarationOptions,declarationHost);
const declarationDiagnostics=ts.getPreEmitDiagnostics(declarationProgram);
if(declarationDiagnostics.length)throw new Error(ts.formatDiagnosticsWithColorAndContext(declarationDiagnostics,{getCanonicalFileName:p=>p,getCurrentDirectory:()=>process.cwd(),getNewLine:()=> '\n'}));
declarationProgram.emit();
const publicDeclaration=declarations.get('public-api.d.ts');
if(!publicDeclaration)throw new Error('Public TypeScript declarations were not emitted');
for (const [folder,entry] of [['dist/types','index'],['dist/js','sela.esm']]) {
  for (const [name,code] of declarations) {
    const outputName=name==='public-api.d.ts'?entry+'.d.ts':name;
    const emitted=code.replaceAll('./events.ts','./events.js').replaceAll('./public-api.ts','./'+entry+'.js').replaceAll('./host-controls.ts','./host-controls.js');
    await writeFile(folder+'/'+outputName,generatedBanner('src/'+name.replace('.d.ts','.ts'))+emitted);
  }
}
// Astro generates the public/reader HTML; the public page has no hydration.
await astroBuild({configFile:'./astro.config.ts',logLevel:'warn'});
await writeFile('index.html',render(await readFile('.build/site/index.html','utf8')));
await writeFile('mobile/index.html',render(await readFile('.build/site/mobile/index.html','utf8')));
await viteBuild({configFile:'./vite.config.ts',logLevel:'warn'});
for(const file of await readdir('.build/app')) {
 await copyFile('.build/app/'+file,'mobile/'+file);
}
const appOutput=await transform(render(await readFile('mobile/app.js','utf8')),{minify:true,target:'es2022',legalComments:'none'});
await writeFile('mobile/app.js',generatedBanner('app/mobile/react-app.tsx')+'/*! React and React DOM | MIT | see react-LICENSE.txt and react-dom-LICENSE.txt */\n'+appOutput.code);
await copyFile('node_modules/react/LICENSE','mobile/react-LICENSE.txt');
await copyFile('node_modules/react-dom/LICENSE','mobile/react-dom-LICENSE.txt');

const compat = await transform(await readFile('src/compat.ts', 'utf8'), {loader:'ts',target:'es5'});
await writeFile('dist/js/sela.compat.js', generatedBanner('src/compat.ts') + compat.code);
for (const folder of ['build', 'legacy/build']) {
  for (const file of ['pdf.min.mjs', 'pdf.worker.min.mjs']) await copyFile(`node_modules/pdfjs-dist/${folder}/${file}`, `dist/vendor/pdfjs/${folder}/${file}`);
}
for (const folder of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) await cp(`node_modules/pdfjs-dist/${folder}`, `dist/vendor/pdfjs/${folder}`, { recursive: true });
await copyFile('node_modules/pdfjs-dist/LICENSE', 'dist/vendor/pdfjs/LICENSE');
await copyFile('licenses/PDFlipbook-MIT.txt', 'dist/PDFlipbook-LICENSE.txt');
// Compile author-maintained TypeScript into the existing browser asset URLs.
// Runtime JavaScript is generated; source/test/tooling paths are never cached.
async function typeScriptSources(folder: string): Promise<string[]> {
 const result: string[]=[];
 for(const file of await readdir(folder,{withFileTypes:true})){
  const path=folder+'/'+file.name;
  if(file.isDirectory())result.push(...await typeScriptSources(path));
  else if(file.name.endsWith('.ts')&&!file.name.endsWith('.d.ts'))result.push(path);
 }
 return result;
}
const sharedUtilities=['src/gestures.ts','src/preferences.ts','src/appearance.ts','src/i18n.ts'];
const sources=[...sharedUtilities,...(await typeScriptSources('app')).filter(path=>path!=='app/site/viewer-sw.ts'&&path!=='app/library/home-world.ts'),'examples/web-component.ts'];
// Remove only obsolete files generated by this build, preserving unrelated assets.
await mkdir('dist/source/src',{recursive:true});
for(const file of await readdir('dist/source/src')){
 const path='dist/source/src/'+file;
 if(file.endsWith('.js')&&!sharedUtilities.includes('src/'+file.replace(/\.js$/,'.ts'))&&(await readFile(path,'utf8')).startsWith('// Generated from src/'))await unlink(path);
}
const runtimePath = (source: string) => source.startsWith('app/') ? source.slice(4).replace(/\.ts$/,'.js') : source.startsWith('src/') ? 'dist/source/'+source.replace(/\.ts$/,'.js') : source.replace(/\.ts$/,'.js');
for(const source of sources) {
 const target=runtimePath(source);
 let code=await readFile(source,'utf8');
 code=code.replace(/((?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["'])([^"']+)(["'])/g,(whole,prefix,specifier,quote)=>{
  if(!specifier.startsWith('.'))return whole;
  const dependency=posix.normalize(posix.join(posix.dirname(source),specifier));
  let relative=posix.relative(posix.dirname(target),dependency.endsWith('.ts')?runtimePath(dependency):dependency);
  if(!relative.startsWith('.'))relative='./'+relative;
  return prefix+relative+quote;
 });
 code=render(code);
 const output=await transform(code,{loader:'ts',target:source==='app/site/platform.ts'?'es5':source.startsWith('app/')?'es2022':'es2020',legalComments:'inline',tsconfigRaw:{compilerOptions:{useDefineForClassFields:false}}});
 await mkdir(posix.dirname(target),{recursive:true});
 await writeFile(target,generatedBanner(source)+output.code);
}
// Bundle the optional Three.js room as one local, lazy-loaded module.
await viteBuild({configFile:false,logLevel:'warn',build:{target:'es2022',outDir:'.build/home-world',emptyOutDir:true,minify:true,lib:{entry:'app/library/home-world.ts',formats:['es'],fileName:()=> 'home-world.js'}}});
await writeFile('library/home-world.js',generatedBanner('app/library/home-world.ts')+'/*! Three.js | MIT | see dist/three-LICENSE.txt */\n'+await readFile('.build/home-world/home-world.js','utf8'));
await cp('app/library/assets','library/assets',{recursive:true});
// The viewer worker is published at the root, not inside site/.
const viewerWorker=await transform(render(await readFile('app/site/viewer-sw.ts','utf8')),{loader:'ts',target:'es2020'});
await writeAtomic('sela-sw.js',generatedBanner('app/site/viewer-sw.ts')+viewerWorker.code);

const pdfPackage=JSON.parse(await readFile('node_modules/pdfjs-dist/package.json','utf8'));
const manifest = { version: VERSION, pdfjs: pdfPackage.version, assets: {} };
for (const path of ['dist/js/sela.min.js', 'dist/js/sela.esm.js', 'dist/js/sela.compat.js', 'dist/js/sela.archive.js', 'dist/js/sela.archive-worker.js', 'dist/js/sela.djvu.js', 'dist/js/sela.tools.js', 'dist/js/sela.text.js', 'dist/js/sela.office.js', 'dist/js/sela.app.js', 'dist/js/sela.metadata.js', 'dist/js/sela.profiles.js', 'dist/css/sela.app.css', 'dist/css/sela.min.css', 'dist/sound/turnPage.mp3', 'dist/vendor/pdfjs/build/pdf.min.mjs', 'dist/vendor/pdfjs/build/pdf.worker.min.mjs']) {
  const data = await readFile(path);
  manifest.assets[path] = { bytes: (await stat(path)).size, gzip: gzipSync(data).length, sha256: createHash('sha256').update(data).digest('hex') };
}
await writeAtomic('dist/manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest, null, 2));
const shell=['index.html','site/screenshots/app-desktop.webp','site/screenshots/app-mobile.webp','site/demo.css','site/demo.js','site/motion.js','site/pwa.js','site/platform.js','site/products.js','site/product-language.js','site/flag-en.svg','site/flag-id.svg','logo.svg','favicon.svg','manifest.webmanifest','site/icon-192.png','site/icon-512.png','dist/js/sela.compat.js','dist/js/sela.min.js','dist/css/sela.min.css','dist/js/sela.tools.js','dist/js/sela.text.js'];
const allowed=[...shell,'example/story/cover.jpg'];
for (let i=0;i<shell.length;i++) if (/^(site\/.*\.(js|css)|dist\/js\/sela\.compat\.js)$/.test(shell[i])) shell[i]+='?v='+manifest.version;
async function offlinePaths(folder){for(const file of await readdir(folder,{withFileTypes:true})){const path=folder+'/'+file.name;if(file.isDirectory())await offlinePaths(path);else if(!/\.tsx?$/.test(path))allowed.push(path);}}
await offlinePaths('dist');await offlinePaths('site');await offlinePaths('mobile');await offlinePaths('library');
await writeAtomic('offline-assets.json',JSON.stringify({version:manifest.version,shell,mobileShell:['library/advanced.js','library/dictionary.js','library/search-worker.js','library/audio.js','library/external-catalogs.js','library/personal.js','library/personal-store.js','library/home-world.js','library/home-widgets.js','library/holiday-calendar.js','dist/source/src/i18n.js',...['reading-room','cat','hamster','rabbit','fox','owl','turtle','red-panda','penguin','shiba','fawn'].map(name=>'library/assets/'+name+'.webp'),...['forest','paper','ink','rose','charcoal'].flatMap(name=>['site/materials/'+name+'.svg','dist/materials/'+name+'.svg']),'dist/materials/walnut.svg','dist/materials/oak.svg','dist/materials/linen.svg','site/app-materials.css','site/materials/walnut.svg','site/materials/oak.svg','site/materials/linen.svg','library/controls.js','library/reader-history.js','site/tokens.css','library/glass-navigation.js','library/cover-transition.js','example/story/cover.jpg','mobile/index.html','mobile/mobile.css','mobile/gate.js','mobile/app.js','mobile/pwa.js','mobile/manifest.webmanifest','site/platform.js','site/icon-192.png','site/icon-512.png','site/flag-en.svg','site/flag-id.svg','library/library.css','library/shelf.css','library/library.js','library/version.js','library/library-experience.js','library/reader.css','library/book-info.js','library/share-card.js','dist/js/sela.metadata.js','library/themes.js','library/catalog.js','library/backup.js','dist/js/sela.archive.js','dist/js/sela.archive-worker.js','dist/js/sela.profiles.js','library/weather.js','library/reading-desk.js','library/public-books.json','library/network.js','library/open-catalog.js','library/storage.js','library/collections.js','library/file-format.js','library/shelf-interactions.js','library/home-atmosphere.js','dist/js/sela.office.js','library/discovery.js','library/book-sources.js','library/opds.js','library/updates.js','logo.svg','favicon.svg','dist/js/sela.esm.js','dist/js/sela.app.js','dist/css/sela.app.css','dist/js/sela.tools.js','dist/js/sela.text.js','dist/css/sela.min.css'],allowed:[...new Set(allowed)].sort()},null,2)+'\n');
// Public artwork and CSS must also invalidate caches without a version bump.
const viewerIdentity=appCacheIdentity(manifest.version,[...await Promise.all(shell.map(async path=>[path,await readFile(path.split('?')[0])] as const)),['offline-assets.json',await readFile('offline-assets.json')],['worker-source.js',Buffer.from(viewerWorker.code)]]);
await writeAtomic('sela-sw.js',generatedBanner('app/site/viewer-sw.ts')+viewerWorker.code.replaceAll('{{SELA_PUBLIC_CACHE}}',viewerIdentity));
const cachedShell=JSON.parse(await readFile('offline-assets.json','utf8')).mobileShell;
const worker=await readFile('mobile/sw.js','utf8');
const identity=appCacheIdentity(manifest.version,[...await Promise.all(cachedShell.map(async path=>[path,await readFile(path)])),['dist-integrity',Buffer.from(JSON.stringify(manifest.assets))],['worker-source.js',Buffer.from(worker.replace(/const CACHE\s*=\s*["'][^"']+["']/, 'const CACHE="build"'))]]);
await writeAtomic('mobile/sw.js',worker.replace(/const CACHE\s*=\s*["'][^"']+["']/, 'const CACHE='+JSON.stringify(identity)));

const releasePins = text => text.replace(/(bobbyfch\/sela(?:@|#)v)[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z0-9.]+)?/g,'$1'+VERSION);
for(const folder of ['docs','examples']) { for(const file of await readdir(folder)) { if(/\.(md|html|ts|tsx)$/.test(file)){const path=folder+'/'+file;await writeFile(path,releasePins(await readFile(path,'utf8')));}}}
for(const path of ['README.md','README.id.md']){const badge=encodeURIComponent(LABEL.replaceAll('-','--').replaceAll(' ','_'));const text=releasePins(await readFile(path,'utf8')).replace(/https:\/\/img.shields.io\/github\/v\/release\/bobbyfch\/sela\?include_prereleases&/g,`https://img.shields.io/badge/version-${badge}-31725a?`).replace(/(https:\/\/img.shields.io\/badge\/version-)[^?]+?-31725a/g,'$1'+badge+'-31725a');await writeFile(path,text);}
