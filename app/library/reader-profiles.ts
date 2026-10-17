import {readingPreferences} from '../../src/preferences.ts';

const builtins = [
  ['novel', 'Novel', 'Novel', 'A calm, comfortable page', 'Halaman tenang dan nyaman', {mode:'single',fit:'page',filter:'none',brightness:1,dim:false,fontFamily:'serif',fontSize:20,lineHeight:1.8,textMargin:24,textAlign:'start',paperTexture:true,lowPower:false,cropMargin:0}],
  ['manga', 'Manga', 'Manga', 'Right-to-left page turns', 'Balik halaman kanan ke kiri', {mode:'manga',fit:'page',filter:'none',brightness:1,dim:false,paperTexture:false,lowPower:false,cropMargin:0}],
  ['academic', 'Study', 'Kajian', 'Wide, focused reading', 'Bacaan lebar dan fokus', {mode:'single',fit:'width',filter:'none',brightness:1,dim:false,fontFamily:'sans',fontSize:18,lineHeight:1.6,textMargin:20,textAlign:'start',paperTexture:false,lowPower:false,cropMargin:0}],
  ['night', 'Night', 'Malam', 'Dimmer, warmer pages', 'Halaman lebih redup dan hangat', {mode:'single',fit:'page',filter:'lowblue',brightness:.65,dim:true,fontFamily:'serif',fontSize:21,lineHeight:1.9,textMargin:24,paperTexture:false,lowPower:true,cropMargin:0}]
] as const;

export function validateProfiles(value:any){
 if(!Array.isArray(value)||value.length>20)throw Error('Profiles must contain at most 20 entries.');
 const names=new Set<string>();return value.map(record=>{
  if(!record||typeof record.name!=='string'||!record.name.trim()||record.name.trim().length>48)throw Error('Profile names must contain 1–48 characters.');
  const name=record.name.trim();if(names.has(name))throw Error('A profile with this name already exists.');names.add(name);
  if(!record.values||typeof record.values!=='object'||Array.isArray(record.values))throw Error('Invalid reading profile.');
  const values=readingPreferences(record.values);if(!Object.keys(values).length)throw Error('Profile has no supported reading settings.');return {name,values};
 });
}
export function readProfiles(prefix='sela-library:'){
 let value;try{value=JSON.parse(localStorage.getItem(prefix+'profiles')||'[]');}catch{throw Error('Saved reading profiles could not be read. Keep a backup before resetting them.');}return validateProfiles(value);
}
export function writeProfiles(records:any[],prefix='sela-library:'){
 const valid=validateProfiles(records);localStorage.setItem(prefix+'profiles',JSON.stringify(valid));document.dispatchEvent(new Event('sela:profiles'));return valid;
}
export function mergeProfiles(current:any[],incoming:any[]){const records=validateProfiles(current);for(const record of validateProfiles(incoming))if(!records.some(item=>item.name===record.name))records.push(record);return validateProfiles(records);}

