import {mkdir,cp,readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {zipSync} from 'fflate';
const output=resolve('.git/sela-extension');const {version}=JSON.parse(await readFile('package.json','utf8'));
for(const browser of ['chromium','firefox'])for(const edition of ['standard','newtab']){
 const folder=`${output}/${browser}-${edition}`;await mkdir(folder,{recursive:true});
 for(const name of ['dist','extension','logo.svg','favicon.svg','LICENSE','THIRD_PARTY_NOTICES.md'])await cp(name,`${folder}/${name}`,{recursive:true});
 await mkdir(`${folder}/site`,{recursive:true});for(const name of ['icon-192.png','flag-en.svg','flag-id.svg'])await cp(`site/${name}`,`${folder}/site/${name}`);
 await mkdir(`${folder}/example`,{recursive:true});await cp('example/yang-tidak-ikut-pulang.pdf',`${folder}/example/yang-tidak-ikut-pulang.pdf`);
 const manifest={manifest_version:3,name:`Sela — private library${edition==='newtab'?' · New Tab':''}`,version,
 description:'A private offline bookshelf for PDF, EPUB, comics and text. Search, notes and optional browser voices.',
 icons:{192:'site/icon-192.png'},action:{default_title:'Open Sela library'},permissions:['contextMenus','storage','alarms'],optional_host_permissions:['https://*/*','http://*/*'],
 background:browser==='firefox'?{scripts:['extension/updates.js','extension/background.js']}:{service_worker:'extension/background.js'},
 content_security_policy:{extension_pages:"script-src 'self'; object-src 'none';"},
 ...(edition==='newtab'?{chrome_url_overrides:{newtab:'extension/library.html'}}:{}),
 ...(browser==='firefox'?{browser_specific_settings:{gecko:{id:`sela-${edition}@bobbyfch.github.io`,strict_min_version:'140.0',data_collection_permissions:{required:['none']}}}}:{})};
 await writeFile(`${folder}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
 const files={};async function walk(path,prefix=''){for(const entry of await readdir(path)){const file=`${path}/${entry}`,name=prefix+entry;if((await stat(file)).isDirectory())await walk(file,name+'/');else files[name]=new Uint8Array(await readFile(file));}}
 await walk(folder);const bytes=zipSync(files,{level:6});await writeFile(`${output}/sela-${browser}-${edition}-${version}.zip`,bytes);console.log(`${browser}/${edition}: ${bytes.length} ZIP bytes`);
}
