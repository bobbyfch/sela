import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchFile,MAX_IMPORT} from '../../library/network.js';
import Sela from '../../src/module.js';

test('cloud imports require HTTPS, bound sizes, omit credentials and sanitize file names',async()=>{
 const original=globalThis.fetch;let request;
 try{
  globalThis.fetch=async(url,options)=>{request={url,options};return new Response('A short book',{headers:{'Content-Type':'text/plain'}});};
  await assert.rejects(fetchFile('http://example.test/book','book.txt'),/HTTPS/);
  const file=await fetchFile('https://example.test/book','../book.txt',{headers:{Authorization:'Bearer test'}});
  assert.equal(await file.text(),'A short book');assert.equal(file.name,'.._book.txt');assert.equal(request.options.credentials,'omit');assert.equal(request.options.referrerPolicy,'no-referrer');
  globalThis.fetch=async()=>new Response('',{headers:{'Content-Length':String(MAX_IMPORT+1)}});
  await assert.rejects(fetchFile('https://example.test/book','book.txt'),/64 MB/);
  globalThis.fetch=async()=>new Response('',{status:403});await assert.rejects(fetchFile('https://example.test/book','book.txt'),/403/);
 }finally{globalThis.fetch=original;}
});
test('classic integrations resolve to the single responsive interface',()=>{
 assert.equal(new Sela().options.ui,'app');assert.equal(new Sela({ui:'classic'}).options.ui,'app');
});
