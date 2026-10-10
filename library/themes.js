export const palettes=['limaraya','paper','ink','rose'];
export function applyPalette(value){
 const chosen=palettes.includes(value)?value:'limaraya';document.documentElement.dataset.palette=chosen;
 try{localStorage.setItem('sela-library:palette',chosen);}catch{}
 document.dispatchEvent(new Event('sela:palette'));
}
export function mountPalettes(parent,t){
 const group=document.createElement('div');group.className='app-palette-picker';group.setAttribute('role','group');group.setAttribute('aria-label',t('App palette','Palet aplikasi'));parent.append(group);
 for(const [key,en,id]of [['limaraya','Limaraya','Limaraya'],['paper','Paper','Kertas'],['ink','Ink','Tinta'],['rose','Rose','Mawar']]){const b=document.createElement('button');b.type='button';b.dataset.paletteChoice=key;b.dataset.en=en;b.dataset.id=id;b.textContent=t(en,id);b.onclick=()=>{applyPalette(key);sync();};group.append(b);}
 function sync(){for(const b of group.children){b.setAttribute('aria-pressed',String(b.dataset.paletteChoice===document.documentElement.dataset.palette));b.textContent=t(b.dataset.en,b.dataset.id);}}
 sync();return sync;
}
let initial='limaraya';try{initial=localStorage.getItem('sela-library:palette')||initial;}catch{}applyPalette(initial);
