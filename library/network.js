// Bounded downloads shared by opt-in catalogs and cloud imports.
export const MAX_IMPORT=64*1024*1024;
export async function fetchFile(url,name,{headers={},signal}={}){
 const parsed=new URL(url);if(parsed.protocol!=='https:')throw new Error('An HTTPS download is required.');
 const response=await fetch(parsed.href,{headers,signal,credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw new Error('Download failed ('+response.status+').');
 if(Number(response.headers.get('content-length'))>MAX_IMPORT)throw new Error('Cloud imports are limited to 64 MB per book.');
 const type=response.headers.get('content-type')||'application/octet-stream';let blob;
 if(response.body?.getReader){const reader=response.body.getReader(),chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_IMPORT)throw new Error('Cloud imports are limited to 64 MB per book.');chunks.push(value);}blob=new Blob(chunks,{type});}catch(e){await reader.cancel().catch(()=>{});throw e;}finally{reader.releaseLock();}}
 else{blob=await response.blob();if(blob.size>MAX_IMPORT)throw new Error('Cloud imports are limited to 64 MB per book.');}
 return new File([blob],String(name).replace(/[\\/\u0000-\u001f]/g,'_').slice(0,180),{type});
}
export function link(parent,label,url){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);return a;}
export function node(parent,tag,text='',className=''){const n=document.createElement(tag);n.textContent=text;n.className=className;parent.append(n);return n;}
