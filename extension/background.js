const api=globalThis.browser||globalThis.chrome;
if(typeof importScripts==='function')importScripts('updates.js');
async function checkUpdates(){
 const settings=await api.storage.local.get(['selaUpdateAuto','selaUpdateState']);
 if(settings.selaUpdateAuto===false)return;
 try{const state=await SelaUpdates.check(api.runtime.getManifest().version);await api.storage.local.set({selaUpdateState:state});await api.action.setBadgeText({text:state.available?'↑':''});await api.action.setBadgeBackgroundColor({color:'#236947'});}catch{/* Offline and rate limits leave the last successful result intact. */}
}
api.alarms.onAlarm.addListener(alarm=>{if(alarm.name==='sela-release-check')void checkUpdates();});
api.runtime.onStartup.addListener(()=>void checkUpdates());
api.action.onClicked.addListener(()=>api.tabs.create({url:api.runtime.getURL('extension/library.html')}));
api.runtime.onInstalled.addListener(async()=>{
 await api.alarms.create('sela-release-check',{periodInMinutes:1440});void checkUpdates();
 await api.contextMenus.removeAll();api.contextMenus.create({id:'sela-open',title:'Open with Sela',contexts:['link'],targetUrlPatterns:['*://*/*.pdf*','*://*/*.epub*','*://*/*.cbz*','*://*/*.txt*','*://*/*.md*','*://*/*.fb2*']});
});
api.contextMenus.onClicked.addListener(info=>{if(info.menuItemId==='sela-open'&&/^https?:\/\//i.test(info.linkUrl||''))api.tabs.create({url:api.runtime.getURL('extension/viewer.html')+'?url='+encodeURIComponent(info.linkUrl)});});
