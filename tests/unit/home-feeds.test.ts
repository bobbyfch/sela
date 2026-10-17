import test from 'node:test';
import assert from 'node:assert/strict';
import {buildGoogleNewsUrl,buildNewsUrl,loadOnThisDay,loadTopicNews,parseAntaraRss,parseGoogleNews,readNewsSource,saveNewsSource,saveNewsTopics} from '../../app/library/home-feeds.ts';

test('home headlines follow the chosen topic language and only accept supported topics',()=>{
  const url=new URL(buildNewsUrl(['books','nature','books','other' as never],'ja-JP'));
  assert.equal(url.hostname,'api.gdeltproject.org');
  assert.match(url.searchParams.get('query')||'',/sourcelang:japanese/);
  assert.match(url.searchParams.get('query')||'',/本/);
  assert.match(url.searchParams.get('query')||'',/自然/);
  assert.doesNotMatch(url.searchParams.get('query')||'',/"/);
  assert.doesNotMatch(url.searchParams.get('query')||'',/other/);
  assert.deepEqual(saveNewsTopics(['technology','art','invalid','nature','books','science']),['technology','art','nature','books']);
});

test('Antara RSS preserves safe article and cover URLs while decoding summary text',()=>{
  const xml=`<?xml version="1.0"?><rss><channel><item><title><![CDATA[Buku &amp; sastra]]></title><link>https://www.antaranews.com/berita/123/contoh</link><description><![CDATA[<p>Ulasan &amp; kabar buku.</p>]]></description><pubDate>Tue, 13 Oct 2026 07:00:00 +0000</pubDate><media:thumbnail url="https://cdn.antaranews.com/cache/800x533/story.jpg"/></item><item><title>Unsafe</title><link>https://attacker.example/story</link><enclosure url="https://tracker.example/pixel.jpg"/></item></channel></rss>`;
  const items=parseAntaraRss(xml);assert.equal(items.length,1);assert.equal(items[0].title,'Buku & sastra');assert.equal(items[0].description,'Ulasan & kabar buku.');assert.equal(items[0].source,'ANTARA');assert.equal(items[0].image,'https://cdn.antaranews.com/cache/800x533/story.jpg');
  const currentFeed=parseAntaraRss('<rss><channel><item><title>Foto ANTARA</title><link>https://www.antaranews.com/berita/123/foto</link><enclosure url="https://img.antaranews.com/cache/800x533/foto.jpg"/></item></channel></rss>');assert.equal(currentFeed[0]?.image,'https://img.antaranews.com/cache/800x533/foto.jpg');
  assert.deepEqual(parseAntaraRss('<!DOCTYPE rss [<!ENTITY x SYSTEM "https://attacker.example/secret">]><rss/>'),[]);
});

test('Google News fallback follows the three shipped locales and keeps publisher links safe',()=>{
 const en=new URL(buildGoogleNewsUrl(['books','science'],'en-US')),ja=new URL(buildGoogleNewsUrl(['books'],'ja-JP')),id=new URL(buildGoogleNewsUrl(['books'],'id-ID'));
 expectRssBridge(en,'en-US');expectRssBridge(ja,'ja-JP');expectRssBridge(id,'id-ID');
 assert.match(new URL(en.searchParams.get('rss_url')!).searchParams.get('q')||'',/books OR literature/);
 assert.match(new URL(ja.searchParams.get('rss_url')!).searchParams.get('q')||'',/本 OR 文学/);
 assert.equal(new URL(id.searchParams.get('rss_url')!).searchParams.get('ceid'),'ID:id');assert.equal(new URL(id.searchParams.get('rss_url')!).searchParams.has('q'),false);
 const items=parseGoogleNews({status:'ok',items:[{title:'A book worth reading - The Example',link:'https://news.google.com/rss/articles/abc',description:'<a>Story summary</a>',pubDate:'2026-10-14',thumbnail:'https://images.example/cover.jpg'},{title:'Unsafe',link:'https://attacker.example/story'}]},['books'],'en');
 assert.equal(items.length,1);assert.equal(items[0].title,'A book worth reading');assert.equal(items[0].source,'The Example');assert.equal(items[0].description,'Story summary');assert.equal(items[0].image,'https://images.example/cover.jpg');
});

function expectRssBridge(url:URL,language:string){assert.equal(url.hostname,'api.rss2json.com');const feed=new URL(url.searchParams.get('rss_url')!);assert.equal(feed.searchParams.get('ceid'),language==='ja-JP'?'JP:ja':language==='id-ID'?'ID:id':'US:en');}

test('Indonesian news combines topic-specific ANTARA, Google News and GDELT sources',async()=>{
  const originalFetch=globalThis.fetch;
  try{
    const requested:string[]=[];globalThis.fetch=async input=>{const url=new URL(String(input));if(url.hostname==='www.antaranews.com'){requested.push(url.pathname);return new Response('<rss><channel><item><title>Ulasan buku hari ini</title><link>https://www.antaranews.com/berita/123/buku</link><description>Ringkasan buku.</description><enclosure url="https://cdn.antaranews.com/cache/800x533/buku.jpg"/></item></channel></rss>',{status:200});}if(url.hostname==='api.gdeltproject.org')return new Response(JSON.stringify({articles:[]}),{status:200});assert.equal(url.hostname,'api.rss2json.com');return new Response(JSON.stringify({status:'ok',items:[]}),{status:200});};
    const items=await loadTopicNews(['books'],'id-ID');assert.deepEqual(requested,['/rss/humaniora.xml']);assert.equal(items.length,1);assert.equal(items[0].source,'ANTARA · Humaniora');assert.equal(items[0].image,'https://cdn.antaranews.com/cache/800x533/buku.jpg');
  }finally{globalThis.fetch=originalFetch;}
});

test('news aggregator merges provider coverage, enriches missing covers and deduplicates matching headlines',async()=>{
 const originalFetch=globalThis.fetch,previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),values=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>values.set(key,value)}});
 try{
  globalThis.fetch=async input=>{const url=new URL(String(input));if(url.hostname==='www.antaranews.com')return new Response('<rss><channel><item><title>Ulasan buku hari ini</title><link>https://www.antaranews.com/berita/123/buku</link><description>Ringkasan buku.</description><pubDate>Wed, 14 Oct 2026 12:00:00 +0000</pubDate></item></channel></rss>',{status:200});if(url.hostname==='api.gdeltproject.org')return new Response(JSON.stringify({articles:[{title:'Ulasan buku hari ini',url:'https://publisher.example/books',domain:'publisher.example',seendate:'20261014T120000Z',socialimage:'https://images.example/book.jpg'},{title:'A new science story',url:'https://science.example/story',domain:'science.example',seendate:'20261014T110000Z'}]}),{status:200});assert.equal(url.hostname,'api.rss2json.com');return new Response(JSON.stringify({status:'ok',items:[{title:'Ulasan buku hari ini - Publisher',link:'https://news.google.com/rss/articles/duplicate',pubDate:'2026-10-14'},{title:'Buku langka tersembunyi - Books Weekly',link:'https://news.google.com/rss/articles/gem',pubDate:'2026-10-14',thumbnail:'https://images.example/gem.jpg'}]}),{status:200});};
  const items=await loadTopicNews(['books','science'],'id-ID');assert.equal(items.filter(item=>item.title.toLocaleLowerCase().includes('ulasan buku')).length,1);assert.equal(items.find(item=>item.title==='Ulasan buku hari ini')?.image,'https://images.example/book.jpg');assert.ok(items.some(item=>item.title==='A new science story'));assert.ok(items.some(item=>item.title==='Buku langka tersembunyi'));
 }finally{globalThis.fetch=originalFetch;if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete (globalThis as {localStorage?:unknown}).localStorage;}
});

