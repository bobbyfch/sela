import type {Sela} from '../../src/public-api.ts';
let pendingBack: Promise<void> = Promise.resolve();
let sequence=0;
/** App-only history ownership. The standalone SDK never mutates its host's history. */
export async function bindReaderHistory(viewer: Sela): Promise<void> {
  await pendingBack;
  if(!viewer.overlay)return;
  const marker='sela-reader-'+(++sequence);
  const state=history.state && typeof history.state==='object' ? history.state : {};
  history.pushState({...state,selaReader:marker},'',location.href);
  const lifetime=new AbortController();
  let disposed=false;
  let offClose: ()=>void;
  let offDestroy: ()=>void;
  const release=()=>{
    if(disposed)return;disposed=true;lifetime.abort();offClose();offDestroy();
    if(history.state?.selaReader!==marker)return;
    // Serialize a subsequent open with this asynchronous history traversal.
    pendingBack=new Promise(resolve=>{
      let timer: ReturnType<typeof setTimeout>;
      const done=()=>{clearTimeout(timer);window.removeEventListener('popstate',done);resolve();};
      window.addEventListener('popstate',done,{once:true});
      timer=setTimeout(done,500);
      history.back();
    });
  };
  offClose=viewer.on('close',release);
  offDestroy=viewer.on('destroyed',release);
  window.addEventListener('popstate',event=>{
    if(event.state?.selaReader!==marker)viewer.close();
  },{signal:lifetime.signal});
}
