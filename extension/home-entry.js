(async()=>{
if(SelaPlatform.desktop&&SelaPlatform.modern){
 try{
 const {Sela}=await import('../dist/js/sela.esm.js');window.Sela=Sela;
 await import('./library.js');await import('./home.js');
 document.getElementById('home-app').hidden=false;document.getElementById('home-app').dataset.ready='true';
 }catch{document.getElementById('home-device-notice').hidden=false;document.getElementById('home-device-notice').textContent='Home could not open local storage. Keep your original files; try another browser or use Viewer. / Home belum dapat membuka penyimpanan lokal. Simpan berkas asli; coba browser lain atau Viewer.';}
}else if(SelaPlatform.desktop){document.getElementById('home-device-notice').hidden=false;document.getElementById('home-device-notice').textContent='Sela Home needs a modern desktop browser. / Sela Home memerlukan browser desktop modern.';document.getElementById('home-app').hidden=true;}

})();
