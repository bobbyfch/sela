import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogCoverUrl} from '../../app/library/covers.ts';
import {externalBooks} from '../../app/library/external-catalogs.ts';
import {searchBooks} from '../../app/library/book-sources.ts';

test('cover URLs accept known public providers and reject arbitrary hosts',()=>{
  assert.equal(catalogCoverUrl('https://covers.openlibrary.org/b/id/123-M.jpg?default=false'),'https://covers.openlibrary.org/b/id/123-M.jpg?default=false');
  assert.equal(catalogCoverUrl('https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg'),'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg');
  assert.equal(catalogCoverUrl('http://books.google.com/books/content?id=abc-123&printsec=frontcover&img=1&zoom=1&source=gbs_api'),'https://books.google.com/books/content?id=abc-123&printsec=frontcover&img=1&zoom=1&source=gbs_api');
  assert.equal(catalogCoverUrl('https://books.google.com/books/content?id=abc-123'),undefined);
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

test('Open Library trending and genre routes map live records to trusted covers and origins',async()=>{
  const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async input=>{
      const url=new URL(String(input));
      if(url.pathname==='/trending/daily.json')return new Response(JSON.stringify({works:[{key:'/works/OL9W',title:'Trending Work',author_name:['Reader'],cover_i:909,first_publish_year:2025}]}),{status:200,headers:{'content-type':'application/json'}});
      if(url.pathname==='/subjects/fantasy.json')return new Response(JSON.stringify({work_count:1,works:[{key:'/works/OL10W',title:'Fantasy Work',authors:[{name:'Writer'}],cover_id:910,first_publish_year:2024}]}),{status:200,headers:{'content-type':'application/json'}});
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

test('Google Books provides recent titles and only its HTTPS purchase link',async()=>{
  const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async input=>{
      const url=new URL(String(input));
      assert.equal(url.hostname,'www.googleapis.com');
      assert.equal(url.searchParams.get('orderBy'),'newest');
      assert.equal(url.searchParams.get('country'),'US');
      assert.match(url.searchParams.get('q')||'',/subject:fiction/);
      return new Response(JSON.stringify({totalItems:1,items:[{id:'vol-1',volumeInfo:{title:'A New Story',authors:['A Writer'],publishedDate:'2026-04',language:'en',description:'A lovely book.',imageLinks:{thumbnail:'http://books.google.com/books/content?id=cover-1&printsec=frontcover&img=1&zoom=1&source=gbs_api'},infoLink:'https://books.google.com/books?id=vol-1'},saleInfo:{saleability:'FOR_SALE',buyLink:'https://books.google.com/books?id=vol-1&buy=1'}}]}),{status:200,headers:{'content-type':'application/json'}});
    };
    const result=await externalBooks({source:'google-books',category:'new',signal:new AbortController().signal});
    assert.equal(result.books[0].title,'A New Story');
    assert.equal(result.books[0].year,'2026');
    assert.equal(result.books[0].buyLink,'https://books.google.com/books?id=vol-1&buy=1');
    assert.equal(result.books[0].coverUrl,'https://books.google.com/books/content?id=cover-1&printsec=frontcover&img=1&zoom=1&source=gbs_api');
    assert.equal(result.next,false);
  }finally{globalThis.fetch=originalFetch;}
});

test('Google Books paid results preserve the regional buy and preview links plus the largest provided cover',async()=>{
  const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async input=>{
      const url=new URL(String(input));
      assert.equal(url.searchParams.get('filter'),'paid-ebooks');
      return new Response(JSON.stringify({totalItems:1,items:[{id:'paid-1',volumeInfo:{title:'A Paid Novel',authors:['A Writer'],previewLink:'https://books.google.com/books?id=paid-1&printsec=frontcover',imageLinks:{thumbnail:'http://books.google.com/books/content?id=paid-cover&img=1&zoom=1',extraLarge:'http://books.google.com/books/content?id=paid-cover&img=1&zoom=2'},infoLink:'https://books.google.com/books?id=paid-1'},saleInfo:{saleability:'FOR_SALE',buyLink:'https://play.google.com/store/books/details?id=paid-1',retailPrice:{amount:8.5,currencyCode:'USD'}},accessInfo:{viewability:'PARTIAL'}}]}),{status:200,headers:{'content-type':'application/json'}});
    };
    const result=await externalBooks({source:'google-books-paid',query:'A Paid Novel',signal:new AbortController().signal});
    assert.equal(result.books[0].accessType,'paid');
    assert.equal(result.books[0].previewLink,'https://books.google.com/books?id=paid-1&printsec=frontcover');
    assert.equal(result.books[0].buyLink,'https://play.google.com/store/books/details?id=paid-1');
    assert.match(result.books[0].coverDownloadUrl,/zoom=2/);
    assert.equal(result.books[0].googlePrice,8.5);
    assert.equal(result.books[0].googleCurrency,'USD');
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
