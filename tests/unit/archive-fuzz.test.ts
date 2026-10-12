import test from 'node:test';
import assert from 'node:assert/strict';
import {zipSync} from 'fflate';
import {decodeArchive} from '../../src/archive-codec.ts';
test('deterministic malformed ZIP corpus remains bounded and never accepts traversal',()=>{
 let random=0x53454c41;const next=()=>{random^=random<<13;random^=random>>>17;random^=random<<5;return random>>>0;};
 const valid=zipSync({'book.txt':new TextEncoder().encode('A short private story')});
 for(let i=0;i<256;i++){
  const bytes=i%2?valid.slice(0,next()%valid.length):new Uint8Array(next()%256);
  if(i%2===0)for(let k=0;k<bytes.length;k++)bytes[k]=next()%256;
  let files:ReturnType<typeof decodeArchive>;try{files=decodeArchive(bytes);}catch(error){assert(error instanceof Error);continue;}assert(Object.keys(files).length<=2000);assert(Object.values(files).reduce((sum,value)=>sum+value.byteLength,0)<=128*1048576);
 }
 for(const name of ['../a','a/../../b','a\\..\\b','/etc/passwd','D:/book','\\\\host\\share'])assert.throws(()=>decodeArchive(zipSync({[name]:new Uint8Array([1])})),/Unsafe archive path/);
});
