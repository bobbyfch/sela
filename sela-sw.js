/* Viewer assets only; documents supplied by the user are never cached. */
const VERSION='1.3.1',CACHE='sela-viewer-'+VERSION+'-r2',ROOT=new URL('./',self.location.href);
const local=path=>new URL(path,ROOT).href;
let allowed;
async function assetList(){if(!allowed)allowed=(async()=>{const response=await (await caches.open(CACHE)).match(local('offline-assets.json'));return new Set(response?(await response.json()).allowed:[]);})();return allowed;}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const response=await fetch(local('offline-assets.json'),{cache:'no-store'});if(!response.ok)throw new Error('Offline asset list unavailable');
 const assets=await response.clone().json();const cache=await caches.open(CACHE);await cache.addAll(assets.shell.map(local));await cache.put(local('offline-assets.json'),response);allowed=Promise.resolve(new Set(assets.allowed));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('sela-viewer-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),relative=url.href.slice(ROOT.href.length).split('?')[0];
 if(event.request.method!=='GET'||url.origin!==ROOT.origin||!url.href.startsWith(ROOT.href)||url.pathname.includes('/extension/'))return;
 const shell=event.request.mode==='navigate'&&[ROOT.pathname,ROOT.pathname+'index.html'].includes(url.pathname);
 const asset=/^(dist\/|site\/|logo\.svg$|favicon\.(svg|png)$|manifest\.webmanifest$)/.test(relative);
 if(!shell&&!asset)return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),key=shell?local('index.html'):event.request;
  if(!shell&&!(await assetList()).has(relative))return fetch(event.request);
  const hit=await cache.match(key);if(hit)return hit;
  const response=await fetch(event.request);if(response.ok&&response.type!=='opaque')await cache.put(key,response.clone());return response;
 })());
});