test('Indonesian latest-news fallback keeps selected-topic matches only',async()=>{
 const originalFetch=globalThis.fetch,previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>null,setItem:()=>{}}});
 try{
  const requested:string[]=[];
  globalThis.fetch=async input=>{
   const url=new URL(String(input));
   if(url.hostname==='www.antaranews.com'){
    requested.push(url.pathname);
    const title=url.pathname==='/rss/terkini.xml'?'Kabar buku dan literasi terbaru':'Kabar politik hari ini';
    return new Response(`<rss><channel><item><title>${title}</title><link>https://www.antaranews.com/berita/123/contoh</link><description>${title}</description></item></channel></rss>`,{status:200});
   }
   if(url.hostname==='api.gdeltproject.org')return new Response(JSON.stringify({articles:[]}),{status:200});
   if(url.hostname==='api.rss2json.com')return new Response(JSON.stringify({status:'ok',items:[]}),{status:200});
   throw Error(`Unexpected source ${url.hostname}`);
  };
  const items=await loadTopicNews(['books'],'id-ID');
  assert.deepEqual(requested,['/rss/humaniora.xml','/rss/terkini.xml']);
  assert.equal(items.length,1);assert.match(items[0].title,/buku dan literasi/);
 }finally{globalThis.fetch=originalFetch;if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete (globalThis as {localStorage?:unknown}).localStorage;}
});

test('on-this-day uses the selected Wikipedia language and only keeps HTTPS Wikimedia article links',async()=>{
  const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async input=>{
      const url=new URL(String(input));
      assert.equal(url.hostname,'ja.wikipedia.org');
      assert.equal(url.pathname,'/api/rest_v1/feed/onthisday/selected/02/29');
      return new Response(JSON.stringify({selected:[
        {year:1990,text:'A notable event.',pages:[{title:'Event',content_urls:{desktop:{page:'https://ja.wikipedia.org/wiki/Event'}},thumbnail:{source:'https://upload.wikimedia.org/wikipedia/commons/example.jpg'}}]},
        {year:1991,text:'Unsafe link.',pages:[{title:'Unsafe',content_urls:{desktop:{page:'https://attacker.example/event'}}}]}
      ]}),{status:200,headers:{'content-type':'application/json'}});
    };
    const items=await loadOnThisDay('ja-JP',new Date('2024-02-29T12:00:00Z'),new AbortController().signal);
    assert.equal(items.length,1);
    assert.equal(items[0].title,'A notable event.');
    assert.equal(items[0].year,1990);
    assert.equal(items[0].image,'https://upload.wikimedia.org/wikipedia/commons/example.jpg');
  }finally{globalThis.fetch=originalFetch;}
});

