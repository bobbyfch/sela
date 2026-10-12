// Bounded downloads shared by opt-in catalogs and cloud imports.
export const MAX_IMPORT=64*1024*1024;
export async function fetchFile(url: string,name: string,{headers={},signal}: {headers?: HeadersInit; signal?: AbortSignal}={}){
 const parsed=new URL(url);if(parsed.protocol!=='https:')throw new Error('An HTTPS download is required.');
 const response=await fetch(parsed.href,{headers,signal,credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok||Number(response.headers.get('content-length'))>MAX_IMPORT){
  try{await response.body?.cancel();}catch{}
  if(!response.ok)throw new Error('Download failed ('+response.status+').');
  throw new Error('Cloud imports are limited to 64 MB per book.');
 }
 const type=response.headers.get('content-type')||'application/octet-stream';let blob;
 if(response.body?.getReader){const reader=response.body.getReader(),chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_IMPORT)throw new Error('Cloud imports are limited to 64 MB per book.');chunks.push(value);}blob=new Blob(chunks,{type});}catch(e){await reader.cancel().catch(()=>{});throw e;}finally{reader.releaseLock();}}
 else{blob=await response.blob();if(blob.size>MAX_IMPORT)throw new Error('Cloud imports are limited to 64 MB per book.');}
 const sanitized=String(name).replace(/[\\/\u0000-\u001f]/g,'_'),extension=sanitized.match(/\.[a-z\d]{1,8}$/i)?.[0]||'';
 const filename=sanitized.length>180?sanitized.slice(0,180-extension.length)+extension:sanitized;
 return new File([blob],filename,{type});
}
export function link(parent: HTMLElement,label: string,url: string){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);return a;}
export function node<K extends keyof HTMLElementTagNameMap>(parent: HTMLElement,tag: K,text='',className=''): HTMLElementTagNameMap[K]{const n=document.createElement(tag);n.textContent=text;n.className=className;parent.append(n);return n;}

export async function responseText(response:Response,limit=2*1048576){
 if(!response.ok)throw Error('Source unavailable ('+response.status+')');if(Number(response.headers.get('content-length'))>limit){await response.body?.cancel();throw Error('Source response exceeds limit');}
 if(!response.body?.getReader){const text=await response.text();if(new TextEncoder().encode(text).length>limit)throw Error('Source response exceeds limit');return text;}
 const reader=response.body.getReader(),decoder=new TextDecoder();let size=0,text='';try{for(;;){const part=await reader.read();if(part.done)break;if((size+=part.value.byteLength)>limit)throw Error('Source response exceeds limit');text+=decoder.decode(part.value,{stream:true});}return text+decoder.decode();}catch(e){await reader.cancel().catch(()=>{});throw e;}finally{reader.releaseLock();}
}
