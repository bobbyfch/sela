import test from 'node:test';
import assert from 'node:assert/strict';
import {buildGuardianNewsUrl,loadOnThisDay,loadTopicNews,parseAntaraRss,parseGuardianRss,readNewsSource,saveNewsSource,saveNewsTopics} from '../../app/library/home-feeds.ts';

async function withLocalStorage<T>(run:(values:Map<string,string>)=>Promise<T>):Promise<T>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),values=new Map<string,string>();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>values.set(key,value)}});
 try{return await run(values);}finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete (globalThis as {localStorage?:unknown}).localStorage;}
}

test('news feeds map each supported topic to one fixed Guardian RSS category',()=>{
 const paths={books:'/books/rss',science:'/science/rss',nature:'/environment/rss',art:'/artanddesign/rss',technology:'/technology/rss',culture:'/culture/rss'};
 for(const [topic,path] of Object.entries(paths))assert.equal(buildGuardianNewsUrl(topic as keyof typeof paths),`https://proxy.cors.dev/https://www.theguardian.com${path}`);
 assert.throws(()=>buildGuardianNewsUrl('invalid' as never),/Unsupported news topic/);
 assert.deepEqual(saveNewsTopics(['technology','art','invalid','nature','books','science']),['technology','art','nature','books']);
});

test('Guardian RSS parser decodes text and accepts only Guardian articles and image hosts',()=>{
 const xml=`<?xml version="1.0"?><rss><channel><item><title><![CDATA[Books &amp; culture]]></title><link>https://www.theguardian.com/books/2026/oct/14/example</link><description><![CDATA[&lt;p&gt;A &amp; B&lt;/p&gt;]]></description><pubDate>Wed, 14 Oct 2026 12:00:00 +0000</pubDate><media:content url="https://i.guim.co.uk/image/example.jpg" medium="image"/></item><item><title>Unsafe URL</title><link>https://attacker.example/story</link><enclosure url="https://tracker.example/pixel.jpg"/></item></channel></rss>`;
 const items=parseGuardianRss(xml);assert.equal(items.length,1);assert.equal(items[0].title,'Books & culture');assert.equal(items[0].description,'A & B');assert.equal(items[0].source,'The Guardian');assert.equal(items[0].image,'https://i.guim.co.uk/image/example.jpg');
 assert.deepEqual(parseGuardianRss('<!DOCTYPE rss [<!ENTITY x SYSTEM "https://attacker.example/secret">]><rss/>'),[]);
});

test('ANTARA RSS preserves safe article and cover URLs while decoding summary text',()=>{
 const xml=`<?xml version="1.0"?><rss><channel><item><title><![CDATA[Buku &amp; sastra]]></title><link>https://www.antaranews.com/berita/123/contoh</link><description><![CDATA[<p>Ulasan &amp; kabar buku.</p>]]></description><pubDate>Tue, 13 Oct 2026 07:00:00 +0000</pubDate><media:thumbnail url="https://cdn.antaranews.com/cache/800x533/story.jpg"/></item><item><title>Unsafe</title><link>https://attacker.example/story</link><enclosure url="https://tracker.example/pixel.jpg"/></item></channel></rss>`;
 const items=parseAntaraRss(xml);assert.equal(items.length,1);assert.equal(items[0].title,'Buku & sastra');assert.equal(items[0].description,'Ulasan & kabar buku.');assert.equal(items[0].source,'ANTARA');assert.equal(items[0].image,'https://cdn.antaranews.com/cache/800x533/story.jpg');
 assert.deepEqual(parseAntaraRss('<!DOCTYPE rss [<!ENTITY x SYSTEM "https://attacker.example/secret">]><rss/>'),[]);
});

test('Indonesian automatic news prefers matching ANTARA stories and falls back to Guardian when the category is empty',async()=>withLocalStorage(async()=>{
 const originalFetch=globalThis.fetch;
 try{
  const requested:string[]=[];
  globalThis.fetch=async input=>{const url=new URL(String(input));requested.push(url.href);if(url.hostname==='www.antaranews.com')return new Response('<rss><channel/></rss>',{status:200});assert.equal(url.hostname,'proxy.cors.dev');return new Response('<rss><channel><item><title>Books and readers</title><link>https://www.theguardian.com/books/2026/oct/14/story</link></item></channel></rss>',{status:200});};
  const items=await loadTopicNews('books','id-ID');assert.deepEqual(requested,['https://www.antaranews.com/rss/humaniora.xml','https://www.antaranews.com/rss/terkini.xml',buildGuardianNewsUrl('books')]);assert.equal(items.length,1);assert.equal(items[0].source,'The Guardian');
 }finally{globalThis.fetch=originalFetch;}
}));

