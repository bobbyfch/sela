(async()=>{
if(SelaPlatform.modern){
 try{
 document.getElementById('legacy-mobile').hidden=true;
 await import('../dist/js/sela.esm.js').then(m=>{window.Sela=m.default||m.Sela;});
 await import('../library/updates.js');const library=await import('../library/library.js');await library.libraryReady;await import('./pwa.js');
 document.getElementById('mobile-app').hidden=false;document.getElementById('mobile-app').dataset.ready='true';
 }catch{document.getElementById('mobile-app').hidden=true;document.getElementById('legacy-mobile').hidden=false;document.getElementById('device-notice').hidden=false;document.getElementById('device-notice').textContent='Bookshelf could not initialize local storage. Your originals remain yours. / Rak belum dapat membuka penyimpanan lokal. Simpan berkas asli.';}
}

})();
