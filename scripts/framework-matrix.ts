/** Actual framework dev-server smoke checks; dependencies live in ignored .build. */
import {mkdir,readFile,writeFile,copyFile,symlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';
const root=resolve('.'),workspace=resolve('.build/framework-matrix');
if(!existsSync(workspace+'/node_modules/next'))throw new Error('Install the isolated matrix dependencies described in docs/framework-validation.md first.');
await mkdir(workspace+'/node_modules/@bobbyfch',{recursive:true});
if(!existsSync(workspace+'/node_modules/@bobbyfch/sela'))await symlink(root,workspace+'/node_modules/@bobbyfch/sela','junction');

const browser=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{});
const report:object[]=[];
try {
 for(const framework of ['next','nuxt']){
  const cwd=workspace+'/'+framework,port=framework==='next'?4181:4182;
  await mkdir(cwd+'/public',{recursive:true});if(!existsSync(cwd+'/public/sela'))await symlink(root+'/dist',cwd+'/public/sela','junction');
  await copyFile(root+'/example/yang-tidak-ikut-pulang.pdf',cwd+'/public/story.pdf');
  await writeFile(cwd+'/package.json',JSON.stringify({name:'sela-'+framework+'-smoke',private:true,type:'module'}));
  if(framework==='next'){
   await mkdir(cwd+'/app',{recursive:true});await copyFile('examples/nextjs.tsx',cwd+'/app/reader.tsx');
   await writeFile(cwd+'/next.config.mjs',`export default {turbopack:{root:${JSON.stringify(root)}}};`);
   await writeFile(cwd+'/app/layout.tsx','export default function Layout({children}){return <html><body>{children}</body></html>}');
   await writeFile(cwd+'/app/page.tsx',"import {SelaButton} from './reader';export default function Page(){return <main><h1>Next SDK host</h1><SelaButton url='/story.pdf' assetBase='/sela/'/></main>}");
   await writeFile(cwd+'/tsconfig.json',JSON.stringify({compilerOptions:{target:'ES2022',module:'esnext',jsx:'preserve',moduleResolution:'bundler',skipLibCheck:true},include:['app/**/*.tsx']}));
  }else{
   await copyFile('examples/nuxt.vue',cwd+'/reader.vue');
   await writeFile(cwd+'/nuxt.config.ts',"export default defineNuxtConfig({devtools:{enabled:false},compatibilityDate:'2026-10-11'});");
   await writeFile(cwd+'/app.vue',"<script setup lang='ts'>import Reader from './reader.vue';</script><template><main><h1>Nuxt SDK host</h1><Reader url='/story.pdf' asset-base='/sela/'/></main></template>");
  }
  const cli=framework==='next'?workspace+'/node_modules/next/dist/bin/next':workspace+'/node_modules/nuxt/bin/nuxt.mjs';
  const child=spawn(process.execPath,[cli,'dev','--port',String(port)],{cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',data=>{logs+=data;void writeFile(cwd+'/runtime.log',logs);});child.stderr.on('data',data=>{logs+=data;void writeFile(cwd+'/runtime.log',logs);});
  const page=await browser.newPage();
  try {
   const deadline=Date.now()+120000;let html='';while(Date.now()<deadline){try{const response=await fetch('http://localhost:'+port,{signal:AbortSignal.timeout(15000)});if(response.ok){html=await response.text();break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}
   if(!html.includes('Read document'))throw new Error('SSR did not render the integration button. '+logs.slice(-1800));
   await page.goto('http://localhost:'+port);await page.getByRole('button',{name:'Read document',exact:true}).waitFor();
   await page.waitForFunction(()=>!(document.querySelector('button') as HTMLButtonElement)?.disabled);
   await page.getByRole('button',{name:'Read document',exact:true}).click();await page.locator('.library-reader-overlay canvas').first().waitFor({timeout:45000});
   await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.library-reader-overlay'));report.push({framework,ssr:true,clientOpen:true,close:true});
  }catch(error){await writeFile(cwd+'/runtime.log',logs);throw error;}finally{await page.close();child.kill();}
 }
}finally{await browser.close();await writeFile('.build/framework-runtime-results.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));
