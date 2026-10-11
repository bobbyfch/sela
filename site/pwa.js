let prompt;
const button=document.querySelector('#install-app'),status=document.querySelector('#offline-status');
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;button.hidden=false;});
button.addEventListener('click',async()=>{if(!prompt)return;await prompt.prompt();await prompt.userChoice;prompt=null;button.hidden=true;});
window.addEventListener('appinstalled',()=>{button.hidden=true;});
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
 navigator.serviceWorker.register(new URL('../sela-sw.js',import.meta.url),{scope:new URL('../',import.meta.url).href}).then(async registration=>{
  const ready=await navigator.serviceWorker.ready;
  status.textContent=document.documentElement.lang==='id'?'Viewer siap untuk file lokal offline. Mesin tambahan tersimpan setelah dibuka online.':'Viewer ready for local files offline. Additional engines are cached after opening online.';
  registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)status.textContent=document.documentElement.lang==='id'?'Pembaruan siap. Tutup semua jendela Sela lalu buka kembali.':'Update ready. Close all Sela windows, then reopen.';});});
 }).catch(()=>{status.textContent=document.documentElement.lang==='id'?'Cache offline belum tersedia di browser ini.':'Offline cache is unavailable in this browser.';});
}
