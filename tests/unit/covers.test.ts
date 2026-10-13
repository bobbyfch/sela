import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogCoverUrl} from '../../app/library/covers.ts';
import {externalBooks} from '../../app/library/external-catalogs.ts';
import {searchBooks} from '../../app/library/book-sources.ts';

test('cover URLs accept known public providers and reject arbitrary hosts',()=>{
  assert.equal(catalogCoverUrl('https://covers.openlibrary.org/b/id/123-M.jpg?default=false'),'https://covers.openlibrary.org/b/id/123-M.jpg?default=false');
  assert.equal(catalogCoverUrl('https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg'),'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg');
  assert.equal(catalogCoverUrl('https://attacker.example/cover.jpg'),undefined);
  assert.equal(catalogCoverUrl('http://covers.openlibrary.org/b/id/123-M.jpg'),undefined);
});

test('Gutendex and Open Library results expose their real cover artwork',async()=>{
  const originalFetch=globalThis.fetch;
  const signal=new AbortController().signal;
  try{
    globalThis.fetch=async input=>{
      const url=String(input);
      if(url.startsWith('https://gutendex.com/'))return new Response(JSON.stringify({count:1,next:null,results:[{id:84,title:'Frankenstein',authors:[{name:'Mary Shelley'}],languages:['en'],subjects:['Science fiction'],formats:{'application/epub+zip':'https://www.gutenberg.org/ebooks/84.epub','image/jpeg':'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg'}}]}),{status:200,headers:{'content-type':'application/json'}});
      if(url.startsWith('https://openlibrary.org/'))return new Response(JSON.stringify({numFound:1,docs:[{key:'/works/OL123W',title:'Frankenstein',cover_i:98765,author_name:['Mary Shelley']}]}),{status:200,headers:{'content-type':'application/json'}});
      throw new Error('Unexpected request: '+url);
    };
    const gutenberg=await externalBooks({source:'gutendex',query:'Frankenstein',signal});
    const openLibrary=await externalBooks({source:'openlibrary',query:'Frankenstein',signal});
    assert.equal(gutenberg.books[0].coverUrl,'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg');
    assert.equal(openLibrary.books[0].coverUrl,'https://covers.openlibrary.org/b/id/98765-M.jpg?default=false');
  }finally{
    globalThis.fetch=originalFetch;
  }
});

test('GITenberg book IDs reuse Project Gutenberg covers and skip the catalog website',async()=>{
  const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async()=>new Response(JSON.stringify({total_count:2,items:[
      {id:1,name:'Frankenstein_84',description:'Frankenstein by Mary Shelley is a Project Gutenberg book, now on Github.',owner:{login:'GITenberg'}},
      {id:2,name:'gitenberg.github.com',description:'',owner:{login:'GITenberg'}}
    ]}),{status:200,headers:{'content-type':'application/json'}});
    const result=await searchBooks({source:'gitenberg',query:'Frankenstein cover fixture'});
    assert.equal(result.books.length,1);
    assert.equal(result.books[0].coverUrl,'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg');
  }finally{
    globalThis.fetch=originalFetch;
  }
});
