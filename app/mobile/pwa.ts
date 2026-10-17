/* Updating the application never clears book storage. */
import {bottomSheet,notify} from '../library/controls.ts';
import {translate} from '../../src/i18n.ts';
const button=document.getElementById('install-mobile-app'),status=document.getElementById('mobile-offline-status');
const check=document.getElementById('check-update'),updateStatus=document.getElementById('update-status');
const t=(en,id)=>translate(en,id,document.documentElement.lang||'en-US');
const standalone=()=>matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;
const read=key=>{try{return localStorage.getItem(key);}catch{return null;}};
const save=(key,value)=>{try{localStorage.setItem(key,String(value));}catch{}};
type InstallPrompt=Event&{prompt:()=>Promise<unknown>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
let prompt:InstallPrompt|undefined,registration:ServiceWorkerRegistration|undefined,activating=false,lastCheck=0,installedThisSession=false,installSheet:ReturnType<typeof bottomSheet>|undefined;
const busy=()=>!!document.querySelector('.library-reader-overlay,.book-info-dialog[open],#books:disabled,#restore-library:disabled,#export-library:disabled,#share-library:disabled');
function browserAndOS(){const ua=navigator.userAgent,platform=(navigator as Navigator&{userAgentData?:{platform?:string}}).userAgentData?.platform||navigator.platform||'',ios=/iPhone|iPad|iPod/i.test(ua)||platform==='MacIntel'&&navigator.maxTouchPoints>1,os=ios?'iOS':/Android/i.test(ua)?'Android':/Windows/i.test(platform+' '+ua)?'Windows':/Mac/i.test(platform+' '+ua)?'macOS':/CrOS/i.test(ua)?'ChromeOS':/Linux/i.test(platform+' '+ua)?'Linux':'this device',browser=/Edg(?:e|A|iOS)?\//.test(ua)?'Edge':/SamsungBrowser\//.test(ua)?'Samsung Internet':/OPR\//.test(ua)?'Opera':/Firefox\//.test(ua)?'Firefox':/CriOS\//.test(ua)?'Chrome':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'your browser';return {browser,os,ios};}
function isInstalled(){return installedThisSession||standalone()||read('sela-installed')==='true';}
function feedback(copy,tone:'info'|'error'|'success'='info'){if(status){delete status.dataset.offlineState;status.textContent=copy;}notify(copy,tone);}
function offlineStatus(state:'preparing'|'ready'|'unavailable'){
 if(!status)return;
 const copy=state==='preparing'?['Preparing the offline app…','Menyiapkan app offline…']:state==='ready'?['Bookshelf ready for local files offline. Keep a backup.','Rak siap untuk berkas lokal offline. Tetap simpan cadangan.']:['Offline shell unavailable; keep your originals.','Shell offline belum tersedia; simpan berkas asli.'];
 status.dataset.offlineState=state;status.textContent=t(copy[0],copy[1]);
}
document.addEventListener('sela:language',()=>{const state=status?.dataset.offlineState;if(state==='preparing'||state==='ready'||state==='unavailable')offlineStatus(state);});
if(status)status.classList.add('sr-only');
function installHelp(){const {browser,os,ios}=browserAndOS();if(ios)return t('Open the Share menu in '+browser+' and choose “Add to Home Screen”. If shown, turn on “Open as Web App”, then tap Add.','Buka menu Bagikan di '+browser+' lalu pilih “Tambahkan ke Layar Utama”. Jika tersedia, aktifkan “Buka sebagai App Web”, lalu ketuk Tambahkan.');if(browser==='Safari'&&os==='macOS')return t('In Safari, choose File → Add to Dock. Sela will open in its own window.','Di Safari, pilih File → Tambahkan ke Dock. Sela akan terbuka di jendelanya sendiri.');if(browser==='Firefox'&&os==='Windows')return t('In Firefox for Windows 143 or newer (150 or newer when installed from the Microsoft Store), use the Web Apps button in the address bar. If it is not shown, check your version, installation source, or bookmark this page.','Di Firefox Windows versi 143 atau lebih baru (150 atau lebih baru jika dipasang dari Microsoft Store), gunakan tombol Web Apps di bilah alamat. Jika tidak muncul, periksa versi, sumber pemasangan, atau bookmark halaman ini.');if(browser==='Edge')return t('Open the Edge menu, choose Apps, then Install this site as an app.','Buka menu Edge, pilih Apps, lalu Install this site as an app.');if(browser==='Chrome'||browser==='Opera'||browser==='Samsung Internet'){return os==='Android'?t('Open the browser menu and choose Install app or Add to Home screen.','Buka menu browser lalu pilih Install app atau Tambahkan ke Layar Utama.'):t('Open the browser menu and choose Install Sela or Install page as app.','Buka menu browser lalu pilih Install Sela atau Install page as app.');}if(browser==='Firefox'&&os==='Android')return t('Firefox on Android can add a home-screen shortcut, which opens Sela in Firefox. Use the browser menu and choose Add to Home screen.','Firefox di Android dapat menambahkan pintasan ke layar utama yang membuka Sela di Firefox. Buka menu browser lalu pilih Tambahkan ke Layar Utama.');if(browser==='Firefox')return t('Firefox does not install manifest-based PWAs on this operating system. Bookmark this page or open it in a supported browser.','Firefox belum memasang PWA berbasis manifest pada sistem operasi ini. Bookmark halaman ini atau buka di browser yang mendukung.');return t('Open your browser menu and look for Install app or Add to Home screen. If neither is available, bookmark this page.','Buka menu browser dan cari Install app atau Tambahkan ke Layar Utama. Jika tidak tersedia, bookmark halaman ini.');}
const banner=document.createElement('aside');banner.className='pwa-notice';banner.hidden=true;banner.setAttribute('role','status');
const message=document.createElement('p'),apply=document.createElement('button'),later=document.createElement('button');
apply.type=later.type='button';banner.append(message,apply,later);document.body.append(banner);
function notice(copy,action,label,install=false){message.textContent=copy;apply.textContent=label;apply.onclick=action;later.textContent=t('Later','Nanti');later.onclick=()=>{banner.hidden=true;if(install)save('sela-install-dismissed',Date.now());};banner.hidden=false;}
function waiting(){if(!registration?.waiting)return;notice(t('An update is ready. Your books and progress stay on this device.','Pembaruan siap. Buku dan progres tetap tersimpan di perangkat ini.'),()=>{
 if(busy()){const copy=t('Close the reader and finish importing before updating.','Tutup reader dan selesaikan impor sebelum memperbarui.');message.textContent=copy;feedback(copy,'error');return;}
 activating=true;apply.disabled=true;message.textContent=t('Updating safely… Sela will reopen when ready.','Memperbarui dengan aman… Sela akan terbuka kembali setelah siap.');feedback(message.textContent);registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
},t('Update now','Perbarui sekarang'));}
async function install(){
 if(isInstalled()){feedback(t('Sela is already installed.','Sela sudah terpasang.'));return;}
 if(prompt){const event=prompt;prompt=undefined;try{await event.prompt();const result=await event.userChoice;if(result.outcome==='accepted'){banner.hidden=true;installedThisSession=true;save('sela-installed','true');if(button)(button as HTMLButtonElement).hidden=true;feedback(t('Sela is installed.','Sela sudah terpasang.'),'success');}else{save('sela-install-dismissed',Date.now());feedback(t('No problem. You can install Sela later from this button.','Tidak apa-apa. Sela bisa dipasang nanti lewat tombol ini.'));}}catch(error){feedback(error instanceof Error?error.message:String(error),'error');}return;}
 const {browser,os}=browserAndOS(),body=document.createElement('div');body.className='personal-sheet install-guide';const copy=document.createElement('p');copy.textContent=installHelp();body.append(copy);const detail=document.createElement('small');detail.textContent=t('Detected browser: ','Browser terdeteksi: ')+browser+' · '+os;body.append(detail);installSheet?.destroy();const sheet=installSheet=bottomSheet(t('Install Sela','Pasang Sela'),body);sheet.element.addEventListener('close',()=>{sheet.destroy();if(installSheet===sheet)installSheet=undefined;},{once:true});sheet.open();
}
if(button){const installButton=button as HTMLButtonElement;installButton.onclick=()=>void install();if(isInstalled()){installButton.hidden=true;if(standalone())save('sela-installed','true');}}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event as InstallPrompt;if(button)(button as HTMLButtonElement).hidden=isInstalled();});
window.addEventListener('appinstalled',()=>{prompt=undefined;installedThisSession=true;save('sela-installed','true');banner.hidden=true;if(button)(button as HTMLButtonElement).hidden=true;feedback(t('Sela is installed.','Sela sudah terpasang.'),'success');});
function invite(){if(isInstalled()||registration?.waiting||Date.now()-Number(read('sela-install-dismissed')||0)<7*86400000||!prompt&&!browserAndOS().ios)return;
 notice(t('Install Sela for a dedicated reading window and your offline shelf.','Pasang Sela untuk jendela baca tersendiri dan rak offline.'),()=>void install(),t('Install Sela','Pasang Sela'),true);}
