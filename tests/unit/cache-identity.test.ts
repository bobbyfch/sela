import test from 'node:test';
import assert from 'node:assert/strict';
import {appCacheIdentity} from '../../scripts/cache-identity.ts';
import {readFile} from 'node:fs/promises';
test('same-version app edits invalidate cached assets; input order is irrelevant',()=>{
 const before: [string, Uint8Array][]=[['app.js',Buffer.from('first')],['style.css',Buffer.from('paper')]];
 const after: [string, Uint8Array][]=[['app.js',Buffer.from('fixed')],before[1]];
 assert.notEqual(appCacheIdentity('1.7.1',before),appCacheIdentity('1.7.1',after));
 assert.equal(appCacheIdentity('1.7.1',before),appCacheIdentity('1.7.1',[...before].reverse()));
 assert.notEqual(appCacheIdentity('1.7.1',before),appCacheIdentity('1.8.0',before));
 assert.equal(appCacheIdentity('1.7.1',[['app.js',Buffer.from('first\r\nsecond')]]),appCacheIdentity('1.7.1',[['app.js',Buffer.from('first\nsecond')]]));
 assert.notEqual(appCacheIdentity('1.7.1',[['cover.png',Buffer.from('first\r\nsecond')]]),appCacheIdentity('1.7.1',[['cover.png',Buffer.from('first\nsecond')]]));
});

test('built public worker identity covers the current hero, page and runtime assets',async()=>{
 const manifest=JSON.parse(await readFile('offline-assets.json','utf8')) as {version:string;shell:string[]};
 assert(manifest.shell.includes('site/screenshots/app-mobile.webp'));
 const output=await readFile('sela-sw.js','utf8');const match=output.match(/CACHE\s*=\s*["'](sela-viewer-[^"']+)["']/);assert(match);
 const source=output.slice(output.indexOf('\n')+1).replace(match[1],'sela-viewer-{{SELA_PUBLIC_CACHE}}');
 const expected=appCacheIdentity(manifest.version,[...await Promise.all(manifest.shell.map(async path=>[path,await readFile(path.split('?')[0])] as const)),['offline-assets.json',await readFile('offline-assets.json')],['worker-source.js',Buffer.from(source)]]);
 assert.equal(match[1],'sela-viewer-'+expected);assert(!output.includes('{{SELA_PUBLIC_CACHE}}'));
});
