import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import ts from 'typescript-api';
import {chromium} from '@playwright/test';
const workspace=resolve('.build/framework-matrix'),folder=workspace+'/browser-host';await mkdir(folder,{recursive:true});const require=createRequire(import.meta.url);
const {compile}=require(workspace+'/node_modules/svelte/compiler');
const svelte=(await readFile('examples/svelte.svelte','utf8')).replace("pdfUrl: '/story.pdf'","pdfUrl: '/example/yang-tidak-ikut-pulang.pdf',assetBase:'/dist/'");
await writeFile(folder+'/svelte.mjs',compile(svelte,{generate:'client',filename:folder+'/Sela.svelte'}).js.code);
await writeFile(folder+'/svelte-entry.mjs',"import {mount} from 'svelte';import Component from './svelte.mjs';mount(Component,{target:document.querySelector('#root')});");
const angular=(await readFile('examples/angular.ts','utf8')).replace("pdfUrl: '/story.pdf'","pdfUrl: '/example/yang-tidak-ikut-pulang.pdf',assetBase:'/dist/'");
await writeFile(folder+'/angular.mjs',ts.transpileModule(angular,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,experimentalDecorators:true}}).outputText);
await writeFile(folder+'/angular-entry.mjs',"import '@angular/compiler';import {bootstrapApplication} from '@angular/platform-browser';import {PdfReaderComponent} from './angular.mjs';await bootstrapApplication(PdfReaderComponent);");
for(const framework of ['svelte','angular']){
 await build({entryPoints:[folder+'/'+framework+'-entry.mjs'],bundle:true,format:'esm',target:'es2022',outfile:folder+'/'+framework+'-bundle.js',logLevel:'warning'});
 await writeFile(folder+'/'+framework+'.html',`<!doctype html><html><body><div id='root'></div><app-pdf-reader></app-pdf-reader><script type='module' src='./${framework}-bundle.js'></script></body></html>`);
}
const browser=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{});const results:object[]=[];
try{for(const framework of ['svelte','angular']){const page=await browser.newPage();try{await page.goto('http://127.0.0.1:4173/.build/framework-matrix/browser-host/'+framework+'.html');await page.getByRole('button',{name:'Read PDF',exact:true}).click();await page.locator('.app-page-seek:not([disabled])').first().waitFor();await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.library-reader-overlay'));results.push({framework,mount:true,open:true,close:true});}catch(error){await page.screenshot({path:folder+'/'+framework+'-failed.png'});throw error;}finally{await page.close();}}}finally{await browser.close();await writeFile('.build/component-runtime-results.json',JSON.stringify(results,null,2)+'\n');}console.log(JSON.stringify(results));
