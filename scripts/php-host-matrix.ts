import {mkdir,readFile,writeFile,symlink,copyFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';
const root=resolve('.');const modern='C:/laragon/bin/php/php-8.5.10-Win32-vs17-x64/php.exe';const legacy='C:/laragon/bin/php/php-8.1.34-Win32-vs16-x64/php.exe';
const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';const browser=await chromium.launch(existsSync(edge)?{executablePath:edge}:{});const results:object[]=[];
try{for(const [framework,port] of [['ci3',4183],['ci4',4184],['laravel',4185]] as const){
 const cwd=root+'/.build/'+framework+'-host';const publicRoot=framework==='ci3'?cwd:cwd+'/public';
 if(!existsSync(cwd))throw new Error('Install '+framework+' in .build first (docs/framework-validation.md).');
 await mkdir(publicRoot+'/sela',{recursive:true});if(!existsSync(publicRoot+'/sela/dist'))await symlink(root+'/dist',publicRoot+'/sela/dist','junction');await copyFile('example/yang-tidak-ikut-pulang.pdf',publicRoot+'/story.pdf');
 let view=await readFile('examples/'+(framework==='laravel'?'laravel.blade.php':framework+'.php'),'utf8');view=view.replace(/https:\/\/cdn\.jsdelivr\.net\/gh\/bobbyfch\/sela@[^/]+\/dist\/js\/sela\.min\.js/,'/sela/dist/js/sela.min.js');
 if(framework==='ci3'){
  view=view.replace("site_url('media/ebook/42')","site_url('story.pdf')");await writeFile(cwd+'/application/views/sela.php',view);
  await writeFile(cwd+'/application/controllers/Welcome.php',"<?php defined('BASEPATH') OR exit('No direct script access allowed');class Welcome extends CI_Controller {public function index(){$this->load->helper(['url','security']);$this->load->view('sela');}}");
  const config=cwd+'/application/config/config.php';await writeFile(config,(await readFile(config,'utf8')).replace("$config['base_url'] = '';",`$config['base_url'] = 'http://127.0.0.1:${port}/';`).replace("$config['index_page'] = 'index.php';","$config['index_page'] = '';"));
 }else if(framework==='ci4'){
  view=view.replace("site_url('media/ebook/42')","base_url('story.pdf')");await writeFile(cwd+'/app/Views/sela.php',view);
  await writeFile(cwd+'/app/Controllers/Home.php',"<?php namespace App\\Controllers;class Home extends BaseController {public function index():string{return view('sela');}}");
  await writeFile(cwd+'/.env',`CI_ENVIRONMENT = development\napp.baseURL = 'http://127.0.0.1:${port}/'\n`);
 }else{
  await writeFile(cwd+'/resources/views/sela.blade.php',view);await writeFile(cwd+'/routes/web.php',`<?php use Illuminate\\Support\\Facades\\Route;Route::get('/',fn()=>view('sela',['ebook'=>(object)['id'=>42]]));Route::get('/ebooks/{ebook}',fn()=>response()->file(public_path('story.pdf')))->name('ebooks.show');`);
  const env=cwd+'/.env';await writeFile(env,(await readFile(env,'utf8')).replace(/^SESSION_DRIVER=.*$/m,'SESSION_DRIVER=array').replace(/^CACHE_STORE=.*$/m,'CACHE_STORE=array'));
 }
 const child=spawn(framework==='ci3'?legacy:modern,['-S','127.0.0.1:'+port,'-t',publicRoot],{cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});let log='';child.stdout.on('data',data=>log+=data);child.stderr.on('data',data=>log+=data);const page=await browser.newPage();
 try{const deadline=Date.now()+30000;let ready=false;while(Date.now()<deadline){if(child.exitCode!==null)throw Error('PHP host exited: '+log);try{const response=await fetch('http://127.0.0.1:'+port,{signal:AbortSignal.timeout(2000)});await response.body?.cancel();if(response.ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}if(!ready)throw Error('PHP host not ready: '+log);await page.goto('http://127.0.0.1:'+port);await page.locator('#open-ebook').click();await page.locator('.library-reader-overlay canvas').first().waitFor({timeout:45000});await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.library-reader-overlay'));results.push({framework,php:framework==='ci3'?'8.1':'8.5',open:true,close:true});}
 catch(error){await writeFile(cwd+'/runtime.log',log);await page.screenshot({path:cwd+'/failed.png'});throw error;}finally{await page.close();child.kill();}
}}finally{await browser.close();await writeFile('docs/php-runtime-results.json',JSON.stringify(results,null,2)+'\n');}console.log(JSON.stringify(results));
