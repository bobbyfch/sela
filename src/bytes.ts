import type { SelaOptions } from './public-api.ts';
type DocumentSource = Pick<SelaOptions, 'data' | 'url' | 'httpHeaders' | 'withCredentials'>;
const MAX = 64 * 1024 * 1024;
/** Shared non-PDF loader; preserves SDK byte and authenticated-request options. */
export async function readBytes(options: DocumentSource, signal?: AbortSignal): Promise<Uint8Array<ArrayBuffer>> {
  if (signal?.aborted) throw signal.reason ?? new DOMException('Document loading aborted', 'AbortError');
  if (options.data) {
    // Check before copying: an oversized source must not double memory use.
    if (options.data.byteLength > MAX) throw new Error('Document exceeds the 64 MiB archive limit');
    return new Uint8Array(options.data instanceof ArrayBuffer ? options.data.slice(0) : options.data);
  }
  if (!options.url) throw new TypeError('Document URL or data is required');
  const response = await fetch(options.url, {signal,headers:options.httpHeaders,credentials:options.withCredentials?'include':'same-origin'});
  if (!response.ok || Number(response.headers.get('content-length')) > MAX) {
    // A rejected response still owns a stream. Release it without masking the error.
    try { await response.body?.cancel(); } catch {}
    if (!response.ok) throw new Error(`Document HTTP ${response.status}`);
    throw new Error('Document exceeds the archive limit');
  }
  const reader=response.body?.getReader();
  if(!reader) { const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length>MAX)throw new Error('Document too large');return bytes; }
  const chunks: Uint8Array[]=[];let length=0;
  try { while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>MAX)throw new Error('Document exceeds the archive limit');chunks.push(value);} }
  catch(error){try{await reader.cancel();}catch{}throw error;}
  finally { reader.releaseLock(); }
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes;
}
