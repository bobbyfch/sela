const MAX = 64 * 1024 * 1024;
export async function readBytes(options, signal) {
  if (options.data) {
    const bytes = new Uint8Array(options.data);
    if (bytes.length > MAX) throw new Error('Document exceeds the 64 MiB archive limit');
    return bytes.slice();
  }
  const response = await fetch(options.url, {signal,headers:options.httpHeaders,credentials:options.withCredentials?'include':'same-origin'});
  if (!response.ok) throw new Error(`Document HTTP ${response.status}`);
  if (Number(response.headers.get('content-length')) > MAX) throw new Error('Document exceeds the archive limit');
  const reader=response.body?.getReader();
  if(!reader) { const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length>MAX)throw new Error('Document too large');return bytes; }
  const chunks=[];let length=0;
  try { while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>MAX)throw new Error('Document exceeds the archive limit');chunks.push(value);} }
  catch(error){await reader.cancel();throw error;}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes;
}
