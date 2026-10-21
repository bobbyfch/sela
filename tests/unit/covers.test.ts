import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogCoverUrl, catalogCoverUrlForQuality} from '../../app/library/covers.ts';
import {externalBooks} from '../../app/library/external-catalogs.ts';
import {searchBooks} from '../../app/library/book-sources.ts';

test('cover URLs accept known public providers and reject arbitrary hosts',()=>{
  assert.equal(catalogCoverUrl('https://covers.openlibrary.org/b/id/123-M.jpg?default=false'),'https://covers.openlibrary.org/b/id/123-M.jpg?default=false');
  assert.equal(catalogCoverUrl('https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg'),'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg');
  assert.equal(catalogCoverUrl('http://books.google.com/books/content?id=abc-123&printsec=frontcover&img=1&zoom=1&source=gbs_api'),'https://books.google.com/books/content?id=abc-123&printsec=frontcover&img=1&zoom=1&source=gbs_api');
  assert.equal(catalogCoverUrl('https://books.google.com/books?id=abc-123&printsec=frontcover&img=1&zoom=4&edge=curl&source=gbs_api'),'https://books.google.com/books/content?id=abc-123&printsec=frontcover&img=1&zoom=4&source=gbs_api');
  assert.equal(catalogCoverUrl('https://books.google.com/books/content?id=abc-123'),undefined);
  assert.equal(catalogCoverUrl('https://attacker.example/cover.jpg'),undefined);
  assert.equal(catalogCoverUrl('http://covers.openlibrary.org/b/id/123-M.jpg'),undefined);
});

test('the chosen cover size resolves to the same provider rendition for display and download',()=>{
  const medium='https://covers.openlibrary.org/b/id/123-M.jpg?default=false';
  const large='https://covers.openlibrary.org/b/id/123-L.jpg?default=false';
  assert.equal(catalogCoverUrlForQuality(medium,'sd',large),medium);
  assert.equal(catalogCoverUrlForQuality(medium,'hd',large),large);
  assert.equal(catalogCoverUrlForQuality('https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg','hd'),'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg');

  const thumbnail='https://books.google.com/books?id=abc-123&printsec=frontcover&img=1&zoom=1&source=gbs_api';
  const high='https://books.google.com/books?id=abc-123&printsec=frontcover&img=1&zoom=4&source=gbs_api';
  assert.equal(catalogCoverUrlForQuality(thumbnail,'sd',high),'https://books.google.com/books/content?id=abc-123&printsec=frontcover&img=1&zoom=1&source=gbs_api');
  assert.equal(catalogCoverUrlForQuality(thumbnail,'hd',high),'https://books.google.com/books/content?id=abc-123&printsec=frontcover&img=1&zoom=4&source=gbs_api');
});

