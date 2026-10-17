/** Selection is explicit: long-press and context-menu gestures remain available to the browser. */
export function bindBookSelection(cover:HTMLButtonElement,checkbox:HTMLInputElement){
  const original=cover.onclick;
  const toggle=()=>{checkbox.checked=!checkbox.checked;checkbox.dispatchEvent(new Event('change',{bubbles:true}));};
  cover.onclick=event=>{
    if(document.body.dataset.selectionMode==='true'){
      event.preventDefault();
      toggle();
      return;
    }
    return original?.call(cover,event);
  };
}
