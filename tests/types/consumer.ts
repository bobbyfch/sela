import Flippy, { type FlippyOptions } from '../../dist/types/index.js';
const options: FlippyOptions = { pdfUrl: '/media/ebook/42', mode: 'webtoon', withCredentials: true, onPageChange: detail => console.log(detail.page) };
const reader = new Flippy(options);
reader.open().then(instance => instance.goTo(3).zoomIn().next());
reader.addEventListener('close', () => reader.destroy());

import { Sela, type SelaOptions } from '../../dist/types/index.js';
const selaOptions: SelaOptions = { url: '/story.fb2', format: 'fb2', language: 'auto', ui: 'app', palette: 'forest', metadata: {author: 'An author', year: '2026'} };
new Sela(selaOptions).open().then(async instance => { const metadata = await instance.getMetadata(); console.log(metadata.author); return instance.showTools(); });