test('Indonesian on-this-day feed never silently falls back to English',async()=>{
 const originalFetch=globalThis.fetch;
 try{
  globalThis.fetch=async input=>{assert.equal(new URL(String(input)).hostname,'id.wikipedia.org');return new Response(JSON.stringify({selected:[]}),{status:200,headers:{'content-type':'application/json'}});};
  assert.deepEqual(await loadOnThisDay('id-ID',new Date('2026-10-17T12:00:00Z'),new AbortController().signal),[]);
 }finally{globalThis.fetch=originalFetch;}
});

test('news sources keep the last successful stories when a fresh request is rate-limited',async()=>{
 const originalFetch=globalThis.fetch,previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),values=new Map<string,string>();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>values.set(key,value)}});
 try{
  const key='sela-home:news:en:books';values.set(key,JSON.stringify({at:Date.now()-20*60*1000,items:[{title:'Saved story',url:'https://news.example/saved',source:'Saved outlet'}]}));
  globalThis.fetch=async()=>new Response('rate limited',{status:429});
  const items=await loadTopicNews(['books'],'en-US');assert.equal(items[0]?.title,'Saved story');assert.equal(items[0]?.url,'https://news.example/saved');
 }finally{globalThis.fetch=originalFetch;if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete (globalThis as {localStorage?:unknown}).localStorage;}
});

test('Google News RSS keeps contributing headlines when GDELT rate-limits a non-Indonesian feed',async()=>{
 const originalFetch=globalThis.fetch,previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>null,setItem:()=>{}}});
 try{globalThis.fetch=async input=>{const url=new URL(String(input));if(url.hostname==='api.gdeltproject.org')return new Response('rate limited',{status:429});assert.equal(url.hostname,'api.rss2json.com');const feed=new URL(url.searchParams.get('rss_url')!);assert.equal(feed.searchParams.get('ceid'),'JP:ja');return new Response(JSON.stringify({status:'ok',items:[{title:'本の特集 - 出版社',link:'https://news.google.com/rss/articles/example',description:'文学の話題',pubDate:'2026-10-14'}]}),{status:200});};const items=await loadTopicNews(['books'],'ja-JP');assert.equal(items.length,1);assert.equal(items[0].title,'本の特集');assert.equal(items[0].source,'出版社');}finally{globalThis.fetch=originalFetch;if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete (globalThis as {localStorage?:unknown}).localStorage;}
});

test('readers can choose one news provider and provider caches stay separate',async()=>{
 const originalFetch=globalThis.fetch,previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),values=new Map<string,string>();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>values.set(key,value)}});
 try{
  const requested:string[]=[];
  globalThis.fetch=async input=>{const url=new URL(String(input));requested.push(url.hostname);if(url.hostname==='api.gdeltproject.org')return new Response(JSON.stringify({articles:[{title:'Science report',url:'https://science.example/report',domain:'science.example',seendate:'20261014T120000Z'}]}),{status:200});assert.equal(url.hostname,'api.rss2json.com');return new Response(JSON.stringify({status:'ok',items:[{title:'A book story - Publisher',link:'https://news.google.com/rss/articles/book',pubDate:'2026-10-14'}]}),{status:200});};
  const google=await loadTopicNews(['books'],'en-US',undefined,'google');assert.deepEqual(requested,['api.rss2json.com']);assert.equal(google[0]?.title,'A book story');
  requested.length=0;const gdelt=await loadTopicNews(['books'],'en-US',undefined,'gdelt');assert.deepEqual(requested,['api.gdeltproject.org']);assert.equal(gdelt[0]?.title,'Science report');
  saveNewsSource('gdelt');assert.equal(readNewsSource(),'gdelt');saveNewsSource('unsupported');assert.equal(readNewsSource(),'auto');
 }finally{globalThis.fetch=originalFetch;if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete (globalThis as {localStorage?:unknown}).localStorage;}
});

test('ANTARA can be selected only with Indonesian app language',async()=>{
 const originalFetch=globalThis.fetch;let requested=false;
 try{
  globalThis.fetch=async()=>{requested=true;return new Response('<rss><channel/></rss>',{status:200});};
  await assert.rejects(loadTopicNews(['books'],'en-US',undefined,'antara'),/available when the app language is Indonesian/);assert.equal(requested,false);
 }finally{globalThis.fetch=originalFetch;}
});
