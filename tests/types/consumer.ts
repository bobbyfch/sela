import Sela, { type SelaOptions } from '../../dist/types/index.js';
import {mountSelaExtension,readerDiagnostics} from '@bobbyfch/sela/host';
const options: SelaOptions = { pdfUrl: '/media/ebook/42', mode: 'webtoon', withCredentials: true, onPageChange: detail => console.log(detail.page) };
const reader = new Sela(options);
const unmount=mountSelaExtension(reader,{id:'typed-host',setup(viewer,signal){viewer.on('ready',detail=>console.log(detail.pages),{signal});return ()=>{};}});
unmount();console.log(readerDiagnostics(reader).version);
reader.open().then(instance => instance.goTo(3).zoomIn().next());
reader.addEventListener('close', () => reader.destroy());

const selaOptions: SelaOptions = { url: '/story.fb2', format: 'fb2', language: 'auto', ui: 'app', palette: 'forest', metadata: {author: 'An author', year: '2026'} };
new Sela(selaOptions).open().then(async instance => { const metadata = await instance.getMetadata(); console.log(metadata.author); return instance.showTools(); });

// Negative API contracts: emitted declarations must continue rejecting bad input.
// @ts-expect-error unsupported rendering mode
new Sela({ mode: 'unknown' });
// @ts-expect-error document bytes cannot be an arbitrary string
new Sela({ data: 'not binary data' });
// @ts-expect-error unsafe arbitrary CSS filters are not part of the SDK
reader.setFilter('url(javascript:bad)');

const stop=reader.on('progressChanged',detail=>console.log(detail.progress,detail.pages));
stop();
reader.open(new Blob(['example'],{type:'text/plain'}));
// @ts-expect-error event names form a closed contract
reader.on('unknownEvent',()=>{});
// @ts-expect-error progress events do not expose authenticated URLs
reader.on('progressChanged',detail=>console.log(detail.url));
// @ts-expect-error source must be URL or document bytes
reader.open(42);

import {createReaderHost, type ReaderStorage} from '../../dist/types/host-integration.js';
const annotationStorage:ReaderStorage={read:async()=>[],write:async()=>{}};
const host=createReaderHost(reader,{storage:annotationStorage,documentKey:'book',dictionary:async text=>text});
host.open(new Uint8Array([1,2,3]));
host.saveAnnotations([{id:'note',page:1,text:'Quote'}]);
// @ts-expect-error annotations have numeric pages
host.saveAnnotations([{id:'note',page:'one',text:'Quote'}]);
// @ts-expect-error translation returns text, never an arbitrary document
createReaderHost(reader,{translation:async()=>new Blob()});
