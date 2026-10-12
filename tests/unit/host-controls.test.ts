import test from 'node:test';
import assert from 'node:assert/strict';
import Sela from '../../src/module.ts';
import {createReaderHost} from '../../src/host-controls.ts';
test('host loaders cancel superseded requests and custom renderers release stale mounts',async()=>{
 const viewer=new Sela();let signal:AbortSignal|undefined;
 const host=createReaderHost(viewer,{loaders:[{id:'pending',accepts:()=>true,load:(_source,abort)=>{signal=abort;return new Promise((_resolve,reject)=>abort.addEventListener('abort',()=>reject(new DOMException('cancelled','AbortError')),{once:true}));}}]});
 const pending=host.open('file.txt');host.close();await assert.rejects(pending,{name:'AbortError'});assert.equal(signal?.aborted,true);host.destroy();host.destroy();await assert.rejects(host.open('file.txt'),{name:'AbortError'});
 let release=0,complete:((value:()=>void)=>void)|undefined;
 const custom=createReaderHost(new Sela(),{container:{} as HTMLElement,renderers:[{id:'custom',accepts:()=>true,mount:()=>new Promise(resolve=>{complete=resolve;})}]});
 const mounted=custom.open('custom');custom.close();complete?.(()=>release++);await assert.rejects(mounted,{name:'AbortError'});assert.equal(release,1);custom.destroy();
});
test('annotation stores use a host key, enforce limits and abort on destruction',async()=>{
 const viewer=new Sela();let signal:AbortSignal|undefined,stored:unknown;
 const host=createReaderHost(viewer,{documentKey:'local-book',storage:{read:async(key,abort)=>{assert.equal(key,'local-book');signal=abort;return [];},write:async(_key,values)=>{stored=values;}}});
 assert.deepEqual(await host.annotations(),[]);await host.saveAnnotations([{id:'a',page:1,text:'passage'}]);assert.deepEqual(stored,[{id:'a',page:1,text:'passage'}]);await assert.rejects(host.saveAnnotations([{id:'bad',page:0,text:''}]),RangeError);viewer.destroy();assert.equal(signal?.aborted,true);await assert.rejects(host.annotations(),{name:'AbortError'});
});
