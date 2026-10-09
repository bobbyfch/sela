import {mkdir,cp,readFile,writeFile,readdir,stat,rm} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
import {zipSync} from 'fflate';
import {createHash} from 'node:crypto';
const checksums=[];
const output=resolve('.git/sela-extension');const {version}=JSON.parse(await readFile('package.json','utf8'));
for(const browser of ['chromium','firefox'])for(const edition of ['standard','newtab']){
 const folder=resolve(output,browser+'-'+edition);if(!folder.startsWith(output+sep))throw Error('Invalid package output');await rm(folder,{recursive:true,force:true});await mkdir(folder,{recursive:true});
 for(const name of ['dist','extension','logo.svg','favicon.svg','LICENSE','THIRD_PARTY_NOTICES.md'])await cp(name,`${folder}/${name}`,{recursive:true});
 await mkdir(`${folder}/site`,{recursive:true});for(const name of ['icon-192.png','flag-en.svg','flag-id.svg','platform.js'])await cp(`site/${name}`,`${folder}/site/${name}`);
 await mkdir(`${folder}/example`,{recursive:true});await cp('example/yang-tidak-ikut-pulang.pdf',`${folder}/example/yang-tidak-ikut-pulang.pdf`);
 const manifest={manifest_version:3,name:`Sela Home${edition==='newtab'?' · New Tab':' · Standard compatibility'}`,version,
 description:'A private offline bookshelf for PDF, EPUB, comics and text. Search, notes and optional browser voices.',
 icons:{192:'site/icon-192.png'},action:{default_title:'Open Sela Home'},permissions:['contextMenus','storage','alarms'],optional_host_permissions:['https://*/*','http://*/*'],
 background:browser==='firefox'?{scripts:['extension/updates.js','extension/background.js']}:{service_worker:'extension/background.js'},
 content_security_policy:{extension_pages:"script-src 'self'; object-src 'none';"},
 ...(edition==='newtab'?{chrome_url_overrides:{newtab:'extension/library.html'}}:{}),
 ...(browser==='firefox'?{browser_specific_settings:{gecko:{id:`sela-${edition}@bobbyfch.github.io`,strict_min_version:'140.0',data_collection_permissions:{required:['none']}}}}:{})};
 await writeFile(`${folder}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
 const files={};async function walk(path,prefix=''){for(const entry of await readdir(path)){const file=`${path}/${entry}`,name=prefix+entry;if((await stat(file)).isDirectory())await walk(file,name+'/');else files[name]=new Uint8Array(await readFile(file));}}
 await walk(folder);const bytes=zipSync(files,{level:6}),name=`sela-${browser}-${edition}-${version}.zip`;await writeFile(`${output}/${name}`,bytes);checksums.push(createHash('sha256').update(bytes).digest('hex')+'  '+name);console.log(`${browser}/${edition}: ${bytes.length} ZIP bytes`);
}
await writeFile(`${output}/SHA256SUMS.txt`,checksums.join('\n')+'\n');
