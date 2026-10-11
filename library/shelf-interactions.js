// Long press enters selection without accidentally opening the book afterwards.
export function bindBookSelection(cover,checkbox){
 const original=cover.onclick;let timer,start,suppressUntil=0;
 const toggle=()=>{checkbox.checked=!checkbox.checked;checkbox.dispatchEvent(new Event('change',{bubbles:true}));};
 const cancel=()=>{clearTimeout(timer);start=null;};
 cover.addEventListener('pointerdown',event=>{if(event.pointerType!=='touch')return;start={x:event.clientX,y:event.clientY};timer=setTimeout(()=>{if(!cover.isConnected)return;suppressUntil=Date.now()+800;toggle();navigator.vibrate?.(15);},550);});
 cover.addEventListener('pointermove',event=>{if(start&&Math.hypot(event.clientX-start.x,event.clientY-start.y)>10)cancel();});
 cover.addEventListener('pointerup',cancel);cover.addEventListener('pointercancel',cancel);cover.addEventListener('pointerleave',cancel);
 cover.addEventListener('contextmenu',event=>{event.preventDefault();if(Date.now()>suppressUntil){toggle();suppressUntil=Date.now()+800;}});
 cover.onclick=event=>{if(Date.now()<suppressUntil){event.preventDefault();return;}if(document.body.dataset.selecting==='true'){toggle();return;}return original?.(event);};
}
