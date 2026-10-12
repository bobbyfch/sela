import {createHash} from 'node:crypto';
// Normalize Git text line endings; binary assets retain their exact bytes.
export function appCacheIdentity(version: string,entries: ReadonlyArray<readonly [string, Uint8Array]>): string{
 const hash=createHash('sha256');
 for(const [path,bytes]of [...entries].sort(([a],[b])=>a<b?-1:a>b?1:0)){const content=/\.(js|mjs|css|html|svg|json|webmanifest|txt)(?:\?.*)?$/.test(path)?Buffer.from(Buffer.from(bytes).toString('utf8').replace(/\r\n/g,'\n')):bytes;hash.update(path);hash.update('\0');hash.update(content);hash.update('\0');}
 return 'sela-bookshelf-'+version+'-'+hash.digest('hex').slice(0,16);
}
