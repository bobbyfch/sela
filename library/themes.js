export const palettes=['forest','paper','ink','rose'];
export function initializePalette(){let initial='forest';try{initial=localStorage.getItem('sela-library:palette')||initial;}catch{}applyPalette(initial);}
export function applyPalette(value,target=document.documentElement){
 const chosen=palettes.includes(value)?value:'forest';target.dataset.palette=chosen;
 if(target===document.documentElement){try{localStorage.setItem('sela-library:palette',chosen);}catch{}document.dispatchEvent(new Event('sela:palette'));}
}
export function mountPalettes(parent,t,target=document.documentElement){
 const group=document.createElement('div');group.className='app-palette-picker';group.setAttribute('role','group');group.setAttribute('aria-label',t('App palette','Palet aplikasi'));parent.append(group);
 for(const [key,en,id]of [['forest','Forest','Hutan'],['paper','Paper','Kertas'],['ink','Ink','Tinta'],['rose','Rose','Mawar']]){const b=document.createElement('button');b.type='button';b.dataset.paletteChoice=key;b.dataset.en=en;b.dataset.id=id;b.textContent=t(en,id);b.onclick=()=>{applyPalette(key,target);sync();};group.append(b);}
 function sync(){for(const b of group.children){b.setAttribute('aria-pressed',String(b.dataset.paletteChoice===target.dataset.palette));b.textContent=t(b.dataset.en,b.dataset.id);}}
 sync();return sync;
}
