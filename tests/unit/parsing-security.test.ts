import test from 'node:test';
import assert from 'node:assert/strict';
import {zipSync} from 'fflate';
import {extractArchive,readBackupArchive,validateEpub} from '../../src/archive.ts';

test('archives reject traversal, malformed input, excessive entry counts and advertised expansion',()=>{
  for(const path of ['../outside.txt','/outside.txt','..\\outside.txt','C:/outside.txt','\\server\\outside.txt'])assert.throws(()=>extractArchive(zipSync({[path]:new Uint8Array([1])})),/Unsafe archive path/);
  assert.throws(()=>readBackupArchive(zipSync({'../outside':new Uint8Array()})),/safety limits/);
  assert.throws(()=>extractArchive(new Uint8Array([0,1,2,3])));
  const many: Record<string,Uint8Array>={};for(let i=0;i<501;i++)many['file'+i]=new Uint8Array();
  assert.throws(()=>readBackupArchive(zipSync(many)),/safety limits/);
  const bomb=zipSync({'file.txt':new Uint8Array([1])});const view=new DataView(bomb.buffer,bomb.byteOffset,bomb.byteLength);
  for(let offset=0;offset<bomb.length-24;offset++)if(view.getUint32(offset,true)===0x02014b50){view.setUint32(offset+24,33*1024*1024,true);break;}
  assert.throws(()=>extractArchive(bomb),/expansion exceeds/);
  assert.throws(()=>validateEpub({}),/Not an EPUB/);
});
