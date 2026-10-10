// Product-specific reader chrome. The reusable CDN viewer remains unchanged.
export function configureLibraryReader(reader,{mobile,language='en'}={}){
 const overlay=reader.overlay;if(!overlay)return;
 overlay.dataset.productReader=mobile?'mobile':'home';
 const header=overlay.querySelector('.library-reader-header');
 const actions=header.querySelector('.library-reader-actions');
 const close=actions.querySelector('.library-reader-close');
 const title=header.querySelector('.library-reader-title');
 const tools=actions.querySelector('[aria-label="'+(language==='id'?'Alat baca':'Reading tools')+'"]');
 const icon=close.querySelector('path');if(icon)icon.setAttribute('d','m14 5-7 7 7 7M7 12h14');
 close.title=language==='id'?'Kembali ke rak':'Back to library';
 close.setAttribute('aria-label',close.title);header.prepend(close);
 if(mobile){
  const menu=document.createElement('details');menu.className='app-reader-menu';
  const summary=document.createElement('summary');summary.setAttribute('aria-label',language==='id'?'Pilihan bacaan':'Reading options');summary.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>';
  const panel=document.createElement('div');panel.className='app-reader-menu-panel';
  for(const child of [...actions.children])if(child!==tools)panel.append(child);
  menu.append(summary,panel);actions.append(menu);
  summary.addEventListener('click',()=>{if(!menu.open)reader.hideTools?.();});
  tools?.addEventListener('click',()=>{menu.open=false;});
 }
 title.title=title.textContent;
}
