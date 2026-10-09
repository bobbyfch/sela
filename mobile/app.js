(async()=>{
if(SelaPlatform.mobile&&SelaPlatform.modern){
 try{
 document.getElementById('legacy-mobile').hidden=true;
 await import('../dist/js/sela.esm.js').then(m=>{window.Sela=m.default||m.Sela;});
 await import('../extension/updates.js');await import('../extension/library.js');await import('./pwa.js');
 document.getElementById('mobile-app').hidden=false;document.getElementById('mobile-app').dataset.ready='true';
 const buttons=[...document.querySelectorAll('[data-tab]')];for(const b of buttons)b.onclick=()=>{buttons.forEach(x=>x.setAttribute('aria-current',String(x===b)));const tab=b.dataset.tab;if(tab==='add')document.getElementById('books').click();else if(tab==='search'){document.getElementById('search').scrollIntoView({block:'center'});document.getElementById('search').focus();}else if(tab==='settings'){document.querySelector('.library-info').open=true;document.querySelector('.library-info').scrollIntoView();}else if(tab==='continue')document.dispatchEvent(new Event('sela:continue'));else document.querySelector('.library').scrollIntoView();};
 }catch{document.getElementById('mobile-app').hidden=true;document.getElementById('legacy-mobile').hidden=false;document.getElementById('device-notice').hidden=false;document.getElementById('device-notice').textContent='Bookshelf could not initialize local storage. Your originals remain yours. / Rak belum dapat membuka penyimpanan lokal. Simpan berkas asli.';}
}

})();
