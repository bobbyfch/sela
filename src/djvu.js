// Decoder is provided separately: upstream DjVu.js is GPL-2.0, not MIT.
import { readBytes } from './archive.js';
const libraries=new Map();
function deadline(promise,worker){
  let timer;
  return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>{worker.terminate();reject(new Error('DjVu decoding timed out'));},30000);})]).finally(()=>clearTimeout(timer));
}
export async function loadDjvu(options) {
  if(!options.djvujsSrc)throw new Error('DjVu requires djvujsSrc pointing to a separately supplied GPL-2.0 DjVu.js decoder');
  const key=options.djvujsSrc+'|'+(options.djvuIntegrity||'');
  if(!libraries.has(key)){libraries.set(key,new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=options.djvujsSrc;
    if(options.djvuIntegrity){script.integrity=options.djvuIntegrity;script.crossOrigin='anonymous';}
    const timer=setTimeout(()=>{script.remove();reject(new Error('DjVu decoder loading timed out'));},15000);
    script.onload=()=>{clearTimeout(timer);window.DjVu?.Worker?resolve(window.DjVu):reject(new Error('Invalid DjVu decoder'));};
    script.onerror=()=>{clearTimeout(timer);script.remove();reject(new Error('DjVu decoder failed to load'));};document.head.appendChild(script);
  }).catch(error=>{libraries.delete(key);throw error;}));}
  const lib=await libraries.get(key);
  return {getDocument(opts){
    const abort=new AbortController();let worker,closed=false;
    const destroy=async()=>{closed=true;abort.abort();worker?.terminate();};
    const promise=(async()=>{
      const bytes=await readBytes(opts,abort.signal);if(closed)throw new DOMException('Closed','AbortError');
      worker=new lib.Worker();await deadline(worker.createDocument(bytes.buffer),worker);
      // Single-file bundled documents keep document reads self-contained.
      if(!await deadline(worker.doc.isBundled().run(),worker))throw new Error('Indirect multi-file DjVu is not supported');
      const sizes=await deadline(worker.doc.getPagesSizes().run(),worker);
      if(!sizes.length||sizes.length>10000||sizes.some(s=>s.width*s.height>20000000))throw new Error('DjVu exceeds page or image-size limits');
      return {numPages:sizes.length,destroy,getPage:async n=>({
        getViewport:({scale})=>({width:sizes[n-1].width*scale,height:sizes[n-1].height*scale,scale}),
        render:({canvasContext,viewport})=>{
          let cancelled=false;const pending=worker.doc.getPage(n).getImageData().run();
          const promise=deadline(pending,worker).then(async data=>{
            if(cancelled||closed)return;
            const bitmap=await createImageBitmap(data);
            try{if(!cancelled&&!closed)canvasContext.drawImage(bitmap,0,0,viewport.width,viewport.height);}finally{bitmap.close();}
          });
          return {promise,cancel(){cancelled=true;worker.cancelTask(pending);}};
        }
      })};
    })().catch(async error=>{await destroy();throw error;});
    return {promise,destroy};
  }};
}
