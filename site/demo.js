(function () {
'use strict';
var viewer, selectedUrl;
var status = document.querySelector('#status');
var theme = document.querySelector('#theme');
var language = document.querySelector('#language');
var translations = {
eyebrow:'SATU READER. BERBAGAI STACK.',headline:'Lebih banyak membaca.<br>Lebih sedikit setup.',intro:'Reader open source untuk dokumen, buku, dan komik.<br>Pasang di website, atau simpan rak offline pribadi.',try:'Coba pembacanya ↓',original:'NOVELET INDONESIA ORISINAL',storySub:'50 halaman · 12 bab · ingatan yang menyisakan sesuatu',demoEyebrow:'NYAMANKAN DIRIMU',demoHeading:'Empat cara membaca.',lazy:'Mesin PDF dimuat hanya saat membaca.',bookTitle:'Balik halamannya.',bookText:'Lipatan kertas, bayangan lembut, dan dua halaman seperti buku.',webtoonTitle:'Ikuti ceritanya.',webtoonText:'Baca vertikal. Halaman terdekat dirender saat kamu menggulir.',singleTitle:'Satu halaman dulu.',singleText:'Satu halaman, lebih fokus. Nyaman juga di layar kecil.',mangaTitle:'Mulai dari kanan.',mangaText:'Balik halaman dan tombol panah kanan ke kiri. Urutan PDF tetap.',read:'Mulai membaca ↗',upload:'Coba dengan file kamu.',privacy:'Buku tetap di browsermu. Tanpa unggahan atau akun.',download:'Unduh PDF Yang Tidak Ikut Pulang ↗',dropHint:'Tarik PDF, EPUB, komik, atau dokumen teks ke sini — atau pilih file.',browse:'Pilih file ↗',clear:'Hapus pilihan',playEyebrow:'ATUR SESUKAMU',playTitle:'Konfigurasi langsung.',launch:'Buka reader ↗',presentationLabel:'Penempatan',documentLabel:'Dokumen',modeLabel:'Mode baca',filterLabel:'Filter baca',gapLabel:'Jarak halaman vertikal',motionLabel:'Durasi lipatan',zoomLabel:'Zoom / ukuran teks',paperLabel:'Tekstur kertas',wheelLabel:'Zoom dengan roda mouse biasa',soundLabel:'Suara halaman',playNote:'Ctrl + roda mouse atau pinch trackpad untuk zoom. Gulir biasa tetap nyaman. Tekan ? di reader untuk shortcut. EPUB memakai navigasi bab.',formatNote:'PDF, EPUB, komik dan teks punya alat baca opsional: daftar isi, pencarian, narasi dan catatan. FB2 hanya teks; DjVu memakai decoder GPL-2.0 eksternal.',installTitle:'Pasang viewer di website.',installText:'CI3, Laravel, Vue, React, Svelte, Astro, atau HTML biasa. Bootstrap dan Tailwind boleh dipakai, keduanya tidak wajib.',docs:'Panduan pemasangan & integrasi ↗',filtersTitle:'Ruang baca lebih nyaman',filtersText:'Warna asli, hitam putih, sepia, kontras tinggi, serta warna hangat dan dingin. Warna netral bisa membantu saat warna sulit dibedakan; kebutuhan tiap orang berbeda.',compatTitle:'Tetap ada jalan membaca',compatText:'Browser modern mendapat viewer lengkap. Browser lama membuka PDF asli melalui compatibility entry. Dukungan Windows, macOS, Linux, Android, dan iOS mengikuti kemampuan browser.',openTitle:'Open source, asal jelas',openText:'Reader MIT, mesin halaman PDFlipbook, dan PDF.js Apache-2.0 yang dimuat saat dibutuhkan. Navigasi keyboard, progres tersimpan, dan bookmark tersedia.',themeLabel:'Tampilan',regionNote:'Bahasa kunjungan pertama memakai negara IP dari country.is; pilihan tersimpan diutamakan. Dokumen tidak dikirim. Tambahkan ?geo=off untuk menonaktifkan.'};
Object.assign(translations,{"cdnInstall": "</> Pasang viewer CDN", "extensionInstall": "↧ Unduh extension", "viewerStepsTitle": "Viewer CDN · 3 langkah", "viewerStep1": "Salin script dengan versi tetap di atas ke HTML atau template aplikasi.", "viewerStep2": "Atur URL dokumen; izinkan origin melalui CORS jika dokumen berada di host berbeda.", "viewerStep3": "Panggil reader.open(). Pilih container embed atau overlay layar penuh.", "integrationLink": "Contoh framework & self-hosting ↗", "extensionStepsTitle": "Extension rak buku pribadi", "extensionStep1": "Unduh ZIP rilis untuk Chromium atau Firefox. Satu paket per browser untuk toolbar dan new tab.", "extensionStep2": "Ekstrak ZIP. Di Chrome/Edge, buka Extensions, aktifkan Developer mode, lalu Load unpacked.", "extensionStep3": "Pin Sela dan buka ikonnya. Tambahkan buku; berkas tetap di browser ini.", "releaseLink": "↧ Unduh rilis terbaru", "extensionLimit": "Paket pengembangan: Chromium memakai Load unpacked; Firefox sementara sampai ditandatangani. Toolbar dan new tab memakai edisi yang sama. Pemeriksaan rilis memberi pemberitahuan, bukan mengganti kode otomatis.", "extensionGuide": "Panduan instalasi browser lengkap ↗", "pwaTitle": "Tambahkan viewer ke homescreen", "pwaText": "Gunakan ikon install atau menu Add to Home Screen browser. Buka berkas sekali saat online untuk menyimpan mesin bacanya. Viewer terpasang dapat membuka file lokal offline; tidak memiliki rak buku.", "installApp": "＋ Pasang viewer", "filtersText": "Dua belas preset halaman, slider kecerahan dokumen, dan kontrol redup. Tab terpisah untuk daftar isi, pencarian, tampilan, narasi, catatan, dan teks yang bisa diseleksi."});
Object.assign(translations,{eyebrow:'RUANG BACA PRIBADIMU',headline:'Buku-bukumu.<br>Selalu dekat.',intro:'Baca buku, komik dan dokumen dengan nyaman. Simpan rak offline dan lanjutkan dari halaman terakhir.'});
var nodes = document.querySelectorAll('[data-i18n]');
var original = [];
for (var i=0;i<nodes.length;i++) original.push(nodes[i].innerHTML);
function save(key,value){try{localStorage.setItem('flippy-site:'+key,value);}catch(e){}}
function read(key,fallback){try{return localStorage.getItem('flippy-site:'+key)||fallback;}catch(e){return fallback;}}
var languageChosen=!!read('language','');
function localize(persist){
 var id=language.value==='id';document.documentElement.lang=id?'id':'en';
 for(var i=0;i<nodes.length;i++) nodes[i].innerHTML=id?(translations[nodes[i].getAttribute('data-i18n')]||original[i]):original[i];
 Array.prototype.forEach.call(document.querySelectorAll('[data-theme-choice]'),function(button){var names=id?{auto:'Tema sistem',light:'Tema terang',dark:'Tema gelap'}:{auto:'System theme',light:'Light theme',dark:'Dark theme'};button.setAttribute('aria-label',names[button.dataset.themeChoice]);button.title=names[button.dataset.themeChoice];});
 if(persist!==false){languageChosen=true;save('language',language.value);}
 Array.prototype.forEach.call(document.querySelectorAll('[data-language-choice]'),function(button){button.setAttribute('aria-pressed',String(button.dataset.languageChoice===language.value));});
}
function applyTheme(){document.documentElement.setAttribute('data-theme',theme.value);save('theme',theme.value);Array.prototype.forEach.call(document.querySelectorAll('[data-theme-choice]'),function(button){button.setAttribute('aria-pressed',String(button.dataset.themeChoice===theme.value));});if(viewer&&viewer.overlay)viewer.overlay.setAttribute('data-flippy-theme',theme.value);}
theme.value=/^(auto|light|dark)$/.test(read('theme','auto'))?read('theme','auto'):'auto';
language.value=read('language',/^id\b/i.test(navigator.language)?'id':'en')==='id'?'id':'en';localize(false);applyTheme();
if(!languageChosen&&location.protocol==='https:'&&new URLSearchParams(location.search).get('geo')!=='off'&&window.fetch&&window.AbortController){
 var regionAbort=new AbortController(),regionTimeout=setTimeout(function(){regionAbort.abort();},2500);
 fetch('https://api.country.is/',{signal:regionAbort.signal,credentials:'omit',referrerPolicy:'no-referrer'}).then(function(response){if(!response.ok)throw new Error('Region unavailable');return response.json();}).then(function(data){if(!languageChosen&&/^[A-Z]{2}$/.test(data.country)){language.value=data.country==='ID'?'id':'en';localize(false);}}).catch(function(){}).finally(function(){clearTimeout(regionTimeout);});
}
Array.prototype.forEach.call(document.querySelectorAll('[data-theme-choice]'),function(button){button.addEventListener('click',function(){theme.value=button.dataset.themeChoice;applyTheme();});});theme.addEventListener('change',applyTheme);language.addEventListener('change',localize);
Array.prototype.forEach.call(document.querySelectorAll('[data-language-choice]'),function(button){button.addEventListener('click',function(){language.value=button.dataset.languageChoice;localize();});});
var selectedFile, generation=0;
var input=document.querySelector('#pdf-file'),drop=document.querySelector('#drop-zone');
var settings=document.querySelector('#playground');
var samples={pdf:'example/yang-tidak-ikut-pulang.pdf',epub:'example/yang-tidak-ikut-pulang.epub',cbz:'example/yang-tidak-ikut-pulang.cbz',djvu:'example/green-valley.djvu',txt:'example/sela.txt',md:'example/sela.md',html:'example/sela.html',fb2:'example/sela.fb2'};
function options(){return {ui:document.querySelector('#demo-ui').value,presentation:document.querySelector('#demo-presentation').value,mode:document.querySelector('#demo-mode').value,filter:document.querySelector('#demo-filter').value,pageGap:+document.querySelector('#demo-gap').value,duration:+document.querySelector('#demo-duration').value,paperTexture:document.querySelector('#demo-paper').checked,wheelZoom:document.querySelector('#demo-wheel').checked,soundEnabled:document.querySelector('#demo-sound').checked};}
function showCode(){document.querySelector('#config-code').textContent='new Sela('+JSON.stringify(options(),null,2)+');';}
function selectFile(file){
 if(file&&(!/\.(pdf|epub|cbz|djvu|djv|txt|md|html|fb2)$/i.test(file.name)||file.size>64*1024*1024)){status.textContent=language.value==='id'?'Pilih format yang didukung, maksimal 64 MiB.':'Choose a supported document up to 64 MiB.';return;}
 if(viewer)viewer.close();if(selectedUrl)URL.revokeObjectURL(selectedUrl);selectedFile=file;selectedUrl=file?URL.createObjectURL(file):null;
 document.querySelector('.file-selection').hidden=!file;document.querySelector('#file-name').textContent=file?file.name+' · '+(file.size/1024/1024).toFixed(2)+' MiB':'';
 status.textContent='';showCode();
}
input.addEventListener('change',function(){selectFile(input.files[0]);});
document.querySelector('#clear-file').addEventListener('click',function(){input.value='';selectFile(null);});
if(!window.URL||!URL.createObjectURL)input.disabled=true;
['dragenter','dragover'].forEach(function(name){drop.addEventListener(name,function(e){e.preventDefault();drop.classList.add('is-dragging');});});
['dragleave','drop'].forEach(function(name){drop.addEventListener(name,function(e){e.preventDefault();drop.classList.remove('is-dragging');if(name==='drop'&&window.URL&&URL.createObjectURL)selectFile(e.dataTransfer.files[0]);});});
function attachSettings(current){
 if(current.options.ui==='app')return;
 var details=document.createElement('details');details.className='flippy-demo-settings';
 var summary=document.createElement('summary');summary.setAttribute('aria-label',language.value==='id'?'Pengaturan demo':'Demo settings');summary.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></svg>';
 details.appendChild(summary);var panel=document.createElement('div');panel.className='flippy-demo-panel';
 var controls=document.querySelector('.play-controls').cloneNode(true),toggles=document.querySelector('.play-toggles').cloneNode(true);
 [controls,toggles].forEach(function(group){group.querySelectorAll('input,select').forEach(function(control){var original=document.getElementById(control.id);control.removeAttribute('id');control.value=original.value;control.checked=original.checked;
 control.addEventListener('change',function(){original.value=control.value;original.checked=control.checked;original.dispatchEvent(new Event('change',{bubbles:true}));});});panel.appendChild(group);});
 details.appendChild(panel);current.overlay.querySelector('.library-reader-actions').prepend(details);
}
function applySettings(event){
 showCode();if(!viewer||!viewer.overlay)return;var id=event.target.id;
 if(id==='demo-mode'){var demoPanel=viewer.overlay.querySelector('.flippy-demo-settings');if(demoPanel)demoPanel.open=false;viewer.setMode(document.querySelector('#demo-mode').value).catch(function(error){document.querySelector('#status').textContent=error.message;document.querySelector('#demo-mode').value=viewer.options.mode;showCode();});return;}
 if(id==='sample'||id==='demo-mode'||id==='demo-presentation'){var page=viewer.currentPage();if(id==='sample'){input.value='';selectFile(null);page=1;}open(document.querySelector('.launch-reader'),id==='sample',page);return;}
 var config=options();viewer.setFilter(config.filter);viewer.setZoom(+document.querySelector('#demo-zoom').value);
 viewer.overlay.dataset.paper=String(config.paperTexture);viewer.book.opts.wheelZoom=config.wheelZoom;viewer.book.opts.duration=matchMedia('(prefers-reduced-motion:reduce)').matches?0:config.duration;
 viewer.book.container.style.setProperty('--flippy-page-gap',config.pageGap+'px');
 if(id==='demo-sound'){var buttons=viewer.overlay.querySelectorAll('button');for(var i=0;i<buttons.length;i++){if(/suara|sound/i.test(buttons[i].getAttribute('aria-label')||'')){buttons[i].click();break;}}}
}
settings.addEventListener('change',applySettings);settings.addEventListener('input',function(event){if(event.target.id==='demo-zoom')applySettings(event);});
function open(trigger,forceSample,startPage){
 var seq=++generation;if(viewer)viewer.close();var sample=document.querySelector('#sample').value;
 var url=!forceSample&&selectedUrl?selectedUrl:samples[sample];
 var format=!forceSample&&selectedFile?selectedFile.name.split('.').pop().toLowerCase().replace(/^djv$/,'djvu'):sample;
 if(window.Sela&&Sela.supported===false){window.location.assign(url);return;}
 var run=function(){if(seq!==generation)return;
 var config=options();config.pdfUrl=url;config.format=format;config.language=language.value;config.theme=theme.value;config.trigger=trigger;config.startPage=startPage||1;
 config.title=!forceSample&&selectedFile?selectedFile.name:(format==='pdf'||format==='epub'?'Yang Tidak Ikut Pulang':format==='cbz'?'Yang Tidak Ikut Pulang · illustration gallery':'Green valley');
 if(format==='djvu'){config.djvujsSrc='https://djvu.js.org/assets/dist/djvu.js';config.djvuIntegrity='sha384-2L4uchU1kPKhHq+pfHZRZC4Aa0iSaT8GV8fX1oUuvmIJJaBguw2+zwG1sheMRee4';}
 var embed=document.querySelector('#embedded-reader');embed.hidden=config.presentation!=='inline';if(config.presentation==='inline')config.container=embed;if(!selectedFile&&['pdf','epub'].includes(format))config.metadata={title:'Yang Tidak Ikut Pulang',author:'Bobby Fajar Christian',year:'2026',language:'id',description:'A return to an old house, a recording that should not exist, and the people left between memory and distance.'};viewer=new Sela(config);var current=viewer;status.textContent=language.value==='id'?'Memuat reader…':'Loading reader…';
 current.open().then(function(){if(seq!==generation)return;current.setZoom(+document.querySelector('#demo-zoom').value);attachSettings(current);status.textContent=current.totalPages+' '+(format==='epub'?'chapters':language.value==='id'?'halaman':'pages')+' · '+config.mode;}).catch(function(error){if(error.name!=='AbortError'&&seq===generation)status.textContent=error.message;});
 };
 if(window.SelaReady)SelaReady.then(run).catch(function(error){status.textContent=error.message;});else run();
}
var buttons=document.querySelectorAll('[data-mode]');for(var j=0;j<buttons.length;j++)(function(button){button.addEventListener('click',function(){document.querySelector('#demo-mode').value=button.dataset.mode;showCode();open(button);});})(buttons[j]);
document.querySelectorAll('[data-story-open]').forEach(function(button){button.addEventListener('click',function(event){event.preventDefault();if(button.hasAttribute('data-app-demo'))document.querySelector('#demo-ui').value='app';document.querySelector('#sample').value='pdf';document.querySelector('#demo-mode').value=SelaPlatform.mobile?'single':'book';open(event.currentTarget,true);});});
settings.addEventListener('submit',function(event){event.preventDefault();open(document.querySelector('.launch-reader'));});showCode();
window.addEventListener('pagehide',function(){if(viewer)viewer.destroy();if(selectedUrl)URL.revokeObjectURL(selectedUrl);});
})();