test('Gutendex and Open Library results expose their real cover artwork',async()=>{
  const originalFetch=globalThis.fetch;
  const signal=new AbortController().signal;
  try{
    globalThis.fetch=async input=>{
      const url=String(input);
      if(url.startsWith('https://proxy.cors.dev/https://gutendex.com/'))return new Response(JSON.stringify({count:1,next:null,results:[{id:84,title:'Frankenstein',authors:[{name:'Mary Shelley'}],languages:['en'],subjects:['Science fiction'],formats:{'application/epub+zip':'https://www.gutenberg.org/ebooks/84.epub','image/jpeg':'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg'}}]}),{status:200,headers:{'content-type':'application/json'}});
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

test('Open Library trending and genre routes map live records to trusted covers and origins',async()=>{
  const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async input=>{
      const url=new URL(String(input));
      if(url.pathname.endsWith('/trending/daily.json'))return new Response(JSON.stringify({works:[{key:'/works/OL9W',title:'Trending Work',author_name:['Reader'],cover_i:909,first_publish_year:2025}]}),{status:200,headers:{'content-type':'application/json'}});
      if(url.pathname.endsWith('/subjects/fantasy.json'))return new Response(JSON.stringify({work_count:1,works:[{key:'/works/OL10W',title:'Fantasy Work',authors:[{name:'Writer'}],cover_id:910,first_publish_year:2024}]}),{status:200,headers:{'content-type':'application/json'}});
      throw new Error('Unexpected request: '+url.href);
    };
    const signal=new AbortController().signal;
    const trending=await externalBooks({source:'openlibrary-trending',signal});
    const fantasy=await externalBooks({source:'openlibrary',category:'fantasy',signal});
    assert.equal(trending.books[0].trendingRank,1);
    assert.equal(trending.books[0].external,'https://openlibrary.org/works/OL9W');
    assert.equal(trending.books[0].coverUrl,'https://covers.openlibrary.org/b/id/909-M.jpg?default=false');
    assert.equal(trending.books[0].coverDownloadUrl,'https://covers.openlibrary.org/b/id/909-L.jpg?default=false');
    assert.equal(fantasy.books[0].external,'https://openlibrary.org/works/OL10W');
    assert.equal(fantasy.books[0].coverUrl,'https://covers.openlibrary.org/b/id/910-M.jpg?default=false');
    await assert.rejects(externalBooks({source:'openlibrary',category:'https://attacker.example',signal}),/Unsupported book category/);
  }finally{globalThis.fetch=originalFetch;}
});

test('BookRank returns attributed comic rankings as metadata and source links only',async()=>{
  const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async input=>{const url=new URL(String(input));assert.equal(url.hostname,'openbookrank.com');assert.equal(url.pathname,'/api/v1/rankings/comics.json');return new Response(JSON.stringify({name:'Comics',items:[{slug:'maus',title:'Maus',author:'Art Spiegelman',rank:1,score:98.2,ratings:1200,url:'https://openbookrank.com/books/maus'}]}),{status:200,headers:{'content-type':'application/json'}});};
    const result=await externalBooks({source:'bookrank',category:'comics',query:'Maus',signal:new AbortController().signal});
    assert.equal(result.books[0].title,'Maus');assert.equal(result.books[0].trendingRank,1);assert.equal(result.books[0].rating,98.2);assert.equal(result.books[0].external,'https://openbookrank.com/books/maus');assert.match(result.books[0].rights,/CC BY 4.0/);assert.equal(result.books[0].url,undefined);assert.equal(result.books[0].format,undefined);
  }finally{globalThis.fetch=originalFetch;}
});

test('Gutendex recent collection maps to newer catalog IDs and selected topics',async()=>{
  const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async input=>{const url=new URL(String(input));assert.equal(url.searchParams.get('sort'),'descending');assert.equal(url.searchParams.get('topic'),'comic');assert.equal(url.searchParams.get('page'),'2');return new Response(JSON.stringify({count:25,next:'https://gutendex.com/books/?page=3',results:[{id:9200,title:'A Comic Story',authors:[{name:'A Writer'}],languages:['en'],subjects:['Comics'],formats:{'text/plain':'https://www.gutenberg.org/ebooks/9200.txt.utf-8'}}]}),{status:200,headers:{'content-type':'application/json'}});};
    const result=await externalBooks({source:'gutendex',query:'comic',page:2,category:'comics',collection:'recent',signal:new AbortController().signal});assert.equal(result.books[0].title,'A Comic Story');assert.equal(result.books[0].url,undefined);assert.equal(result.books[0].external,'https://www.gutenberg.org/ebooks/9200');assert.equal(result.next,true);
  }finally{globalThis.fetch=originalFetch;}
});

test('Open Library hidden gems are identified by ratings, not presented as sales rankings',async()=>{
  const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async input=>{
      const url=new URL(String(input));
      assert.equal(url.searchParams.get('sort'),'rating desc');
      return new Response(JSON.stringify({numFound:2,docs:[
        {key:'/works/OLhiddenW',title:'Quiet Discovery',author_name:['A Reader'],cover_i:881,ratings_average:4.3,ratings_count:24},
        {key:'/works/OLpopularW',title:'Very Popular',ratings_average:4.8,ratings_count:9000,cover_i:882}
      ]}),{status:200,headers:{'content-type':'application/json'}});
    };
    const result=await externalBooks({source:'openlibrary-hidden',signal:new AbortController().signal});
    assert.equal(result.books.length,1);
    assert.equal(result.books[0].id,'/works/OLhiddenW');
    assert.equal(result.books[0].coverDownloadUrl,'https://covers.openlibrary.org/b/id/881-L.jpg?default=false');
    assert.match(result.books[0].rights,/not a sales ranking/i);
  }finally{globalThis.fetch=originalFetch;}
});

