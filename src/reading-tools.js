// Optional reading utilities: loaded only when the reader's tools are opened.
import { FILTER_LABELS, brightness } from './appearance.js';
let toolsCount=0;
export async function pageText(book, page) {
  if (book.getText) return (await book.getText(page)).slice(0, 1000000);
  if (!book.pdf?.getPage) return '';
  const pdfPage = await book.pdf.getPage(page);
  if (!pdfPage.getTextContent) return '';
  const content = await pdfPage.getTextContent();
  return content.items.map(item => (item.str || '') + (item.hasEOL ? '\n' : ' ')).join('').slice(0, 1000000);
}

export function speechChunks(text) {
  const chunks = [];
  for (const paragraph of text.split(/\n+/)) {
    let rest = paragraph.trim();
    while (rest) {
      let end = Math.min(240, rest.length);
      if (end < rest.length) {
        const boundary = rest.slice(0, end).search(/[.!?。！？][\s]*[^.!?。！？]*$/);
        const space = rest.lastIndexOf(' ', end);
        if (boundary > 40) end = boundary + 1;
        else if (space > 40) end = space;
      }
      chunks.push(rest.slice(0, end).trim()); rest = rest.slice(end).trim();
    }
  }
  return chunks;
}

export function mountTools(state, host) {
  const { book, options } = state;
  const id = options.language !== 'en';
  const label = (en, indo) => id ? indo : en;
  let expectedSpeechPage = 0;
  let destroyed = false, searchRun = 0, textRun = 0, speechRun = 0, speaking = false, paused = false;
  const synth = window.speechSynthesis;
  const capable = !!(synth && window.SpeechSynthesisUtterance);
  const textCapable = !!(book.getText || (options.format === 'pdf' && book.pdf));
  let pane=host;
  const element = (tag, text, parent = pane) => { const el = document.createElement(tag); if (text) el.textContent = text; parent.appendChild(el); return el; };
  const symbols={play:'M7 4 13 8-13 8Z',pause:'M7 4v16M17 4v16',stop:'M5 5h14v14H5Z',search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0m-1 5 6 6',close:'m6 6 12 12M18 6 6 18',smaller:'M5 12h14',larger:'M5 12h14M12 5v14',export:'M12 3v12m-5-5 5 5 5-5M5 21h14'};
  function setActionIcon(b,name,text){b.replaceChildren();b.title=text;b.setAttribute('aria-label',text);const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('library-reader-icon');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',symbols[name]);svg.appendChild(path);b.appendChild(svg);b.classList.add('sela-tool-icon');}
  const action = (text, fn, parent = pane) => { const b = element('button', text, parent); b.type = 'button'; b.addEventListener('click', fn);const name=/^(Listen|Dengarkan)$/.test(text)?'play':/^(Pause|Jeda)$/.test(text)?'pause':/^(Stop|Hentikan)$/.test(text)?'stop':/^(Cancel search|Batalkan pencarian)$/.test(text)?'close':/^(Smaller|Perkecil)/.test(text)?'smaller':/^(Larger|Perbesar)/.test(text)?'larger':/^(Export notes|Ekspor catatan)/.test(text)?'export':null;if(name)setActionIcon(b,name,text);return b; };
  const toolsId='sela-tools-'+(++toolsCount),tabs=new Map();
  const top=element('div',null,host);top.className='sela-tools-top';
  element('strong',label('Reading tools','Alat baca'),top);
  const dismiss=action(label('Close tools','Tutup alat baca'),()=>state.hideTools(),top);setActionIcon(dismiss,'close',dismiss.textContent);
  const tabbar=element('div',null,host);tabbar.className='sela-tool-tabs';tabbar.setAttribute('role','tablist');tabbar.setAttribute('aria-label',label('Reading tools sections','Bagian alat baca'));
  Object.assign(symbols,{contents:'M5 5h14M5 12h14M5 19h14',appearance:'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-8 0v6',voice:'M8 4h8v10H8ZM4 10v3a8 8 0 0 0 16 0v-3M12 21v-3',notes:'M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5',text:'M4 5h16M12 5v15M8 20h8'});
  function selectTab(key,focus=false){for(const [name,item] of tabs){const chosen=name===key;item.panel.hidden=!chosen;item.button.setAttribute('aria-selected',String(chosen));item.button.tabIndex=chosen?0:-1;if(chosen&&focus)item.button.focus();}host.scrollTop=0;}
  function section(key,title,icon){
    const panel=element('section',null,host);panel.className='sela-tool-panel';panel.id=toolsId+'-'+key;panel.setAttribute('role','tabpanel');panel.hidden=true;
    const b=action(title,()=>selectTab(key),tabbar);setActionIcon(b,icon,title);b.id=panel.id+'-tab';b.setAttribute('role','tab');b.setAttribute('aria-controls',panel.id);b.setAttribute('aria-selected','false');b.tabIndex=-1;panel.setAttribute('aria-labelledby',b.id);tabs.set(key,{panel,button:b});
    b.addEventListener('keydown',event=>{const names=[...tabs.keys()];let at=names.indexOf(key);if(event.key==='ArrowRight')at=(at+1)%names.length;else if(event.key==='ArrowLeft')at=(at+names.length-1)%names.length;else if(event.key==='Home')at=0;else if(event.key==='End')at=names.length-1;else return;event.preventDefault();selectTab(names[at],true);});pane=panel;
  }
  const notice = element('p',null,host); notice.className='sela-tools-status';notice.setAttribute('role', 'status');
  section('contents',label('Contents','Daftar isi'),'contents');
  element('h3', label('Contents', 'Daftar isi'));
  const toc = element('nav'); toc.setAttribute('aria-label', label('Document contents', 'Daftar isi dokumen'));
  let outlineCount = 0;
  async function navigate(item) {
    stop();
    try {
      if (book.goToLocation) book.goToLocation(item);
      else {
        let dest = typeof item.dest === 'string' ? await book.pdf.getDestination(item.dest) : item.dest;
        if (!Array.isArray(dest) || !dest.length) return;
        const page = typeof dest[0] === 'number' ? dest[0] + 1 : await book.pdf.getPageIndex(dest[0]) + 1;
        if (!destroyed && page >= 1 && page <= book.numPages) book.goTo(page);
      }
    } catch { if (!destroyed) notice.textContent = label('This bookmark could not be resolved.', 'Tujuan penanda ini tidak dapat dibuka.'); }
  }
  function renderOutline(items, parent, depth = 0) {
    if (depth > 20 || !Array.isArray(items)) return;
    for (const item of items) {
      if (++outlineCount > 2000) break;
      const b = action(item.title || item.label || '…', () => navigate(item), parent);
      b.className = 'sela-toc-item'; b.style.paddingInlineStart = `${8 + depth * 12}px`;
      if (!item.dest && !item.page) b.disabled = true;
      renderOutline(item.items || item.children, parent, depth + 1);
    }
  }
  Promise.resolve().then(() => book.getOutline ? book.getOutline() : book.pdf?.getOutline?.()).then(items => {
    if (destroyed) return;
    renderOutline(items, toc);
    if (!outlineCount) element('p', label('No embedded contents or bookmarks.', 'Dokumen ini tidak memiliki daftar isi atau penanda bawaan.'), toc);
  }).catch(() => { if (!destroyed) element('p', label('Contents unavailable.', 'Daftar isi tidak tersedia.'), toc); });

  section('search',label('Find in book','Cari dalam buku'),'search');
  element('h3', label('Find in book', 'Cari dalam buku'));
  const form = element('form'); const query = element('input', null, form);
  query.type = 'search'; query.maxLength = 200; query.setAttribute('aria-label', label('Search text', 'Cari teks')); query.disabled = !textCapable;
  const find = element('button', label('Find', 'Cari'), form); find.type = 'submit'; find.disabled = !textCapable;
  setActionIcon(find,'search',label('Find','Cari'));
  action(label('Cancel search', 'Batalkan pencarian'), () => { searchRun++; notice.textContent = label('Search cancelled.', 'Pencarian dibatalkan.'); }, form);
  const results = element('div'); results.className = 'sela-search-results';
  form.addEventListener('submit', async event => {
    event.preventDefault(); const needle = query.value.trim().toLocaleLowerCase(); const run = ++searchRun;
    results.replaceChildren(); if (!needle) return;
    let found = 0;
    try {
      for (let page = 1; page <= book.numPages && found < 100; page++) {
        if (destroyed || run !== searchRun) return;
        notice.textContent = label('Searching ', 'Mencari ') + page + ' / ' + book.numPages;
        const content = await pageText(book, page);
        if (destroyed || run !== searchRun) return;
        const at = content.toLocaleLowerCase().indexOf(needle);
        if (at !== -1) { found++; action(`${page} · ${content.slice(Math.max(0, at - 35), at + needle.length + 80)}`, () => { stop(); book.goTo(page); showText(); }, results); }
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      if (!destroyed && run === searchRun) notice.textContent = `${found}${found === 100 ? '+' : ''} ` + label('matching pages / chapters.', 'halaman / bab cocok.');
    } catch (error) { if (!destroyed && run === searchRun) notice.textContent = error.message; }
  });

  section('appearance',label('Appearance','Tampilan'),'appearance');
  element('h3',label('Reading appearance','Tampilan bacaan'));
  const filterLabel=element('label',label('Page filter','Filter halaman'));const filter=element('select',null,filterLabel);filter.setAttribute('aria-label',label('Page filter','Filter halaman'));
  for(const [key,names] of Object.entries(FILTER_LABELS)){const option=element('option',names[id?1:0],filter);option.value=key;}
  const brightLabel=element('label',label('Document brightness','Kecerahan dokumen'));const bright=element('input',null,brightLabel);bright.type='range';bright.min='.35';bright.max='1.25';bright.step='.05';bright.setAttribute('aria-label',label('Document brightness','Kecerahan dokumen'));const brightValue=element('output',null,brightLabel);
  const dimLabel=element('label');const dim=element('input',null,dimLabel);dim.type='checkbox';dimLabel.appendChild(document.createTextNode(label(' Dim reader controls',' Redupkan kontrol reader')));
  filter.onchange=()=>state.setAppearance({filter:filter.value});bright.oninput=()=>state.setAppearance({brightness:brightness(bright.value)});dim.onchange=()=>state.setAppearance({dim:dim.checked});
  action(label('Reset appearance','Reset tampilan'),()=>state.setAppearance({filter:'none',brightness:1,dim:false}));
  element('p',label('Filters change the displayed page only. Brightness is a visual adjustment, not a device setting or medical color correction.','Filter hanya mengubah tampilan halaman. Kecerahan ini bukan pengaturan perangkat atau koreksi warna medis.'));
  function syncAppearance(){filter.value=options.filter||'none';bright.value=String(options.brightness??1);brightValue.textContent=Math.round(Number(bright.value)*100)+'%';dim.checked=!!options.dim;}
  state.overlay.addEventListener('sela:appearance',syncAppearance);syncAppearance();
  section('voice',label('Read aloud','Dengarkan bacaan'),'voice');
  element('h3', label('Read aloud', 'Dengarkan bacaan'));
  const voiceNotice=element('p');voiceNotice.className='sela-voice-notice';
  const voices = element('select'); voices.setAttribute('aria-label', label('Narration voice', 'Suara narasi'));
  const rate = element('input'); rate.type = 'range'; rate.min = '.5'; rate.max = '2'; rate.step = '.1'; rate.value = '1'; rate.setAttribute('aria-label', label('Narration speed', 'Kecepatan narasi'));
  const local = element('label'); const localOnly = element('input', null, local); localOnly.type = 'checkbox'; localOnly.checked = true;
  local.appendChild(document.createTextNode(label(' Local voices only', ' Hanya suara lokal')));
  let available = [];
  function updateVoices() {
    const selected = voices.value;
    available = capable ? synth.getVoices().filter(v => !localOnly.checked || v.localService) : [];
    voices.replaceChildren();
    available.forEach((voice, index) => { const opt = element('option', `${voice.name} · ${voice.lang} · ${voice.localService ? label('local', 'lokal') : label('online', 'daring')}`, voices); opt.value = String(index); });
    const lang = book.language || (id ? 'id' : 'en');
    const preferred = available.findIndex(v => v.lang.toLowerCase().startsWith(lang.split('-')[0].toLowerCase()));
    voices.value = selected !== '' && available[+selected] ? selected : String(Math.max(0, preferred));
    play.disabled = !capable || !textCapable || !available.length;
    voices.disabled = !available.length; rate.disabled = !capable;
    voiceNotice.textContent=capable&&preferred<0?label('No matching voice for this book language is installed. Choose an available voice, install a voice in your OS, or explicitly enable online voices.','Belum ada suara yang sesuai bahasa buku ini. Pilih suara yang tersedia, pasang suara di OS, atau aktifkan suara daring secara sadar.'):'';
  }
  const fontControls = element('div'); fontControls.className='sela-speech-controls';
  action(label('Smaller text / zoom', 'Perkecil teks / zoom'),()=>book.zoomOut(),fontControls);
  action(label('Larger text / zoom', 'Perbesar teks / zoom'),()=>book.zoomIn(),fontControls);
  const controls = element('div'); controls.className = 'sela-speech-controls';
  const autoLabel = element('label'); const auto = element('input', null, autoLabel); auto.type = 'checkbox'; autoLabel.appendChild(document.createTextNode(label(' Continue to next page / chapter', ' Lanjut ke halaman / bab berikutnya')));
  const voicePane=pane;
  section('notes',label('Your notes','Catatanmu'),'notes');
  element('h3',label('Your notes','Catatanmu'));
  let notes={};try{notes=JSON.parse(localStorage.getItem(state.notesKey)||'{}');if(!notes||Array.isArray(notes)||typeof notes!=='object')notes={};}catch{}
  const note=element('textarea');note.maxLength=10000;note.rows=4;note.setAttribute('aria-label',label('Note for this page / chapter','Catatan halaman / bab ini'));
  function loadNote(){note.value=typeof notes[book.currentPage()]==='string'?notes[book.currentPage()]:'';}
  function saveNotes(){try{localStorage.setItem(state.notesKey,JSON.stringify(notes));}catch{notice.textContent=label('Notes could not be saved on this browser. Export a copy.','Catatan tidak dapat disimpan di browser ini. Ekspor salinannya.');}}
  note.addEventListener('input',()=>{notes[book.currentPage()]=note.value;saveNotes();});loadNote();
  action(label('Export notes & bookmarks','Ekspor catatan & penanda'),()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,title:options.title||'',marks:state.marks,notes},null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='sela-reading-notes.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  const importLabel=element('label',label('Import notes & bookmarks','Impor catatan & penanda'));const input=element('input',null,importLabel);input.type='file';input.accept='.json,application/json';
  input.addEventListener('change',async()=>{try{
    const file=input.files[0];if(!file)return;if(file.size>1048576)throw new Error('Notes file exceeds 1 MiB');
    const data=JSON.parse(await file.text());if(destroyed)return;
    if(data.version!==1||!Array.isArray(data.marks)||!data.notes||typeof data.notes!=='object'||Array.isArray(data.notes))throw new Error('Invalid notes file');
    const imported=Object.entries(data.notes);if(imported.length>2000||imported.some(([key,value])=>!Number.isInteger(+key)||+key<1||+key>book.numPages||typeof value!=='string'||value.length>10000))throw new Error('Invalid note locations or text');
    if(data.marks.length>2000||data.marks.some(page=>!Number.isInteger(page)||page<1||page>book.numPages))throw new Error('Invalid bookmarks');
    state.marks=Array.from(new Set([...state.marks,...data.marks]));notes={...notes,...Object.fromEntries(imported)};saveNotes();
    try{localStorage.setItem(state.marksKey,JSON.stringify(state.marks));}catch{}state.updateMarks();loadNote();notice.textContent=label('Notes imported.','Catatan diimpor.');
  }catch(error){if(!destroyed)notice.textContent=error.message;}});
  section('text',label('Document text','Teks dokumen'),'text');
  element('h3',label('Document text','Teks dokumen'));
  const transcript = element('div'); transcript.className = 'sela-transcript'; transcript.tabIndex = 0; transcript.setAttribute('aria-label', label('Selectable document text', 'Teks dokumen yang dapat dipilih'));
  function stop() { speechRun++; if (speaking) synth?.cancel(); speaking = false; paused = false; setActionIcon(pause,'pause',label('Pause','Jeda')); }
  async function showText() {
    const run = ++textRun;
    try { const text = await pageText(book, book.currentPage()); if (destroyed || run !== textRun) return; transcript.textContent = text || label('No extractable text. Scanned pages need OCR; comics are images.', 'Tidak ada teks yang dapat diambil. Halaman pindai perlu OCR; komik berupa gambar.'); }
    catch (error) { if (!destroyed && run === textRun) transcript.textContent = error.message; }
  }
  async function narrate() {
    stop(); const run = speechRun;
    const voice = available[+voices.value]; if (!voice) return;
    book.setDisplayMode?.('single');
    speaking = true;
    // Start from an explicit click. Short utterances avoid browser long-speech limits.
    async function speakPage(page = book.currentPage()) {
      expectedSpeechPage = page; const text = await pageText(book, page);
      if (destroyed || run !== speechRun) return;
      if (!text.trim()) { stop(); notice.textContent = label('This page has no extractable text.', 'Halaman ini tidak memiliki teks yang dapat dibaca.'); return; }
      transcript.textContent = text;
      const chunks = speechChunks(text); let index = 0;
      function next() {
        if (destroyed || run !== speechRun) return;
        if (index >= chunks.length) {
          if (auto.checked && page < book.numPages) { advancing = true; expectedSpeechPage = page + 1; book.goTo(page + 1); advancing = false; speakPage(page + 1).catch(fail); }
          else { speaking = false; notice.textContent = label('Narration finished.', 'Bacaan selesai.'); }
          return;
        }
        const chunk = chunks[index++]; const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = +rate.value;
        utterance.onend = next; utterance.onerror = event => { if (run === speechRun && !destroyed) { stop(); notice.textContent = label('Narration unavailable: ', 'Narasi tidak tersedia: ') + event.error; } };
        notice.textContent = chunk; synth.speak(utterance);
      }
      next();
    }
    function fail(error) { if (!destroyed && run === speechRun) { stop(); notice.textContent = error.message; } }
    speakPage().catch(fail);
  }
  const play = action(label('Listen', 'Dengarkan'), narrate, controls);
  const pause = action(label('Pause', 'Jeda'), () => { if (!speaking) return; paused = !paused; if (paused) synth.pause(); else synth.resume(); setActionIcon(pause,paused?'play':'pause',paused?label('Resume','Lanjutkan'):label('Pause','Jeda')); }, controls);
  action(label('Stop', 'Hentikan'), stop, controls);
  element('p', label('Uses browser / OS voices, without a Sela API key or subscription. Online voices may send text to their provider. Voice availability and pause/background behavior vary by device.', 'Memakai suara browser / OS, tanpa kunci API atau langganan Sela. Suara daring dapat mengirim teks ke penyedianya. Pilihan suara serta jeda dan bacaan di latar bergantung pada perangkat.'),voicePane);
  if (!capable) notice.textContent = label('Speech synthesis is unavailable in this browser.', 'Browser ini tidak menyediakan narasi suara.');
  localOnly.addEventListener('change', () => { stop(); updateVoices(); });
  voices.addEventListener('change', stop); rate.addEventListener('change', stop);
  synth?.addEventListener?.('voiceschanged', updateVoices); updateVoices(); showText();
  let advancing = false;
  const onPage = () => { if (!advancing && (!speaking || book.currentPage() !== expectedSpeechPage)) stop(); loadNote();showText(); };
  book.container.addEventListener('flipbook:pagechange', onPage);
  selectTab('contents');
  return { stop, selectTab, destroy() { destroyed = true; searchRun++; textRun++; stop(); state.overlay.removeEventListener('sela:appearance',syncAppearance);synth?.removeEventListener?.('voiceschanged', updateVoices); book.container.removeEventListener('flipbook:pagechange', onPage); host.replaceChildren(); } };
}
