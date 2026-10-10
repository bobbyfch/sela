import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanMetadata,readBookMetadata} from '../../src/book-metadata.js';
import Sela from '../../src/module.js';
test('book metadata is bounded and whitelisted, with publication dates separated from file creation',async()=>{
 const value=cleanMetadata({title:'x'.repeat(500),year:'invalid',description:'d'.repeat(5000),pageCount:Infinity,secret:'token',publicationDate:'2021-04-03',creationDate:'D:20240101'});
 assert.equal(value.title.length,180);assert.equal(value.description.length,4000);assert.equal(value.year,'2021');assert.equal(value.pageCount,undefined);assert.equal(value.secret,undefined);
 const pdf={getMetadata:async()=>({info:{Title:'Book',Author:'Writer',Subject:'Description',CreationDate:'D:20241010'}})};
 const metadata=await readBookMetadata({pdf,numPages:2},{publisher:'My edition'});assert.equal(metadata.year,undefined);assert.equal(metadata.author,'Writer');assert.equal(metadata.publisher,'My edition');assert.equal(metadata.pageCount,2);
 assert.deepEqual(cleanMetadata(null),{});assert.throws(()=>new Sela({ui:'unknown'}),/ui must/);
});
