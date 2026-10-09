export const FILTERS = {
  none:'none', grayscale:'grayscale(1)', sepia:'sepia(.7)', contrast:'grayscale(1) contrast(1.4)',
  warm:'sepia(.35) saturate(.8)', cool:'hue-rotate(180deg) saturate(.65)',
  night:'invert(.9) hue-rotate(180deg)', invert:'invert(1)', paper:'sepia(.2) saturate(.7)',
  soft:'contrast(.85) saturate(.7)', saturated:'saturate(1.35)', lowblue:'sepia(.5) saturate(.6)'
};
export const FILTER_LABELS = {
  none:['Original','Asli'],grayscale:['Black & white','Hitam putih'],sepia:['Sepia','Sepia'],
  contrast:['High contrast','Kontras tinggi'],warm:['Warm colors','Warna hangat'],cool:['Cool colors','Warna dingin'],
  night:['Night page','Halaman malam'],invert:['Invert colors','Balik warna'],paper:['Paper','Kertas'],
  soft:['Soft contrast','Kontras lembut'],saturated:['Vivid','Warna kuat'],lowblue:['Amber','Amber']
};
export function brightness(value=1) {
  value=Number(value); if(!Number.isFinite(value))throw new TypeError('brightness must be a finite number');
  return Math.max(.35,Math.min(1.25,value));
}
export function applyAppearance(overlay,options) {
  overlay.style.setProperty('--flippy-page-filter',options.filter==='none'||!options.filter?'brightness(1)':FILTERS[options.filter]);
  overlay.style.setProperty('--sela-brightness',brightness(options.brightness));
  overlay.dataset.dim=String(!!options.dim);
  overlay.dispatchEvent(new Event('sela:appearance'));
}
