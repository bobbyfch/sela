const api=globalThis.browser||globalThis.chrome;
api.action.onClicked.addListener(()=>api.tabs.create({url:api.runtime.getURL('extension/library.html')}));
api.runtime.onInstalled.addListener(async()=>{
 await api.contextMenus.removeAll();api.contextMenus.create({id:'sela-open',title:'Open with Sela',contexts:['link'],targetUrlPatterns:['*://*/*.pdf*','*://*/*.epub*','*://*/*.cbz*','*://*/*.txt*','*://*/*.md*','*://*/*.fb2*']});
});
api.contextMenus.onClicked.addListener(info=>{if(info.menuItemId==='sela-open'&&/^https?:\/\//i.test(info.linkUrl||''))api.tabs.create({url:api.runtime.getURL('extension/viewer.html')+'?url='+encodeURIComponent(info.linkUrl)});});