document.getElementById('books')?.addEventListener('change',()=>setTimeout(invite,1500));
async function checkWorker(manual=false){
 if(!registration||!navigator.onLine){if(manual){const copy=t('Connect to check for an app update.','Hubungkan internet untuk memeriksa pembaruan app.');if(updateStatus)updateStatus.textContent=copy;feedback(copy,'error');}return;}
 if(!manual&&Date.now()-lastCheck<3600000)return;lastCheck=Date.now();
 if(manual){(check as HTMLInputElement).disabled=true;if(updateStatus)updateStatus.textContent=t('Checking app files…','Memeriksa berkas app…');}
 try{await registration.update();save('sela-update-last-checked',Date.now());if(registration.waiting){waiting();const copy=t('Update ready. Use Update now to reload safely.','Pembaruan siap. Gunakan Perbarui sekarang untuk memuat ulang.');if(updateStatus)updateStatus.textContent=copy;if(manual)feedback(copy,'success');}else if(manual){const copy=t('App checked. Updates appear here when ready.','App diperiksa. Pembaruan akan tampil di sini setelah siap.');if(updateStatus)updateStatus.textContent=copy;feedback(copy,'success');}}
 catch{if(manual){const copy=t('Could not check. Try again online.','Belum bisa memeriksa. Coba lagi saat online.');if(updateStatus)updateStatus.textContent=copy;feedback(copy,'error');}}
 finally{if(manual&&check)(check as HTMLInputElement).disabled=false;}
}
if('serviceWorker'in navigator){
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(activating)location.reload();});
 navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='UPDATE_BLOCKED'){activating=false;apply.disabled=false;const copy=t('Close other Sela windows before updating, then try again.','Tutup jendela Sela lainnya sebelum memperbarui, lalu coba lagi.');message.textContent=copy;feedback(copy,'error');}});
 try{
  registration=await navigator.serviceWorker.register(new URL('./sw.js',import.meta.url),{scope:new URL('./',import.meta.url).href,updateViaCache:'none'});
  offlineStatus('preparing');
  void navigator.serviceWorker.ready.then(()=>{if(status&&!new URL(location.href).searchParams.has('incoming'))offlineStatus('ready');else if(status)delete status.dataset.offlineState;});
  if(check){const releaseCheck=check.onclick;check.onclick=async()=>{lastCheck=0;await checkWorker(true);await (releaseCheck as (() => unknown) | null)?.();};}
  registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)waiting();});});
  if(registration.waiting)waiting();void checkWorker();
  window.addEventListener('online',()=>void checkWorker());document.addEventListener('visibilitychange',()=>{if(!document.hidden)void checkWorker();});
 }catch{offlineStatus('unavailable');feedback(status?.textContent||t('Offline shell unavailable; keep your originals.','Shell offline belum tersedia; simpan berkas asli.'),'error');}
}
async function receive(files){const {receiveFiles}=await import('../library/library.ts');return receiveFiles(files);}
if('launchQueue'in window)window.launchQueue.setConsumer(async launch=>{
 try{const files=[];for(const handle of launch.files||[])files.push(await handle.getFile());if(files.length)await receive(files);}catch{feedback(t('Could not open this file. Add it using +.','Berkas belum dapat dibuka. Tambahkan melalui +.'),'error');}
});
const incoming=new URL(location.href).searchParams.get('incoming');
if(incoming==='error')feedback(t('Could not receive files. Add them using +.','Berkas belum dapat diterima. Tambahkan melalui +.'),'error');
if(incoming==='1'){
 let db;const share=new URL(location.href).searchParams.get('share'),key=share&&/^share:[a-f0-9-]{36}$/.test(share)?share:'pending';
 try{
  db=await new Promise<IDBDatabase>((resolve,reject)=>{const req=indexedDB.open('sela-incoming',1);req.onupgradeneeded=()=>req.result.createObjectStore('files');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  const records=await new Promise<Array<{name:string;type:string;bytes:ArrayBuffer}>>((resolve,reject)=>{const req=db.transaction('files').objectStore('files').get(key);req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});
  if(records.length){const result=await receive(records.map(r=>new File([r.bytes],r.name,{type:r.type})));if(result?.length===records.length)await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').delete(key);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});}
 }catch{feedback(t('Import unfinished. Keep originals and retry with +.','Impor belum selesai. Simpan berkas asli dan coba melalui +.'),'error');}
 finally{db?.close();const url=new URL(location.href);url.searchParams.delete('incoming');url.searchParams.delete('share');history.replaceState(history.state,'',url);}
}
