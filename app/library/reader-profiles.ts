import {readingPreferences} from '../../src/preferences.ts';

const builtins=[
 ['novel','Novel','Novel',{mode:'single',fit:'page',filter:'none',brightness:1,dim:false,fontFamily:'serif',fontSize:20,lineHeight:1.8,textMargin:24,textAlign:'start',paperTexture:true,lowPower:false,cropMargin:0}],
 ['manga','Manga','Manga',{mode:'manga',fit:'page',filter:'none',brightness:1,dim:false,paperTexture:false,lowPower:false,cropMargin:0}],
 ['academic','Study','Kajian',{mode:'single',fit:'width',filter:'none',brightness:1,dim:false,fontFamily:'sans',fontSize:18,lineHeight:1.6,textMargin:20,textAlign:'start',paperTexture:false,lowPower:false,cropMargin:0}],
 ['night','Night reading','Larut',{mode:'single',fit:'page',filter:'lowblue',brightness:.65,dim:true,fontFamily:'serif',fontSize:21,lineHeight:1.9,textMargin:24,textAlign:'start',paperTexture:false,lowPower:true,cropMargin:0}]
];
export function validateProfiles(value){
 if(!Array.isArray(value)||value.length>20)throw Error('Profiles must contain at most 20 entries.');
 const names=new Set();return value.map(record=>{
  if(!record||typeof record.name!=='string'||!record.name.trim()||record.name.trim().length>48)throw Error('Profile names must contain 1–48 characters.');
  const name=record.name.trim();if(names.has(name))throw Error('A profile with this name already exists.');names.add(name);
  if(!record.values||typeof record.values!=='object'||Array.isArray(record.values))throw Error('Invalid reading profile.');
  const values=readingPreferences(record.values);if(!Object.keys(values).length)throw Error('Profile has no supported reading settings.');return {name,values};
 });
}
export function readProfiles(prefix='sela-library:'){
 let value;try{value=JSON.parse(localStorage.getItem(prefix+'profiles')||'[]');}catch{throw Error('Saved reading profiles could not be read. Keep a backup before resetting them.');}return validateProfiles(value);
}
export function writeProfiles(records,prefix='sela-library:'){
 const valid=validateProfiles(records);localStorage.setItem(prefix+'profiles',JSON.stringify(valid));document.dispatchEvent(new Event('sela:profiles'));return valid;
}
export function mergeProfiles(current,incoming){const records=validateProfiles(current);for(const record of validateProfiles(incoming))if(!records.some(item=>item.name===record.name))records.push(record);return validateProfiles(records);}

export function mountReaderProfiles(parent,state,{t,onApplied=()=>{}}){
 const prefix=state.options.storagePrefix||'sela:';
 const field=document.createElement('label');field.className='app-reading-field';field.textContent=t('Reading profile','Profil baca');const select=document.createElement('select');select.setAttribute('aria-label',field.textContent);field.append(select);parent.append(field);
 const details=document.createElement('details');details.className='app-profile-manager';const summary=document.createElement('summary');summary.textContent=t('Manage profiles','Kelola profil');details.append(summary);parent.append(details);
 const name=document.createElement('input');name.type='text';name.maxLength=48;name.setAttribute('aria-label',t('Profile name','Nama profil'));name.placeholder=t('Profile name','Nama profil');details.append(name);
 const actions=document.createElement('div');actions.className='app-profile-actions';details.append(actions);const notice=document.createElement('p');notice.setAttribute('role','status');details.append(notice);
 let records=[],armed=false,disposed=false;
 function refresh(){const selected=select.value;select.replaceChildren();const add=(value,label)=>{const o=document.createElement('option');o.value=value;o.textContent=label;select.append(o);};add('',t('Choose a profile','Pilih profil'));for(const [key,en,id]of builtins)add(key,t(en,id));try{records=readProfiles(prefix);records.forEach((record,index)=>add('custom:'+index,record.name));}catch(e){notice.textContent=e.message;records=[];}select.value=[...select.options].some(o=>o.value===selected)?selected:'';armed=false;remove.textContent=t('Delete','Hapus');update.disabled=remove.disabled=!select.value.startsWith('custom:');}
 const selectedRecord=()=>select.value.startsWith('custom:')?records[Number(select.value.slice(7))]:null;
 const action=(en,id,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=t(en,id);b.onclick=()=>{try{fn();}catch(e){notice.textContent=e.message;}};actions.append(b);return b;};
 action('Save current','Simpan saat ini',()=>{const record={name:name.value,values:readingPreferences(state.options)};const next=writeProfiles([...records,record],prefix);select.value='custom:'+(next.length-1);refresh();notice.textContent=t('Profile saved.','Profil tersimpan.');});
 const update=action('Update selected','Perbarui pilihan',()=>{const record=selectedRecord();if(!record)return;writeProfiles(records.map(r=>r===record?{name:name.value||r.name,values:readingPreferences(state.options)}:r),prefix);refresh();notice.textContent=t('Profile updated.','Profil diperbarui.');});
 const remove=action('Delete','Hapus',()=>{const record=selectedRecord();if(!record)return;if(!armed){armed=true;remove.textContent=t('Confirm delete','Konfirmasi hapus');return;}writeProfiles(records.filter(r=>r!==record),prefix);select.value='';refresh();name.value='';notice.textContent=t('Profile deleted. Book settings are kept.','Profil dihapus. Pengaturan buku tetap tersimpan.');});
 select.onchange=async()=>{
  const custom=selectedRecord(),preset=builtins.find(r=>r[0]===select.value),values=custom?.values||preset?.[3];armed=false;remove.textContent=t('Delete','Hapus');update.disabled=remove.disabled=!custom;name.value=custom?.name||'';notice.textContent='';if(!values)return;
  select.disabled=true;try{const {mode,fit,...preferences}=values;const chosen=mode&&(state.book.getText&&!['single','scroll'].includes(mode)?'single':mode);if(chosen)await state.setMode(chosen);if(disposed)return;state.setPreferences(preferences);if(fit)state.setFit(fit);onApplied();notice.textContent=t('Profile applied to this book.','Profil diterapkan pada buku ini.');}catch(e){if(!disposed)notice.textContent=e.message;}finally{if(!disposed)select.disabled=false;}
 };
 const changed=()=>{if(!disposed)refresh();};document.addEventListener('sela:profiles',changed);refresh();return ()=>{disposed=true;document.removeEventListener('sela:profiles',changed);};
}
