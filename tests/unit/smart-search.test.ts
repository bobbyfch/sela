import test from 'node:test';
import assert from 'node:assert/strict';
import {expandBookQuery,searchLibraryBooks} from '../../app/library/smart-search.ts';

test('Indonesian intent words expand into useful book-search terms',()=>{
  const query=expandBookQuery('aku ingin cari buku novel SMA cinta indo').toLocaleLowerCase('id');
  for(const term of ['romance','remaja','indonesia','dilan'])assert.ok(query.includes(term),`${term} should be included`);
  assert.ok(!query.includes('aku ingin cari buku'));
});

test('on-device Orama search finds matching metadata without leaving the device',async()=>{
  const books=[
    {id:'dilan',name:'Dilan 1990',metadata:{author:'Pidi Baiq',description:'Novel romantis remaja Indonesia berlatar sekolah menengah.'}},
    {id:'mystery',name:'The Hound of the Baskervilles',metadata:{author:'Arthur Conan Doyle',description:'A detective mystery.'}},
  ];
  const ids=await searchLibraryBooks(books,'aku ingin cari buku novel SMA cinta indo','id-ID');
  assert.ok(ids.includes('dilan'));
  assert.ok(!ids.includes('mystery'));
});
