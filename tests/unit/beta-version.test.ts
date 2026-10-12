import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {VERSION} from '../../app/library/version.ts';
import {Sela} from '../../src/module.ts';
import '../../app/library/updates.ts';
test('package version reaches runtime, both page headers and asset metadata',async()=>{
 const pkg=JSON.parse(await readFile('package.json','utf8'));
 assert.equal(VERSION,pkg.version);assert.equal(Sela.version,pkg.version);
 const label=pkg.version.replace(/^(\d+)\.(\d+)\.0-beta(?:\.(\d+))?$/u,(_match,major,minor,beta)=>`${major}.${minor} beta${beta&&beta!=='0'?'.'+beta:''}`);
 for(const file of ['index.html','mobile/index.html']){const html=await readFile(file,'utf8');assert(html.includes('>'+label+'<'));assert(!html.includes('{{SELA_'));}
 for(const file of ['dist/manifest.json','offline-assets.json'])assert.equal(JSON.parse(await readFile(file,'utf8')).version,pkg.version);
 assert.match(await readFile('sela-sw.js','utf8'), new RegExp('VERSION\\s*=\\s*["\']'+pkg.version.replaceAll('.', '\\.')+'["\']'));
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
