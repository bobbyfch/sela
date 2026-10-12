/** Animate a disposable cover snapshot, never the reader or its gesture layers. */
export interface CoverTransition { ready(): void; close(): void; cancel(): void }
let active: (() => void) | undefined;
export function beginCoverTransition(source: HTMLElement | null): CoverTransition {
  active?.();
  const idle = { ready() {}, close() {}, cancel() {} };
  if (!source || matchMedia('(prefers-reduced-motion: reduce)').matches || !source.animate) return idle;
  const origin = source.getBoundingClientRect();
  if (origin.width < 1 || origin.height < 1 || origin.bottom < 0 || origin.top > innerHeight) return idle;
  const scroll = { x: scrollX, y: scrollY };
  const snapshot = source.cloneNode(true) as HTMLElement;
  // The visual snapshot must never participate in shelf selectors or interactions.
  const computed = getComputedStyle(source);
  for (const property of ['display','flex-direction','justify-content','align-items','gap','padding','background','color','border','border-radius','font','text-align']) snapshot.style.setProperty(property,computed.getPropertyValue(property));
  const originals=source.querySelectorAll<HTMLElement>('*');
  snapshot.querySelectorAll<HTMLElement>('*').forEach((node,index)=>{
    const original=originals[index];if(!original)return;
    const style=getComputedStyle(original);
    for(const property of ['position','inset','width','height','object-fit','font','color','text-align','display'])node.style.setProperty(property,style.getPropertyValue(property));
  });
  snapshot.removeAttribute('id');
  snapshot.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  snapshot.setAttribute('aria-hidden','true');
  snapshot.inert = true;
  snapshot.className = 'cover-transition';
  Object.assign(snapshot.style, { position:'fixed',left:origin.left+'px',top:origin.top+'px',width:origin.width+'px',height:origin.height+'px',margin:'0',pointerEvents:'none',zIndex:'2147483647' });
  document.body.append(snapshot);
  // Stay inside the viewport and composite transforms, without animating layout.
  const scale = Math.min(1.8, (innerWidth - 48) / origin.width, (innerHeight * .6) / origin.height);
  const transform = `translate(${innerWidth/2-origin.left-origin.width/2}px, ${innerHeight/2-origin.top-origin.height/2}px) scale(${scale})`;
  let animation: Animation | undefined;
  let timer: ReturnType<typeof setTimeout>;
  let cancelled = false;
  const clean = () => { animation?.cancel(); clearTimeout(timer); snapshot.remove(); };
  const cancel = () => { cancelled=true;clean();if(active===cancel)active=undefined; };
  active = cancel;
  animation = snapshot.animate([{transform:'scale(.97)',opacity:1},{transform,opacity:1}],{duration:320,easing:'cubic-bezier(.22,.8,.2,1)',fill:'forwards'});
  // Slow initialization must not leave a snapshot over the document indefinitely.
  timer=setTimeout(clean,1200);
  return {
    ready() {
      if (cancelled || !snapshot.isConnected) return;
      animation?.cancel();
      animation=snapshot.animate([{transform,opacity:1},{transform,opacity:0}],{duration:160,fill:'forwards'});
      void animation.finished.then(clean,clean);
    },
    close() {
      if (cancelled) return;
      clean();
      scrollTo({left:scroll.x,top:scroll.y,behavior:'instant'});
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { cancel();return; }
      // A refresh can replace the original cover. The captured rectangle is the fallback.
      document.body.append(snapshot);
      animation=snapshot.animate([{transform,opacity:0},{transform:'none',opacity:1}],{duration:240,easing:'cubic-bezier(.22,.8,.2,1)',fill:'forwards'});
      void animation.finished.then(cancel,cancel);
      timer=setTimeout(cancel,500);
    }, cancel
  };
}
