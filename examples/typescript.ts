import Sela, { type SelaOptions } from '../dist/js/sela.esm.js';
const options: SelaOptions = {
  pdfUrl: '/api/ebooks/42',
  mode: 'book',
  assetBase: 'https://cdn.jsdelivr.net/gh/bobbyfch/sela@v0.9.0-beta.7/dist/',
  onPageChange: ({ page }) => console.log(page)
};
const viewer = new Sela(options);
await viewer.open();
// Call viewer.destroy() when your component/route unmounts.