test('multi-topic requests and tab changes remain category-isolated',async()=>withLocalStorage(async()=>{
 const originalFetch=globalThis.fetch;
 try{
  const requested:string[]=[];
  globalThis.fetch=async input=>{const url=new URL(String(input)).href;requested.push(url);return new Response(`<rss><channel><item><title>${url.includes('/books/rss')?'Books feature':'Science report'}</title><link>https://www.theguardian.com/${url.includes('/books/rss')?'books':'science'}/2026/oct/14/story</link></item></channel></rss>`,{status:200});};
  const books=await loadTopicNews('books','en-US'),science=await loadTopicNews('science','en-US');assert.deepEqual(requested,[buildGuardianNewsUrl('books'),buildGuardianNewsUrl('science')]);assert.deepEqual(books.map(item=>item.title),['Books feature']);assert.deepEqual(science.map(item=>item.title),['Science report']);
 }finally{globalThis.fetch=originalFetch;}
}));

test('selected sources fall back to the other verified provider and retain publisher attribution',async()=>withLocalStorage(async()=>{
 const originalFetch=globalThis.fetch;
 try{
  const requested:string[]=[];
  globalThis.fetch=async input=>{const url=new URL(String(input));requested.push(url.href);if(url.hostname==='proxy.cors.dev')return new Response('unavailable',{status:503});return new Response('<rss><channel><item><title>Kabar literasi</title><link>https://www.antaranews.com/berita/123/literasi</link><description>Buku hari ini.</description></item></channel></rss>',{status:200});};
  const items=await loadTopicNews('books','id-ID',undefined,'guardian');assert.deepEqual(requested,[buildGuardianNewsUrl('books'),'https://www.antaranews.com/rss/humaniora.xml']);assert.equal(items[0]?.source,'ANTARA · Humaniora');
 }finally{globalThis.fetch=originalFetch;}
}));

test('news uses the last successful category cache if a provider is temporarily rate-limited',async()=>withLocalStorage(async values=>{
 const originalFetch=globalThis.fetch;values.set('sela-home:news:en:books',JSON.stringify({at:Date.now()-20*60*1000,items:[{title:'Saved story',url:'https://news.example/saved',source:'Saved outlet'}]}));
 try{globalThis.fetch=async()=>new Response('rate limited',{status:429});const items=await loadTopicNews('books','en-US');assert.equal(items[0]?.title,'Saved story');assert.equal(items[0]?.url,'https://news.example/saved');}finally{globalThis.fetch=originalFetch;}
}));

test('legacy unavailable provider preferences migrate to automatic source selection',async()=>withLocalStorage(async values=>{
 values.set('sela-home:news-source','gdelt');assert.equal(readNewsSource(),'auto');assert.equal(saveNewsSource('google'),'auto');assert.equal(readNewsSource(),'auto');saveNewsSource('guardian');assert.equal(readNewsSource(),'guardian');saveNewsSource('unsupported');assert.equal(readNewsSource(),'auto');
}));

test('ANTARA can be selected only with Indonesian app language',async()=>withLocalStorage(async()=>{
 const originalFetch=globalThis.fetch;let requested=false;
 try{globalThis.fetch=async()=>{requested=true;return new Response('<rss><channel/></rss>',{status:200});};await assert.rejects(loadTopicNews('books','en-US',undefined,'antara'),/available when the app language is Indonesian/);assert.equal(requested,false);}finally{globalThis.fetch=originalFetch;}
}));

test('on-this-day uses the selected Wikipedia language and only keeps HTTPS Wikimedia article links',async()=>{
 const originalFetch=globalThis.fetch;
 try{
  globalThis.fetch=async input=>{const url=new URL(String(input));assert.equal(url.hostname,'ja.wikipedia.org');assert.equal(url.pathname,'/api/rest_v1/feed/onthisday/selected/02/29');return new Response(JSON.stringify({selected:[{year:1990,text:'A notable event.',pages:[{title:'Event',content_urls:{desktop:{page:'https://ja.wikipedia.org/wiki/Event'}},thumbnail:{source:'https://upload.wikimedia.org/wikipedia/commons/example.jpg'}}]},{year:1991,text:'Unsafe link.',pages:[{title:'Unsafe',content_urls:{desktop:{page:'https://attacker.example/event'}}}]}]}),{status:200,headers:{'content-type':'application/json'}});};
  const items=await loadOnThisDay('ja-JP',new Date('2024-02-29T12:00:00Z'),new AbortController().signal);assert.equal(items.length,1);assert.equal(items[0].title,'A notable event.');assert.equal(items[0].year,1990);assert.equal(items[0].image,'https://upload.wikimedia.org/wikipedia/commons/example.jpg');
 }finally{globalThis.fetch=originalFetch;}
});

test('Indonesian on-this-day feed never silently falls back to English',async()=>{
 const originalFetch=globalThis.fetch;
 try{globalThis.fetch=async input=>{assert.equal(new URL(String(input)).hostname,'id.wikipedia.org');return new Response(JSON.stringify({selected:[]}),{status:200,headers:{'content-type':'application/json'}});};assert.deepEqual(await loadOnThisDay('id-ID',new Date('2026-10-17T12:00:00Z'),new AbortController().signal),[]);}finally{globalThis.fetch=originalFetch;}
});