test('public catalogs retry a 429 once and keep credential-free, bounded fetch options',async()=>{
  const originalFetch=globalThis.fetch;let calls=0;const query='retry-fixture-'+Math.random().toString(36).slice(2);
  try{
    globalThis.fetch=async(input,init)=>{calls++;assert.match(String(input),/^https:\/\/proxy\.cors\.dev\/https:\/\/gutendex\.com\//);assert.equal(init?.credentials,'omit');assert.equal(init?.referrerPolicy,'no-referrer');assert.ok(init?.signal);if(calls===1)return new Response('',{status:429,headers:{'retry-after':'0'}});return new Response(JSON.stringify({count:0,results:[]}),{status:200,headers:{'content-type':'application/json'}});};
    const result=await externalBooks({source:'gutendex',query,signal:new AbortController().signal});assert.equal(result.books.length,0);assert.equal(calls,2);
  }finally{globalThis.fetch=originalFetch;}
});

test('catalog adapters reject invalid payload shapes and discard malformed records',async()=>{
  const originalFetch=globalThis.fetch;let payload:unknown,query='shape-fixture-'+Math.random().toString(36).slice(2);
  try{
    payload=[];globalThis.fetch=async()=>new Response(JSON.stringify(payload),{status:200,headers:{'content-type':'application/json'}});
    await assert.rejects(externalBooks({source:'gutendex',query,signal:new AbortController().signal}),/invalid response/);
    payload={count:2,results:'not-an-array'};await assert.rejects(externalBooks({source:'gutendex',query:query+'-rows',signal:new AbortController().signal}),/invalid list/);
    payload={count:2,results:[null,{id:1,title:'Valid record',authors:[],languages:[],subjects:[],formats:{}},{id:'bad',title:'Invalid ID'},{id:2,title:''}]};
    const result=await externalBooks({source:'gutendex',query:query+'-filtered',signal:new AbortController().signal});assert.deepEqual(result.books.map(book=>book.title),['Valid record']);
  }finally{globalThis.fetch=originalFetch;}
});

test('catalogs use a recent cached result on temporary failure and reject permanent 404s',async()=>{
  const originalFetch=globalThis.fetch,originalNow=Date.now;let now=originalNow(),calls=0;const query='stale-fixture-'+Math.random().toString(36).slice(2);
  try{
    Date.now=()=>now;globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({count:1,results:[{id:1,title:'Cached record',authors:[],languages:[],subjects:[],formats:{}}]}),{status:200,headers:{'content-type':'application/json'}});};
    const first=await externalBooks({source:'gutendex',query,signal:new AbortController().signal});assert.equal(first.books[0].title,'Cached record');now+=11*60_000;
    globalThis.fetch=async()=>{calls++;return new Response('',{status:503});};const fallback=await externalBooks({source:'gutendex',query,signal:new AbortController().signal});assert.equal(fallback.books[0].title,'Cached record');assert.equal(calls,4);
    globalThis.fetch=async()=>{calls++;return new Response('',{status:404});};await assert.rejects(externalBooks({source:'gutendex',query,signal:new AbortController().signal}),/404/);assert.equal(calls,5);
  }finally{Date.now=originalNow;globalThis.fetch=originalFetch;}
});

test('catalog requests stop immediately when the caller aborts',async()=>{
  const originalFetch=globalThis.fetch,controller=new AbortController();let calls=0;
  try{globalThis.fetch=async()=>{calls++;controller.abort();throw new DOMException('Stopped','AbortError');};await assert.rejects(externalBooks({source:'gutendex',query:'abort-fixture-'+Math.random().toString(36).slice(2),signal:controller.signal}));assert.equal(calls,1);}finally{globalThis.fetch=originalFetch;}
});
