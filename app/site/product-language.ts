import {translate} from '../../src/i18n.ts';

function apply(){
 const locale=document.documentElement.lang||'en-US';
 for(const element of document.querySelectorAll<HTMLElement>('[data-en][data-id]')){
  element.textContent=translate(element.dataset.en||'',element.dataset.id||'',locale);
 }
}

new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
apply();
