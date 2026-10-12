import {readPersonal} from './personal-store.ts';
import {controlIcon,iconAction} from './controls.ts';
import {loadPublicHolidays,type PublicHoliday} from './holiday-calendar.ts';
import {holidayCountry,localeBase} from '../../src/i18n.ts';

const WATER_KEY='sela-library:water-glasses';
type Translator=(en:string,id:string)=>string;

function localDateKey(date:Date){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');}
function locale(){return document.documentElement.lang||navigator.language||'en-US';}
function node<K extends keyof HTMLElementTagNameMap>(tag:K,className='',parent?:HTMLElement){const element=document.createElement(tag);if(className)element.className=className;parent?.append(element);return element;}
function monthStart(date:Date){return new Date(date.getFullYear(),date.getMonth(),1,12);}
function shiftMonth(date:Date,amount:number){return new Date(date.getFullYear(),date.getMonth()+amount,1,12);}

function makeCalendar(t:Translator){
 const card=node('section','home-widget-card home-calendar-widget');card.setAttribute('aria-labelledby','home-calendar-title');
 const header=node('div','home-widget-heading',card),copy=node('div','',header),title=node('h2','',copy);title.id='home-calendar-title';
 const subtitle=node('p','home-widget-subtitle',copy),monthControls=node('div','home-calendar-controls',header);
 const previous=iconAction(node('button','',monthControls),'chevron',t('Previous month','Bulan sebelumnya'));previous.type='button';previous.classList.add('home-month-arrow','is-previous');
 const monthLabel=node('strong','home-calendar-month',monthControls);
 const next=iconAction(node('button','',monthControls),'chevron',t('Next month','Bulan berikutnya'));next.type='button';next.classList.add('home-month-arrow');
 const weekdayRow=node('div','home-calendar-weekdays',card);weekdayRow.setAttribute('aria-hidden','true');
 const grid=node('div','home-calendar-grid',card);grid.setAttribute('role','group');grid.setAttribute('aria-label',t('Reading days','Hari membaca'));
 const legend=node('div','home-calendar-legend',card),holidayLegend=node('span','',legend),dot=node('i','',holidayLegend);dot.setAttribute('aria-hidden','true');holidayLegend.dataset.kind='national';node('span','',holidayLegend).textContent=t('Public holiday','Libur nasional');
 const source=node('a','home-calendar-source',legend);source.href='https://date.nager.at/';source.target='_blank';source.rel='noopener noreferrer';source.textContent='Nager.Date';source.setAttribute('aria-label',t('Public holiday source: Nager.Date','Sumber hari libur: Nager.Date'));
 const detail=node('p','home-calendar-detail',card);detail.setAttribute('role','status');detail.setAttribute('aria-live','polite');
 const viewToggle=node('button','home-calendar-view',card);viewToggle.type='button';
 let month=monthStart(new Date()),selected=localDateKey(new Date()),todayKey=selected,weekMode=matchMedia('(max-width: 600px)').matches,viewWasChosen=false;
 let country=holidayCountry(locale());const holidays=new Map<string,PublicHoliday>(),loadedYears=new Set<number>(),yearLoads=new Map<number,Promise<void>>();
 function holidayName(item:PublicHoliday){return localeBase(locale())==='en'?item.name:item.localName||item.name;}
 function loadYear(year:number){if(loadedYears.has(year))return Promise.resolve();if(yearLoads.has(year))return yearLoads.get(year)!;const request=loadPublicHolidays(year,country).then(result=>{if(country!==result.country)return;for(const old of [...holidays.keys()])if(old.startsWith(year+'-'))holidays.delete(old);for(const item of result.holidays)holidays.set(item.date,item);loadedYears.add(year);if(selected.startsWith(year+'-'))render();}).catch(()=>{if(selected.startsWith(year+'-')){detail.textContent=t('Holiday information is unavailable offline until it has been loaded once.','Informasi hari libur belum tersedia offline sebelum sempat dimuat.');}}).finally(()=>yearLoads.delete(year));yearLoads.set(year,request);return request;}
 function sessionsByDate(){const counts=new Map<string,{count:number;seconds:number}>();for(const session of readPersonal().sessions){if(session.seconds<=0)continue;const key=localDateKey(new Date(session.at)),value=counts.get(key)||{count:0,seconds:0};value.count++;value.seconds+=session.seconds;counts.set(key,value);}return counts;}
 function showDetail(key:string,counts:Map<string,{count:number;seconds:number}>){const date=new Date(`${key}T12:00:00`),entry=counts.get(key),holiday=holidays.get(key),parts:string[]=[];if(entry)parts.push(t('Reading saved · ','Bacaan tersimpan · ')+entry.count+' '+t(entry.count===1?'session':'sessions',entry.count===1?'sesi':'sesi')+' · '+Math.max(1,Math.round(entry.seconds/60))+' '+t('min','menit'));if(holiday)parts.push(t('Public holiday','Libur nasional')+' · '+holidayName(holiday));if(!parts.length)parts.push(t('A quiet day. No reading saved here yet.','Hari yang tenang. Belum ada sesi baca tersimpan.')+' · '+new Intl.DateTimeFormat(locale(),{day:'numeric',month:'short'}).format(date));detail.textContent=parts.join(' · ');}
 function render(){const current=monthStart(new Date()),counts=sessionsByDate();title.textContent=t('Reading calendar','Kalender membaca');const activeDays=[...counts.keys()].filter(key=>{const date=new Date(`${key}T12:00:00`);return date.getFullYear()===month.getFullYear()&&date.getMonth()===month.getMonth();}).length;subtitle.textContent=activeDays?t(activeDays===1?'A little reading on 1 day':'A little reading on '+activeDays+' days',activeDays===1?'Ada waktu membaca pada 1 hari':'Ada waktu membaca pada '+activeDays+' hari'):t('Small moments count.','Jeda kecil tetap berarti.');
  const compact=matchMedia('(max-width: 600px)').matches;monthLabel.textContent=new Intl.DateTimeFormat(locale(),{month:compact?'short':'long',year:compact?'2-digit':'numeric'}).format(month);previous.setAttribute('aria-label',t('Previous month','Bulan sebelumnya'));next.setAttribute('aria-label',t('Next month','Bulan berikutnya'));next.disabled=month.getFullYear()===current.getFullYear()&&month.getMonth()===current.getMonth();
  viewToggle.textContent=weekMode?t('Show the whole month','Lihat satu bulan'):t('Show this week','Lihat minggu ini');viewToggle.setAttribute('aria-label',viewToggle.textContent);viewToggle.setAttribute('aria-expanded',String(!weekMode));
  weekdayRow.replaceChildren();const monday=new Date(2024,0,1,12);for(let index=0;index<7;index++){const date=new Date(monday);date.setDate(monday.getDate()+index);node('span','',weekdayRow).textContent=new Intl.DateTimeFormat(locale(),{weekday:weekMode?'narrow':'short'}).format(date).replace(/\.$/,'');}
  grid.replaceChildren();const first=monthStart(month),offset=(first.getDay()+6)%7,days=new Date(month.getFullYear(),month.getMonth()+1,0,12).getDate();const dates:Date[]=[];
  if(weekMode){const anchor=new Date(`${selected}T12:00:00`);anchor.setDate(anchor.getDate()-((anchor.getDay()+6)%7));for(let index=0;index<7;index++){const date=new Date(anchor);date.setDate(anchor.getDate()+index);dates.push(date);}}else{for(let blank=0;blank<offset;blank++){const empty=node('span','home-calendar-blank',grid);empty.setAttribute('aria-hidden','true');}for(let day=1;day<=days;day++)dates.push(new Date(month.getFullYear(),month.getMonth(),day,12));}
  for(const date of dates){const key=localDateKey(date),entry=counts.get(key),holiday=holidays.get(key),button=node('button','home-calendar-day',grid);button.type='button';button.textContent=String(date.getDate());button.dataset.date=key;button.setAttribute('aria-pressed',String(key===selected));button.classList.toggle('is-today',key===localDateKey(new Date()));button.classList.toggle('has-reading',!!entry);button.classList.toggle('has-holiday',!!holiday);button.classList.toggle('outside-month',date.getMonth()!==month.getMonth());const holidayLabel=holiday?' · '+t('Public holiday','Libur nasional')+' · '+holidayName(holiday):'';button.title=holiday?holidayName(holiday):'';button.setAttribute('aria-label',new Intl.DateTimeFormat(locale(),{weekday:'long',day:'numeric',month:'long'}).format(date)+(entry?' · '+entry.count+' '+t('reading sessions','sesi membaca'):'')+holidayLabel);button.onclick=()=>{selected=key;if(date.getMonth()!==month.getMonth()||date.getFullYear()!==month.getFullYear())month=monthStart(date);render();};}
  showDetail(selected,counts);for(const year of new Set(dates.map(date=>date.getFullYear())))if(![...holidays.keys()].some(key=>key.startsWith(year+'-')))void loadYear(year);
 }
 previous.onclick=()=>{month=shiftMonth(month,-1);selected=localDateKey(month);render();};next.onclick=()=>{if(!next.disabled){month=shiftMonth(month,1);selected=localDateKey(month);render();}};
 viewToggle.onclick=()=>{weekMode=!weekMode;viewWasChosen=true;render();};window.addEventListener('resize',()=>{const compact=matchMedia('(max-width: 600px)').matches;if(!viewWasChosen&&compact!==weekMode){weekMode=compact;render();}});document.addEventListener('sela:personal',render);
 document.addEventListener('sela:language',()=>{country=holidayCountry(locale());holidays.clear();loadedYears.clear();yearLoads.clear();render();});document.addEventListener('visibilitychange',()=>{if(document.hidden)return;const nextToday=localDateKey(new Date());if(nextToday!==todayKey){const wasCurrentMonth=month.getFullYear()===new Date().getFullYear()&&month.getMonth()===new Date().getMonth();todayKey=nextToday;if(wasCurrentMonth){month=monthStart(new Date());selected=nextToday;}}render();});render();return {card,localize:render};
}

function makeWaterWidget(t:Translator){
 const card=node('section','home-widget-card home-water-widget');card.setAttribute('aria-labelledby','home-water-title');
 const heading=node('div','home-widget-heading',card),icon=node('span','home-water-icon',heading);icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 24 24"><path d="M7 3h10l-1 18H8L7 3Z"/><path d="M8 12c2 1 5 1 8 0"/></svg>';
 const copy=node('div','',heading),title=node('h2','',copy);title.id='home-water-title';const subtitle=node('p','home-widget-subtitle',copy);
 const row=node('div','home-water-row',card),stat=node('div','home-water-stat',row),value=node('strong','home-water-value',stat),label=node('span','home-water-label',stat);stat.setAttribute('aria-live','polite');stat.setAttribute('aria-atomic','true');
 const controls=node('div','home-water-actions',row),add=node('button','home-water-add',controls);add.type='button';add.append(controlIcon('plus'));const addText=node('span','',add);
 const undo=iconAction(node('button','',controls),'undo',t('Undo one glass','Urungkan satu gelas'));undo.type='button';undo.classList.add('home-water-undo');
 const note=node('p','home-water-note',card);note.setAttribute('aria-live','polite');let day=localDateKey(new Date()),glasses=0;
 function storedCount(){try{const saved=JSON.parse(localStorage.getItem(WATER_KEY)||'null');return saved?.day===localDateKey(new Date())&&Number.isInteger(saved.glasses)?Math.min(99,Math.max(0,saved.glasses)):0;}catch{return 0;}}
 function resetDay(){const current=localDateKey(new Date());if(day!==current){day=current;glasses=0;}}
 function save(){resetDay();try{localStorage.setItem(WATER_KEY,JSON.stringify({day,glasses}));}catch{/* Works for the current page when storage is blocked. */}paint();}
 function paint(){resetDay();title.textContent=t('A little water break','Jeda minum air');subtitle.textContent=t('A gentle note to pause and sip.','Pengingat lembut untuk berhenti sejenak dan minum.');value.textContent=String(glasses);label.textContent=t(glasses===1?'glass today':'glasses today','gelas hari ini');addText.textContent=t('Add a glass','Tambah segelas');undo.setAttribute('aria-label',t('Undo one glass','Urungkan satu gelas'));undo.title=t('Undo one glass','Urungkan satu gelas');undo.disabled=glasses===0;note.textContent=t('No goal to chase. Just a small pause when you need one.','Tak perlu mengejar target. Cukup jeda kecil saat kamu perlu.');}
 add.onclick=()=>{resetDay();glasses=Math.min(99,glasses+1);save();};undo.onclick=()=>{resetDay();glasses=Math.max(0,glasses-1);save();};document.addEventListener('visibilitychange',()=>{if(!document.hidden&&day!==localDateKey(new Date())){glasses=0;paint();}});glasses=storedCount();paint();return {card,localize:paint};
}

export function mountHomeWidgets({t}:{t:Translator}){
 const section=node('section','home-widgets');section.setAttribute('aria-label',t('Small reading rituals','Ritual kecil membaca'));const calendar=makeCalendar(t),water=makeWaterWidget(t);section.append(calendar.card,water.card);
 return {section,localize(){calendar.localize();water.localize();section.setAttribute('aria-label',t('Small reading rituals','Ritual kecil membaca'));}};
}