type Translator=(english:string,indonesian:string)=>string;
export function mountReaderProfiles(parent:HTMLElement,state:any,{t,onApplied=()=>{}}:{t:Translator;onApplied?:()=>void}){
 const prefix=state.options.storagePrefix||'sela:';
 const section=document.createElement('section');section.className='tw:space-y-3';section.setAttribute('aria-labelledby','reader-profile-heading');parent.append(section);
 const heading=document.createElement('h3');heading.id='reader-profile-heading';heading.className='tw:m-0 tw:text-sm tw:font-semibold tw:text-sela-ink';heading.textContent=t('Reading profile','Profil baca');section.append(heading);
 const help=document.createElement('p');help.className='tw:m-0 tw:text-xs tw:leading-5 tw:text-sela-muted';help.textContent=t('Pick a starting point. Your original book and file stay unchanged.','Pilih pengaturan awal. Buku dan berkas aslimu tetap utuh.');section.append(help);
 const grid=document.createElement('div');grid.className='tw:grid tw:grid-cols-2 tw:gap-2 tw:sm:grid-cols-4';grid.setAttribute('role','group');grid.setAttribute('aria-label',heading.textContent);section.append(grid);
 const name=document.createElement('input');name.type='text';name.maxLength=48;name.className='tw:min-h-10 tw:min-w-0 tw:rounded-xl tw:border tw:border-sela-line tw:bg-sela-surface tw:px-3 tw:text-xs tw:text-sela-ink placeholder:tw:text-sela-muted focus-visible:tw:outline-2 focus-visible:tw:outline-sela-accent';name.setAttribute('aria-label',t('Custom profile name','Nama profil khusus'));name.placeholder=t('Name a custom profile','Beri nama profil khusus');section.append(name);
 const actions=document.createElement('div');actions.className='tw:flex tw:flex-wrap tw:gap-2';section.append(actions);
 const notice=document.createElement('p');notice.className='tw:m-0 tw:min-h-5 tw:break-words tw:text-xs tw:text-sela-muted';notice.setAttribute('role','status');section.append(notice);
 let records:any[]=[],selected='',armed=false,disposed=false;
 const action=(en:string,id:string,fn:()=>void)=>{const button=document.createElement('button');button.type='button';button.className='tw:min-h-9 tw:rounded-full tw:border tw:border-sela-line tw:bg-sela-surface tw:px-3 tw:text-xs tw:font-semibold tw:text-sela-ink tw:transition hover:tw:border-sela-accent/60 focus-visible:tw:outline-2 focus-visible:tw:outline-sela-accent disabled:tw:opacity-50';button.textContent=t(en,id);button.onclick=()=>{try{fn();}catch(error){notice.textContent=error instanceof Error?error.message:String(error);}};actions.append(button);return button;};
 const save=action('Save current','Simpan saat ini',()=>{const next=writeProfiles([...records,{name:name.value,values:readingPreferences(state.options)}],prefix);selected='custom:'+(next.length-1);refresh();notice.textContent=t('Profile saved.','Profil tersimpan.');});
 const update=action('Update selected','Perbarui pilihan',()=>{const index=Number(selected.slice(7));if(!Number.isInteger(index)||!records[index])return;writeProfiles(records.map((record,i)=>i===index?{name:name.value||record.name,values:readingPreferences(state.options)}:record),prefix);refresh();notice.textContent=t('Profile updated.','Profil diperbarui.');});
 const remove=action('Delete','Hapus',()=>{const index=Number(selected.slice(7));if(!Number.isInteger(index)||!records[index])return;if(!armed){armed=true;remove.textContent=t('Confirm delete','Konfirmasi hapus');return;}writeProfiles(records.filter((_,i)=>i!==index),prefix);selected='';name.value='';refresh();notice.textContent=t('Profile deleted. Book settings are kept.','Profil dihapus. Pengaturan buku tetap tersimpan.');});
 function refresh(){
  grid.replaceChildren();const options:any[]=[...builtins.map(([key,en,id,description,descriptionId,values])=>({key,en,id,description,descriptionId,values})),...records.map((record,index)=>({key:'custom:'+index,en:record.name,id:record.name,description:t('Saved by you','Tersimpan'),descriptionId:t('Saved by you','Tersimpan'),values:record.values}))];
  for(const option of options){const button=document.createElement('button');button.type='button';button.dataset.profileChoice=option.key;button.setAttribute('aria-pressed',String(selected===option.key));button.className='tw:flex tw:min-h-[76px] tw:min-w-0 tw:flex-col tw:items-start tw:justify-center tw:gap-1 tw:rounded-2xl tw:border tw:border-sela-line tw:bg-sela-surface/80 tw:px-3 tw:py-2 tw:text-left tw:transition hover:tw:border-sela-accent/60 focus-visible:tw:outline-2 focus-visible:tw:outline-sela-accent aria-pressed:tw:border-sela-accent aria-pressed:tw:bg-sela-accent/10';
   const icon=document.createElement('span');icon.className='tw:grid tw:size-6 tw:place-items-center tw:rounded-lg tw:bg-sela-accent/10 tw:text-sela-accent';icon.setAttribute('aria-hidden','true');icon.textContent=option.key==='manga'?'▤':option.key==='academic'?'≡':option.key==='night'?'☾':option.key.startsWith('custom:')?'✦':'▯';button.append(icon);
   const title=document.createElement('span');title.className='tw:max-w-full tw:truncate tw:text-xs tw:font-semibold tw:text-sela-ink';title.textContent=t(option.en,option.id);
   const description=document.createElement('span');description.className='tw:text-[10px] tw:leading-4 tw:text-sela-muted';description.textContent=t(option.description,option.descriptionId);button.append(title,description);button.onclick=()=>void apply(option.key,option.values);grid.append(button);
  }
  const isCustom=selected.startsWith('custom:')&&!!records[Number(selected.slice(7))];update.disabled=remove.disabled=!isCustom;armed=false;remove.textContent=t('Delete','Hapus');
 }
 async function apply(key:string,values:any){
  const custom=key.startsWith('custom:')?records[Number(key.slice(7))]:undefined;
  selected=key;armed=false;if(custom)name.value=custom.name;else name.value='';refresh();notice.textContent='';
  const {mode,fit,...preferences}=values;const chosen=mode&&(state.book.getText&&!['single','scroll'].includes(mode)?'single':mode);
  try{if(chosen)await state.setMode(chosen);if(disposed)return;state.setPreferences(preferences);if(fit)state.setFit(fit);onApplied();notice.textContent=t('Profile applied to this book.','Profil diterapkan pada buku ini.');}catch(error){if(!disposed)notice.textContent=error instanceof Error?error.message:String(error);}
 }
 function refreshRecords(){try{records=readProfiles(prefix);}catch(error){notice.textContent=error instanceof Error?error.message:String(error);records=[];}if(selected.startsWith('custom:')&&!records[Number(selected.slice(7))])selected='';refresh();}
 const changed=()=>{if(!disposed)refreshRecords();};document.addEventListener('sela:profiles',changed);refreshRecords();
 return ()=>{disposed=true;document.removeEventListener('sela:profiles',changed);};
}
