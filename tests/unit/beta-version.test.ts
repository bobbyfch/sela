import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {VERSION} from '../../app/library/version.ts';
import {Sela} from '../../src/module.ts';
import '../../app/library/updates.ts';
test('package version reaches runtime, the public page header and asset metadata',async()=>{
 const pkg=JSON.parse(await readFile('package.json','utf8'));
 assert.equal(VERSION,pkg.version);assert.equal(Sela.version,pkg.version);
 const label=pkg.version.replace(/^(\d+)\.(\d+)\.0-beta(?:\.(\d+))?$/u,(_match,major,minor,beta)=>`${major}.${minor} beta${beta&&beta!=='0'?'.'+beta:''}`);
 const html=await readFile('index.html','utf8');assert(html.includes('>'+label+'<'));assert(!html.includes('{{SELA_'));
 for(const file of ['dist/manifest.json','offline-assets.json'])assert.equal(JSON.parse(await readFile(file,'utf8')).version,pkg.version);
 assert.match(await readFile('sela-sw.js','utf8'), new RegExp('VERSION\\s*=\\s*["\']'+pkg.version.replaceAll('.', '\\.')+'["\']'));
});
test('installed-app icon and manifest URLs change when their artwork changes',async()=>{
 const pkg=JSON.parse(await readFile('package.json','utf8')) as {version:string};
 const names=['icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
 const revisions=new Map<string,string>();
 for(const name of names)revisions.set(name,createHash('sha256').update(await readFile('site/'+name)).digest('hex').slice(0,12));
 const manifestRevision=createHash('sha256').update([...revisions.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([name,revision])=>`${name}:${revision}`).join('|')).digest('hex').slice(0,12);
 for(const file of ['manifest.webmanifest','app/manifest.webmanifest']){
  const manifest=JSON.parse(await readFile(file,'utf8')) as {icons:Array<{src:string}>};
  for(const icon of manifest.icons){const name=icon.src.split('?')[0].split('/').at(-1)!;assert.equal(new URL(icon.src,'https://sela.test/').searchParams.get('v'),`${pkg.version}-${revisions.get(name)}`,`${file} ${name}`);}
 }
  for(const file of ['app/index.html']){
   const html=await readFile(file,'utf8');
  assert.match(html,new RegExp(`manifest\\.webmanifest\\?v=${pkg.version}-${manifestRevision}`),file);
  assert.match(html,new RegExp(`apple-touch-icon\\.png\\?v=${pkg.version}-${revisions.get('apple-touch-icon.png')}`),file);
 }
});
test('beta channel finds new betas and the next major stable release',async()=>{
 const records: Array<{tag_name:string;prerelease?:boolean}>=[{tag_name:'v0.9.0-beta',prerelease:true}];
 const request=async()=>({ok:true,json:async()=>records});
 assert.equal((await SelaUpdates.check('0.9.0-beta',request)).available,false);
 records.unshift({tag_name:'v0.9.0-beta.1',prerelease:true});
 assert.equal((await SelaUpdates.check('0.9.0-beta',request)).version,'0.9.0-beta.1');
 records.unshift({tag_name:'v1.0.0'});
 assert.equal((await SelaUpdates.check('0.9.0-beta',request)).version,'1.0.0');
});
