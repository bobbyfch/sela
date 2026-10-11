import {node} from './network.js';
const reflections=[
 ['A few pages are enough for today.','Beberapa halaman cukup untuk hari ini.'],
 ['You can return to an unfinished book.','Buku yang belum selesai masih bisa kamu datangi lagi.'],
 ['Leave a little room for a different point of view.','Sisakan tempat untuk sudut pandang yang berbeda.'],
 ['A good passage can be worth reading twice.','Paragraf yang baik boleh dibaca dua kali.'],
 ['Read at your own pace.','Baca dengan kecepatanmu sendiri.'],
 ['Put the book down when your eyes need a rest.','Letakkan buku ketika matamu perlu istirahat.']
];
export function mountAtmosphere(home,{t}){
 const intro=home.querySelector('.room-intro');const image=node(intro,'img','','reading-room');image.src=new URL('./reading-room.svg',import.meta.url).href;image.alt='';image.setAttribute('aria-hidden','true');image.decoding='async';
 const section=node(home,'section','','home-reflection');const copy=node(section,'div'),label=node(copy,'small','Sela'),quote=node(copy,'p');const refresh=node(section,'button','↻');refresh.type='button';
 let index;try{index=Number(localStorage.getItem('sela-reflection'))||0;}catch{index=0;}
 function localize(){quote.textContent=t(...reflections[index%reflections.length]);refresh.setAttribute('aria-label',t('Another reading note','Catatan baca lainnya'));refresh.title=refresh.getAttribute('aria-label');}
 refresh.onclick=()=>{index=(index+1+Math.floor(Math.random()*(reflections.length-1)))%reflections.length;try{localStorage.setItem('sela-reflection',index);}catch{}localize();};localize();return {localize};
}
