import {controlIcon} from './controls.ts';
import {editPersonal} from './personal-store.ts';
import {node} from './network.ts';

export function mountReadingDesk(home,{t,navigate,filter}){
 const stats=node(home,'section','','reading-summary');
 stats.setAttribute('aria-label',t('Your shelf at a glance','Ringkasan rakmu'));
 home.append(stats);
 const metrics=[['all','Books','Buku'],['opened','Reading','Dibaca'],['completed','Finished','Selesai']].map(([key,en,id])=>{
  const button=node(stats,'button'),value=node(button,'strong','0'),label=node(button,'span',t(en,id));
  button.type='button';
  button.onclick=()=>{filter(key);navigate('library');};
  return {key,value,label,en,id};
 });

 const focus=node(home,'section','','focus-card focus-session tw:max-w-[360px]');
 const header=node(focus,'div','','focus-heading');
 const badge=node(header,'span','','focus-heading-icon');
 badge.setAttribute('aria-hidden','true');
 badge.append(controlIcon('clock'));
 const copy=node(header,'div','','focus-copy');
 const heading=node(copy,'h2',t('A little reading time','Waktu untuk membaca'),'focus-title');
 const description=node(copy,'p',t('Set aside a few quiet minutes for one chapter.','Sisihkan beberapa menit tenang untuk satu bab.'),'focus-description');

 const controls=node(focus,'div','','focus-controls focus-session-controls');
 const presets=node(controls,'div','','focus-presets');
 presets.setAttribute('role','group');
 const presetButtons=[15,25,45].map(minutes=>{
  const button=node(presets,'button',`${minutes} min`);
  button.type='button';
  button.dataset.minutes=String(minutes);
  button.setAttribute('aria-label',t(`${minutes} minutes`,`${minutes} menit`));
  button.setAttribute('aria-pressed',String(minutes===15));
  return button;
 });
 const clock=node(controls,'div','','focus-clock');
 const output=node(clock,'output','15:00');
 const remainingLabel=node(clock,'span',t('left','tersisa'));
 output.setAttribute('aria-label',t('Time remaining','Waktu tersisa'));
 output.setAttribute('aria-live','off');
 const start=node(controls,'button');
 start.type='button';
 start.className='focus-start';
 start.append(controlIcon('play'));
 start.setAttribute('aria-label',t('Start','Mulai'));
 const reset=node(controls,'button');
 reset.type='button';
 reset.className='focus-reset';
 reset.append(controlIcon('refresh'));
 reset.setAttribute('aria-label',t('Reset','Atur ulang'));

 const progress=node(focus,'div','','focus-progress');
 progress.setAttribute('role','progressbar');
 progress.setAttribute('aria-valuemin','0');
 progress.setAttribute('aria-valuemax','100');
 progress.setAttribute('aria-valuenow','0');
 const progressValue=node(progress,'span');
 const message=node(focus,'p','','focus-message');
 message.setAttribute('role','status');
 message.setAttribute('aria-live','polite');

 const bookField=node(focus,'label','','focus-book-field');
 const bookLabel=node(bookField,'span',t('Book for this session','Buku untuk sesi ini'));
 const bookPicker=node(bookField,'select');
 bookPicker.setAttribute('aria-label',t('Session book','Buku sesi'));
 const actions=node(focus,'div','','focus-actions');
 const read=node(actions,'button',t('Read','Baca'));
 read.type='button';
 read.onclick=()=>document.dispatchEvent(new CustomEvent('sela:open-book',{detail:bookPicker.value}));
 const finish=node(actions,'button',t('Finish session','Akhiri sesi'));
 finish.type='button';
 finish.hidden=true;

 let selectedMinutes=15,remaining=900,deadline=0,interval=0,bookId='',activeSeconds=0,lastTick=Date.now(),paintedIcon='play';
 function saveSession(){
  if(activeSeconds>0)editPersonal(p=>p.sessions.push({book:bookId||bookPicker.value,at:Date.now(),seconds:Math.max(1,Math.round(activeSeconds))}));
  activeSeconds=0;
  finish.hidden=true;
 }
 function currentSeconds(){return deadline?Math.max(0,Math.ceil((deadline-Date.now())/1000)):remaining;}
 function paint(){
  const now=Date.now();
  if(deadline&&!document.hidden&&document.querySelector('.library-reader-overlay'))activeSeconds+=Math.min(2,(now-lastTick)/1000);
  lastTick=now;
  const seconds=currentSeconds(),progressPercent=Math.round((1-seconds/(selectedMinutes*60))*100);
  output.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
  progress.setAttribute('aria-valuenow',String(Math.min(100,Math.max(0,progressPercent))));
  progressValue.style.width=Math.min(100,Math.max(0,progressPercent))+'%';
  focus.dataset.running=String(!!deadline);
  if(deadline&&seconds===0){
   saveSession();deadline=0;remaining=0;clearInterval(interval);focus.dataset.running='false';
   message.textContent=t('Session finished. Stretch and rest your eyes.','Sesi selesai. Regangkan tubuh dan istirahatkan mata.');
  }
  finish.hidden=activeSeconds<=0;
  start.setAttribute('aria-label',deadline?t('Pause','Jeda'):t('Start','Mulai'));
  start.title=deadline?t('Pause reading timer','Jeda timer baca'):t('Start reading timer','Mulai timer baca');
  const icon=deadline?'pause':'play';
  if(icon!==paintedIcon){start.replaceChildren(controlIcon(icon));paintedIcon=icon;}
  reset.title=t('Reset reading timer','Atur ulang timer baca');
  for(const button of presetButtons){button.disabled=!!deadline;button.setAttribute('aria-pressed',String(Number(button.dataset.minutes)===selectedMinutes));}
 }
 for(const button of presetButtons)button.onclick=()=>{
  if(deadline)return;
  selectedMinutes=Number(button.dataset.minutes);remaining=selectedMinutes*60;message.textContent='';paint();
 };
 start.onclick=()=>{
  if(deadline){remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));deadline=0;clearInterval(interval);}
  else{if(!remaining)remaining=selectedMinutes*60;deadline=Date.now()+remaining*1000;lastTick=Date.now();message.textContent='';interval=window.setInterval(paint,1000);}
  paint();
 };
 reset.onclick=()=>{deadline=0;clearInterval(interval);remaining=selectedMinutes*60;message.textContent='';paint();};
 finish.onclick=()=>{saveSession();reset.click();message.textContent=t('Session saved. Rest your eyes.','Sesi tersimpan. Istirahatkan mata.');};
 bookPicker.onchange=()=>{
  const next=bookPicker.value;
  if(bookId&&bookId!==next)saveSession();
  bookId=next;
 };
 document.addEventListener('sela:session-book',event=>{
  const next=(event as CustomEvent).detail.id;
  if(bookId&&bookId!==next)saveSession();
  bookId=next;bookPicker.value=bookId;
 });
 document.addEventListener('visibilitychange',paint);
 window.addEventListener('pagehide',()=>{
  clearInterval(interval);
  document.removeEventListener('visibilitychange',paint);
  saveSession();
 },{once:true});

 return {
  render(books){
   const selected=bookPicker.value;
   bookPicker.replaceChildren();
   for(const book of books){const option=node(bookPicker,'option',book.name);option.value=book.id;}
   if(books.some(book=>book.id===selected))bookPicker.value=selected;
   bookField.hidden=!books.length;read.hidden=!books.length;read.disabled=!books.length;
   if(!books.some(book=>book.id===bookId))bookId=bookPicker.value;
   const values={all:books.length,opened:books.filter(book=>book.opened&&!book.completed).length,completed:books.filter(book=>book.completed).length};
   for(const metric of metrics)metric.value.textContent=values[metric.key];
  },
  localize(){
   stats.setAttribute('aria-label',t('Your shelf at a glance','Ringkasan rakmu'));
   metrics.forEach(metric=>metric.label.textContent=t(metric.en,metric.id));
   heading.textContent=t('A little reading time','Waktu untuk membaca');
   description.textContent=t('Set aside a few quiet minutes for one chapter.','Sisihkan beberapa menit tenang untuk satu bab.');
   remainingLabel.textContent=t('left','tersisa');
   presetButtons.forEach(button=>button.setAttribute('aria-label',t(`${button.dataset.minutes} minutes`,`${button.dataset.minutes} menit`)));
   presets.setAttribute('aria-label',t('Choose a reading session','Pilih durasi membaca'));
   progress.setAttribute('aria-label',t('Reading session progress','Progres sesi membaca'));
   output.setAttribute('aria-label',t('Time remaining','Waktu tersisa'));
   start.setAttribute('aria-label',deadline?t('Pause','Jeda'):t('Start','Mulai'));
   start.title=deadline?t('Pause reading timer','Jeda timer baca'):t('Start reading timer','Mulai timer baca');
   reset.setAttribute('aria-label',t('Reset','Atur ulang'));
   reset.title=t('Reset reading timer','Atur ulang timer baca');
   bookLabel.textContent=t('Book for this session','Buku untuk sesi ini');
   read.textContent=t('Read','Baca');
   finish.textContent=t('Finish session','Akhiri sesi');
   bookPicker.setAttribute('aria-label',t('Session book','Buku sesi'));
   paint();
  }
 };
}
