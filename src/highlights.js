// Text-node decoration avoids HTML injection and preserves the document's links.
export function decorateHighlights(root,quotes){
 if(!root)return;
 for(const mark of root.querySelectorAll('mark[data-sela-highlight]'))mark.replaceWith(...mark.childNodes);
 root.normalize();
 for(const quote of quotes){
  if(typeof quote!=='string'||!quote.trim())continue;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];let node,text='';
  while((node=walker.nextNode())){nodes.push({node,start:text.length});text+=node.textContent;}
  const start=text.indexOf(quote);if(start<0)continue;const end=start+quote.length;
  for(const entry of nodes){const length=entry.node.length,a=Math.max(0,start-entry.start),b=Math.min(length,end-entry.start);if(b<=a)continue;
   const selected=a?entry.node.splitText(a):entry.node;if(b-a<selected.length)selected.splitText(b-a);
   const mark=document.createElement('mark');mark.dataset.selaHighlight='';mark.style.cssText='background:#f3dc83;color:#26352a;border-radius:2px';selected.replaceWith(mark);mark.append(selected);
  }
 }
}
