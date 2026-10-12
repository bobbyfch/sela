export const palettes=['linen','oak','walnut','forest','paper','ink','rose','charcoal'];
export const paperTextures=['smooth','rough','vellum','lined','laid','oak','walnut','woven'] as const;
export type PaperTexture=typeof paperTextures[number];
export function initializePalette(){let initial='linen';try{initial=localStorage.getItem('sela-library:palette')||initial;}catch{}const url=new URL(location.href),requested=url.searchParams.get('palette');if(requested&&palettes.includes(requested)){initial=requested;url.searchParams.delete('palette');history.replaceState(history.state,'',url);}applyPalette(initial);initializePaperTexture();}
export function applyPalette(value,target=document.documentElement){
 const chosen=palettes.includes(value)?value:'linen';target.dataset.palette=chosen;
 if(target===document.documentElement){try{localStorage.setItem('sela-library:palette',chosen);}catch{}document.dispatchEvent(new Event('sela:palette'));}
}
export function mountPalettes(parent,t,target=document.documentElement){
 const group=document.createElement('div');group.className='app-palette-picker';group.setAttribute('role','group');group.setAttribute('aria-label',t('App palette','Palet aplikasi'));parent.append(group);
 for(const [key,en,id]of [['linen','Linen','Linen'],['oak','Oak','Oak'],['walnut','Walnut','Walnut'],['forest','Rimba','Rimba'],['paper','Lontar','Lontar'],['ink','Nila','Nila'],['rose','Seroja','Seroja'],['charcoal','OLED','OLED']]){const b=document.createElement('button');b.type='button';b.dataset.paletteChoice=key;b.dataset.en=en;b.dataset.id=id;b.textContent=t(en,id);b.onclick=()=>{applyPalette(key,target);sync();};group.append(b);}
 function sync(){for(const b of group.children){b.setAttribute('aria-pressed',String((b as HTMLElement).dataset.paletteChoice===target.dataset.palette));const caption=b.lastChild;if(caption?.nodeType===3)caption.textContent=t((b as HTMLElement).dataset.en,(b as HTMLElement).dataset.id);}}
 sync();return sync;
}
export function initializePaperTexture(target=document.documentElement){let initial:PaperTexture='smooth';try{const saved=localStorage.getItem('sela-library:paper-texture');if(paperTextures.includes(saved as PaperTexture))initial=saved as PaperTexture;}catch{}applyPaperTexture(initial,target);}
export function applyPaperTexture(value:string,target=document.documentElement){const chosen=paperTextures.includes(value as PaperTexture)?value as PaperTexture:'smooth';target.dataset.paperTexture=chosen;if(target===document.documentElement){try{localStorage.setItem('sela-library:paper-texture',chosen);}catch{}document.dispatchEvent(new Event('sela:texture'));}}
export function mountPaperTextures(parent,t,target=document.documentElement){
 const group=document.createElement('div');group.className='paper-texture-picker room-material-picker';group.setAttribute('role','group');group.setAttribute('aria-label',t('Room surface','Permukaan ruang'));parent.append(group);
 const heading=document.createElement('small');heading.className='paper-texture-heading';heading.textContent=t('Room surface','Material ruang');group.append(heading);
 for(const [key,en,id]of [['smooth','Smooth linen','Linen halus'],['rough','Deckled paper','Kertas bertekstur'],['vellum','Soft vellum','Kertas buram'],['lined','Ruled paper','Kertas bergaris'],['laid','Laid paper','Kertas serat silang'],['oak','Light oak','Oak muda'],['walnut','Dark walnut','Walnut tua'],['woven','Woven linen','Linen tenun']] as const){const button=document.createElement('button');button.type='button';button.dataset.textureChoice=key;button.dataset.en=en;button.dataset.id=id;const swatch=document.createElement('i');swatch.setAttribute('aria-hidden','true');button.append(swatch);const label=document.createElement('span');label.textContent=t(en,id);button.append(label);button.onclick=()=>{applyPaperTexture(key,target);sync();};group.append(button);}
 function sync(){group.setAttribute('aria-label',t('Room surface','Permukaan ruang'));heading.textContent=t('Room surface','Material ruang');for(const button of group.querySelectorAll<HTMLButtonElement>('[data-texture-choice]')){const key=button.dataset.textureChoice;button.setAttribute('aria-pressed',String(key===target.dataset.paperTexture));button.lastElementChild!.textContent=t(button.dataset.en||'',button.dataset.id||'');}}
 sync();return sync;
}
