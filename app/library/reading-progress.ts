import {readPersonal} from './personal-store.ts';
import type {AppTab} from '../mobile/navigation.ts';

const dayMs=86400000;
const startOfDay=(date:Date)=>new Date(date.getFullYear(),date.getMonth(),date.getDate());
const keyOf=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const minutes=(seconds:number)=>Math.round(seconds/60);

export function mountReadingProgress(page:HTMLElement,{t,navigate,home}:{t:(en:string,id:string)=>string;navigate:(tab:AppTab)=>void;home?:HTMLElement}){
  const el=(tag:string,classes:string,parent:HTMLElement)=>{const node=document.createElement(tag);node.className=classes;if(parent)parent.append(node);return node;};
  page.classList.add('reading-progress-page','tw:mx-auto','tw:w-full','tw:max-w-6xl','tw:space-y-5','tw:px-4','tw:py-5','tw:sm:px-6','tw:sm:py-7');
  const heading=el('header','tw:flex tw:flex-wrap tw:items-end tw:justify-between tw:gap-3',page);
  const copy=el('div','tw:min-w-0',heading),title=el('h2','tw:m-0 tw:text-2xl tw:font-bold tw:tracking-tight tw:text-sela-ink',copy),intro=el('p','tw:mb-0 tw:mt-1 tw:max-w-2xl tw:text-sm tw:leading-6 tw:text-sela-muted',copy);
  const add=el('button','experience-button tw:shrink-0',heading) as HTMLButtonElement;add.type='button';add.onclick=()=>navigate('library');
  const metrics=el('div','tw:grid tw:grid-cols-2 tw:gap-3 tw:md:grid-cols-4',page);
  const metricSpecs=[['total','Total time','Total waktu'],['current','Current streak','Streak saat ini'],['best','Longest streak','Streak terpanjang'],['bestDay','Best day','Hari teraktif']] as const;
  const metricValues=new Map<string,HTMLElement>();
  for(const [key,en,id]of metricSpecs){const card=el('article','tw:min-w-0 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-surface tw:p-4 tw:shadow-sm',metrics);const label=el('p','tw:m-0 tw:text-xs tw:font-medium tw:text-sela-muted',card);label.textContent=t(en,id);const value=el('strong','tw:mt-2 tw:block tw:truncate tw:text-2xl tw:font-bold tw:tabular-nums tw:text-sela-ink',card);metricValues.set(key,value);}
  const chartCard=el('section','tw:min-w-0 tw:rounded-3xl tw:border tw:border-sela-line tw:bg-sela-surface tw:p-4 tw:shadow-sm tw:sm:p-5',page);
  const chartHeader=el('div','tw:mb-4 tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-3',chartCard),chartTitle=el('h3','tw:m-0 tw:text-base tw:font-semibold tw:text-sela-ink',chartHeader),ranges=el('div','tw:inline-flex tw:rounded-xl tw:bg-sela-canvas tw:p-1',chartHeader);
  chartTitle.textContent=t('Reading time','Waktu membaca');
  let range:7|30|365=7;
  const rangeButtons=[7,30,365].map(days=>{const button=el('button','tw:min-h-9 tw:rounded-lg tw:px-3 tw:text-xs tw:font-semibold tw:text-sela-muted tw:transition aria-pressed:tw:bg-sela-surface aria-pressed:tw:text-sela-ink aria-pressed:tw:shadow-sm',ranges) as HTMLButtonElement;button.type='button';button.dataset.days=String(days);button.textContent=t(days===7?'7 days':days===30?'30 days':'12 months',days===7?'7 hari':days===30?'30 hari':'12 bulan');button.onclick=()=>{range=days as 7|30|365;render();};return button;});
  const chart=el('div','tw:min-h-48 tw:w-full tw:overflow-x-auto',chartCard);chart.setAttribute('role','img');
  const chartNote=el('p','tw:mb-0 tw:mt-3 tw:text-xs tw:leading-5 tw:text-sela-muted',chartCard);
  const empty=el('div','tw:mt-4 tw:grid tw:min-h-36 tw:place-items-center tw:rounded-2xl tw:bg-sela-canvas/75 tw:px-5 tw:py-7 tw:text-center',page);
  const emptyCopy=el('div','tw:max-w-sm',empty),emptyIcon=el('span','tw:mx-auto tw:mb-3 tw:grid tw:size-12 tw:place-items-center tw:rounded-2xl tw:bg-sela-accent/10 tw:text-xl tw:text-sela-accent',emptyCopy);emptyIcon.textContent='↗';emptyIcon.setAttribute('aria-hidden','true');
  const emptyTitle=el('strong','tw:block tw:text-sm tw:text-sela-ink',emptyCopy),emptyText=el('p','tw:mb-0 tw:mt-1 tw:text-xs tw:leading-5 tw:text-sela-muted',emptyCopy);
  const homeWidget=el('section','tw:min-w-0 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-surface/90 tw:p-4 tw:shadow-sm',home||page.parentElement||page);homeWidget.classList.add('home-reading-progress');
  const homeTop=el('div','tw:flex tw:items-center tw:justify-between tw:gap-3',homeWidget),homeTitle=el('h2','tw:m-0 tw:text-sm tw:font-semibold tw:text-sela-ink',homeTop),homeValue=el('strong','tw:shrink-0 tw:text-sm tw:tabular-nums tw:text-sela-accent',homeTop),homeChart=el('div','tw:mt-3 tw:flex tw:h-16 tw:items-end tw:gap-1.5',homeWidget);
  const homeOpen=el('button','tw:mt-3 tw:min-h-9 tw:text-xs tw:font-semibold tw:text-sela-accent hover:tw:underline',homeWidget) as HTMLButtonElement;homeOpen.type='button';homeOpen.onclick=()=>navigate('progress');
  function snapshot(){
    const sessions=readPersonal().sessions,now=startOfDay(new Date()),totals=new Map<string,number>();let all=0;
    for(const session of sessions){if(!session.seconds)continue;const date=new Date(session.at),key=keyOf(date);totals.set(key,(totals.get(key)||0)+session.seconds);all+=session.seconds;}
    const keys=[...totals.keys()].sort(),set=new Set(keys);let current=0,best=0,run=0,prior='';
    for(const key of keys){const date=new Date(`${key}T00:00:00`),serial=date.getTime();run=prior&&serial-new Date(`${prior}T00:00:00`).getTime()===dayMs?run+1:1;best=Math.max(best,run);prior=key;}
    const today=keyOf(now),yesterday=keyOf(new Date(now.getTime()-dayMs));let cursor=set.has(today)?now:set.has(yesterday)?new Date(now.getTime()-dayMs):null;
    while(cursor&&set.has(keyOf(cursor))){current++;cursor=new Date(cursor.getTime()-dayMs);}
    let bestDaySeconds=0;for(const value of totals.values())bestDaySeconds=Math.max(bestDaySeconds,value);
    return {totals,all,current,best,bestDaySeconds,now};
  }
  function points(data:ReturnType<typeof snapshot>){
    if(range===7)return Array.from({length:7},(_,index)=>{const date=new Date(data.now.getTime()-(6-index)*dayMs),key=keyOf(date);return {label:new Intl.DateTimeFormat(document.documentElement.lang,{weekday:'short'}).format(date),value:minutes(data.totals.get(key)||0)};});
    if(range===30)return Array.from({length:5},(_,index)=>{const end=29-index*7,seconds=Array.from({length:Math.min(7,end+1)},(_,offset)=>{const day=new Date(data.now.getTime()-(end-offset)*dayMs);return data.totals.get(keyOf(day))||0;}).reduce((a,b)=>a+b,0);return {label:`${Math.max(1,30-(index+1)*7+1)}–${30-index*7}`,value:minutes(seconds)};});
    return Array.from({length:12},(_,index)=>{const month=new Date(data.now.getFullYear(),data.now.getMonth()-(11-index),1),prefix=`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-`;let seconds=0;for(const [key,value]of data.totals)if(key.startsWith(prefix))seconds+=value;return {label:new Intl.DateTimeFormat(document.documentElement.lang,{month:'short'}).format(month),value:minutes(seconds)};});
  }
  function draw(target:HTMLElement,rows:{label:string;value:number}[],compact=false){
    target.replaceChildren();const max=Math.max(1,...rows.map(row=>row.value));
    for(const row of rows){const column=el('div',compact?'tw:flex tw:h-full tw:min-w-0 tw:flex-1 tw:flex-col tw:items-center tw:justify-end tw:gap-1':'tw:flex tw:h-48 tw:min-w-0 tw:flex-1 tw:flex-col tw:items-center tw:justify-end tw:gap-2',target);const value=el('span','tw:text-[10px] tw:tabular-nums tw:text-sela-muted',column);value.textContent=row.value?String(row.value):'';const track=el('div','tw:flex tw:h-32 tw:w-full tw:items-end tw:justify-center',column);const bar=el('span','tw:block tw:w-full tw:max-w-10 tw:rounded-t-lg tw:bg-sela-accent/75 tw:transition-[height] tw:duration-300',track);bar.style.height=`${row.value?Math.max(8,row.value/max*100):3}%`;bar.setAttribute('aria-hidden','true');const label=el('span','tw:max-w-full tw:truncate tw:text-[10px] tw:text-sela-muted',column);label.textContent=row.label;}
  }
  function render(){const data=snapshot(),rows=points(data),weekRows=Array.from({length:7},(_,index)=>{const date=new Date(data.now.getTime()-(6-index)*dayMs);return {label:new Intl.DateTimeFormat(document.documentElement.lang,{weekday:'short'}).format(date),value:minutes(data.totals.get(keyOf(date))||0)};});
    metricValues.get('total')!.textContent=t(`${minutes(data.all)} min`,` ${minutes(data.all)} mnt`.trim());metricValues.get('current')!.textContent=t(`${data.current} days`,` ${data.current} hari`.trim());metricValues.get('best')!.textContent=t(`${data.best} days`,` ${data.best} hari`.trim());metricValues.get('bestDay')!.textContent=t(`${minutes(data.bestDaySeconds)} min`,` ${minutes(data.bestDaySeconds)} mnt`.trim());
    for(const button of rangeButtons)button.setAttribute('aria-pressed',String(Number(button.dataset.days)===range));draw(chart,rows);const has=rows.some(row=>row.value>0);chart.setAttribute('aria-label',t('Reading time chart','Grafik waktu membaca'));chartNote.textContent=range===7?t('Minutes read each day this week.','Menit membaca setiap hari minggu ini.'):range===30?t('Weekly totals for the past 30 days.','Total per minggu selama 30 hari terakhir.'):t('Monthly totals for the past year.','Total per bulan selama setahun terakhir.');empty.hidden=has;chartCard.hidden=!has;emptyTitle.textContent=t('Your reading chart starts here','Grafik bacamu dimulai di sini');emptyText.textContent=t('Open any book and Sela will count the time you spend reading in this tab.','Buka buku apa saja; Sela akan menghitung waktu baca saat tab ini aktif.');
    homeTitle.textContent=t('Reading this week','Waktu baca minggu ini');homeValue.textContent=`${weekRows.reduce((sum,row)=>sum+row.value,0)} ${t('min','mnt')}`;draw(homeChart,weekRows,true);homeOpen.textContent=t('See reading progress','Lihat progres membaca');homeWidget.hidden=weekRows.every(row=>row.value===0);
  }
  function localize(){title.textContent=t('Your reading progress','Progres bacamu');intro.textContent=t('A quiet picture of the time you spend with your books. Reading is counted only while the reader tab is visible.','Ringkasan waktu bersama bukumu. Waktu hanya dihitung ketika tab pembaca terlihat.');add.textContent=t('Find a book','Cari buku');chartTitle.textContent=t('Reading time','Waktu membaca');render();}
  document.addEventListener('sela:personal',render);localize();return {render,localize,homeWidget};
}
