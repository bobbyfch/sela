import Sela, { type SelaOptions } from '../../dist/types/index.js';
const options: SelaOptions = { pdfUrl: '/media/ebook/42', mode: 'webtoon', withCredentials: true, onPageChange: detail => console.log(detail.page) };
const reader = new Sela(options);
reader.open().then(instance => instance.goTo(3).zoomIn().next());
reader.addEventListener('close', () => reader.destroy());

const selaOptions: SelaOptions = { url: '/story.fb2', format: 'fb2', language: 'auto', ui: 'app', palette: 'forest', metadata: {author: 'An author', year: '2026'} };
new Sela(selaOptions).open().then(async instance => { const metadata = await instance.getMetadata(); console.log(metadata.author); return instance.showTools(); });
