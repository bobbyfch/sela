(()=>{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const nodes=document.querySelectorAll('.hero h1,.sample-gallery,.installation-guide article,.notes article');
 if(!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{for(const item of entries)if(item.isIntersecting){item.target.classList.add('in-view');observer.unobserve(item.target);}},{threshold:.08});
 nodes.forEach(node=>{node.classList.add('reveal');observer.observe(node);});
 const art=document.querySelector('.reader-illustration');let frame=0;
 art?.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||frame)return;const rect=art.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;frame=requestAnimationFrame(()=>{art.style.setProperty('--tilt-x',(-y*3)+'deg');art.style.setProperty('--tilt-y',(x*3)+'deg');frame=0;});});
 art?.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);frame=0;art.style.setProperty('--tilt-x','0deg');art.style.setProperty('--tilt-y','0deg');});
 window.addEventListener('pagehide',()=>{observer.disconnect();cancelAnimationFrame(frame);},{once:true});
})();
