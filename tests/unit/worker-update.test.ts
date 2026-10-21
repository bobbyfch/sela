import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('waiting worker defers activation until other Sela windows are closed',async()=>{
 const handlers: Record<string, any>={},messages=[];let activated=0,pages=[{url:'https://example.test/sela/app/'},{url:'https://example.test/sela/app/#/shelf'}];
 const self={location:{href:'https://example.test/sela/app/sw.js'},addEventListener(name,fn){(handlers[name]??=[]).push(fn);},clients:{matchAll:async()=>pages},skipWaiting:async()=>activated++};
 vm.runInNewContext(await readFile(new URL('../../app/sw.js',import.meta.url),'utf8'),{self,URL});
 const dispatch=async()=>{let task;handlers.message[0]({data:{type:'ACTIVATE_UPDATE'},source:{postMessage(message){messages.push(message.type);}},waitUntil(promise){task=promise;}});await task;};
 await dispatch();assert.equal(activated,0);assert.deepEqual(messages,['UPDATE_BLOCKED']);
 pages=[pages[0],{url:'https://example.test/unrelated/'}];await dispatch();assert.equal(activated,1);
});
