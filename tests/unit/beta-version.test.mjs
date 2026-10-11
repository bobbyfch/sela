import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {VERSION} from '../../library/version.js';
import {Sela} from '../../src/module.js';
import '../../library/updates.js';
test('package version reaches runtime, both page headers and asset metadata',async()=>{
 const pkg=JSON.parse(await readFile('package.json','utf8'));
 assert.equal(VERSION,pkg.version);assert.equal(Sela.version,pkg.version);
 const label=pkg.version.replace(/^(\d+)\.(\d+)\.0-beta(?:\.0)?$/,'$1.$2 beta');
 for(const file of ['index.html','mobile/index.html']){const html=await readFile(file,'utf8');assert(html.includes('>'+label+'<'));assert(!html.includes('{{SELA_'));}
 for(const file of ['dist/manifest.json','offline-assets.json'])assert.equal(JSON.parse(await readFile(file,'utf8')).version,pkg.version);
 assert((await readFile('sela-sw.js','utf8')).includes("VERSION='"+pkg.version+"'"));
});
test('beta channel finds new betas and the next major stable release',async()=>{
 const records=[{tag_name:'v0.9.0-beta',prerelease:true}];
 const request=async()=>({ok:true,json:async()=>records});
 assert.equal((await SelaUpdates.check('0.9.0-beta',request)).available,false);
 records.unshift({tag_name:'v0.9.0-beta.1',prerelease:true});
 assert.equal((await SelaUpdates.check('0.9.0-beta',request)).version,'0.9.0-beta.1');
 records.unshift({tag_name:'v1.0.0'});
 assert.equal((await SelaUpdates.check('0.9.0-beta',request)).version,'1.0.0');
});
