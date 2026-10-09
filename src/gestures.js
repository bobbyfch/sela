// Ctrl-wheel includes trackpad pinch events. Plain wheel zoom is opt-in.
export function bindZoomGestures(container, owner, options) {
  const pointers = new Map();
  let pinch;
  const wheel = event => {
    if (event.target.closest('button,input,select,a') || !(event.ctrlKey || options.wheelZoom)) return;
    event.preventDefault();
    owner.setZoom(owner.zoom * Math.exp(-Math.max(-120, Math.min(120, event.deltaY)) * .006));
  };
  const distance = () => { const [a,b] = [...pointers.values()]; return Math.hypot(a.x-b.x,a.y-b.y); };
  const down = event => {
    if (event.pointerType !== 'touch' || event.target.closest('button,input,select,a')) return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if (pointers.size === 2) pinch = { distance: Math.max(1,distance()), zoom: owner.zoom };
  };
  const move = event => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if (pinch && pointers.size === 2) { event.preventDefault(); owner.setZoom(pinch.zoom*distance()/pinch.distance); }
  };
  const up = event => { pointers.delete(event.pointerId); if(pointers.size<2) pinch=null; };
  container.addEventListener('wheel',wheel,{passive:false});
  container.addEventListener('pointerdown',down); container.addEventListener('pointermove',move,{passive:false});
  container.addEventListener('pointerup',up); container.addEventListener('pointercancel',up);
  return () => {
    container.removeEventListener('wheel',wheel);container.removeEventListener('pointerdown',down);container.removeEventListener('pointermove',move);
    container.removeEventListener('pointerup',up);container.removeEventListener('pointercancel',up);pointers.clear();
  };
}
