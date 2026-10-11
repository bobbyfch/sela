/* Updating the application never clears book storage. */
const button=document.getElementById('install-mobile-app'),status=document.getElementById('mobile-offline-status');
const check=document.getElementById('check-update'),updateStatus=document.getElementById('update-status');
const t=(en,id)=>document.documentElement.lang==='id'?id:en;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const read=key=>{try{return localStorage.getItem(key);}catch{return null;}};
const save=(key,value)=>{try{localStorage.setItem(key,String(value));}catch{}};
let prompt,registration,activating=false,lastCheck=0;
const busy=()=>!!document.querySelector('.library-reader-overlay,.book-info-dialog[open],#books:disabled,#restore-library:disabled,#export-library:disabled,#share-library:disabled');
const banner=document.createElement('aside');banner.className='pwa-notice';banner.hidden=true;banner.setAttribute('role','status');
const message=document.createElement('p'),apply=document.createElement('button'),later=document.createElement('button');
apply.type=later.type='button';banner.append(message,apply,later);document.body.append(banner);
function notice(copy,action,label,install=false){message.textContent=copy;apply.textContent=label;apply.onclick=action;later.textContent=t('Later','Nanti');later.onclick=()=>{banner.hidden=true;if(install)save('sela-install-dismissed',Date.now());};banner.hidden=false;}
function waiting(){if(!registration?.waiting)return;notice(t('An update is ready. Your books and progress stay on this device.','Pembaruan siap. Buku dan progres tetap tersimpan di perangkat ini.'),()=>{
 if(busy()){message.textContent=t('Close the reader and finish importing before updating.','Tutup reader dan selesaikan impor sebelum memperbarui.');return;}
 activating=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
},t('Update now','Perbarui sekarang'));}
async function install(){
 if(standalone()){status.textContent=t('Sela is already installed.','Sela sudah terpasang.');return;}
 if(prompt){const event=prompt;prompt=null;await event.prompt();const result=await event.userChoice;if(result.outcome==='accepted')banner.hidden=true;else save('sela-install-dismissed',Date.now());}
 else status.textContent=window.SelaPlatform?.ios?t('Safari: Share → Add to Home Screen.','Safari: Bagikan → Tambahkan ke Layar Utama.'):t('Browser menu → Install app or Add to Home Screen. Support depends on your browser.','Menu browser → Pasang aplikasi atau Tambahkan ke Layar Utama. Dukungan bergantung pada browser.');
}
button.onclick=()=>void install();
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;});
window.addEventListener('appinstalled',()=>{prompt=null;banner.hidden=true;status.textContent=t('Sela is installed.','Sela sudah terpasang.');});
function invite(){if(standalone()||registration?.waiting||Date.now()-Number(read('sela-install-dismissed')||0)<7*86400000||(!prompt&&!window.SelaPlatform?.ios))return;
 notice(t('Install Sela for a dedicated reading window and your offline shelf.','Pasang Sela untuk jendela baca tersendiri dan rak offline.'),()=>void install(),t('Install Sela','Pasang Sela'),true);}
document.getElementById('books')?.addEventListener('change',()=>setTimeout(invite,1500));
async function checkWorker(manual=false){
 if(!registration||!navigator.onLine){if(manual)updateStatus.textContent=t('Connect to check for an app update.','Hubungkan internet untuk memeriksa pembaruan app.');return;}
 if(!manual&&Date.now()-lastCheck<3600000)return;lastCheck=Date.now();
 if(manual){check.disabled=true;updateStatus.textContent=t('Checking app files…','Memeriksa berkas app…');}
 try{await registration.update();save('sela-update-last-checked',Date.now());if(registration.waiting){waiting();updateStatus.textContent=t('Update ready. Use Update now to reload safely.','Pembaruan siap. Gunakan Perbarui sekarang untuk memuat ulang.');}else if(manual)updateStatus.textContent=t('App checked. Updates appear here when ready.','App diperiksa. Pembaruan akan tampil di sini setelah siap.');}
 catch{if(manual)updateStatus.textContent=t('Could not check. Try again online.','Belum bisa memeriksa. Coba lagi saat online.');}
 finally{if(manual)check.disabled=false;}
}
if('serviceWorker'in navigator){
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(activating)location.reload();});
 navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='UPDATE_BLOCKED'){activating=false;message.textContent=t('Close other Sela windows before updating, then try again.','Tutup jendela Sela lainnya sebelum memperbarui, lalu coba lagi.');}});
 try{
  registration=await navigator.serviceWorker.register(new URL('./sw.js',import.meta.url),{scope:new URL('./',import.meta.url).href,updateViaCache:'none'});
  status.textContent=t('Preparing the offline app…','Menyiapkan app offline…');
  void navigator.serviceWorker.ready.then(()=>{if(!new URL(location.href).searchParams.has('incoming'))status.textContent=t('Bookshelf ready for local files offline. Keep a backup.','Rak siap untuk berkas lokal offline. Tetap simpan cadangan.');});
  if(check){const releaseCheck=check.onclick;check.onclick=()=>{lastCheck=0;void checkWorker();releaseCheck?.();};}
  registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)waiting();});});
  if(registration.waiting)waiting();void checkWorker();
  window.addEventListener('online',()=>void checkWorker());document.addEventListener('visibilitychange',()=>{if(!document.hidden)void checkWorker();});
 }catch{status.textContent=t('Offline shell unavailable; keep your originals.','Shell offline belum tersedia; simpan berkas asli.');}
}
async function receive(files){const {receiveFiles}=await import('../library/library.js');return receiveFiles(files);}
if('launchQueue'in window)window.launchQueue.setConsumer(async launch=>{
 try{const files=[];for(const handle of launch.files||[])files.push(await handle.getFile());if(files.length)await receive(files);}catch{status.textContent=t('Could not open this file. Add it using +.','Berkas belum dapat dibuka. Tambahkan melalui +.');}
});
const incoming=new URL(location.href).searchParams.get('incoming');
if(incoming==='error')status.textContent=t('Could not receive files. Add them using +.','Berkas belum dapat diterima. Tambahkan melalui +.');
if(incoming==='1'){
 let db;const share=new URL(location.href).searchParams.get('share'),key=share&&/^share:[a-f0-9-]{36}$/.test(share)?share:'pending';
 try{
  db=await new Promise((resolve,reject)=>{const req=indexedDB.open('sela-incoming',1);req.onupgradeneeded=()=>req.result.createObjectStore('files');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  const records=await new Promise((resolve,reject)=>{const req=db.transaction('files').objectStore('files').get(key);req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});
  if(records.length){const result=await receive(records.map(r=>new File([r.bytes],r.name,{type:r.type})));if(result?.length===records.length)await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').delete(key);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});}
 }catch{status.textContent=t('Import unfinished. Keep originals and retry with +.','Impor belum selesai. Simpan berkas asli dan coba melalui +.');}
 finally{db?.close();const url=new URL(location.href);url.searchParams.delete('incoming');url.searchParams.delete('share');history.replaceState(history.state,'',url);}
}
