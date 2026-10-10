import { FILTERS } from './appearance.js';

export const MODES = ['book', 'single', 'scroll', 'webtoon', 'manga'];
export function readingPreferences(value = {}) {
  const result = {};
  if (!value || typeof value !== 'object') return result;
  if (MODES.includes(value.mode)) result.mode = value.mode;
  if (['page', 'width', 'original'].includes(value.fit)) result.fit = value.fit;
  if (Object.prototype.hasOwnProperty.call(FILTERS, value.filter)) result.filter = value.filter;
  for (const [key, min, max] of [['brightness', .35, 1.25], ['fontSize', 12, 36], ['lineHeight', 1.2, 2.4], ['textMargin', 0, 64], ['cropMargin', 0, 15]]) {
    if (typeof value[key] === 'number' && Number.isFinite(value[key])) result[key] = Math.min(max, Math.max(min, value[key]));
  }
  for (const key of ['dim', 'paperTexture', 'lowPower']) if (typeof value[key] === 'boolean') result[key] = value[key];
  if (['serif', 'sans', 'mono'].includes(value.fontFamily)) result.fontFamily = value.fontFamily;
  if (['start', 'justify'].includes(value.textAlign)) result.textAlign = value.textAlign;
  return result;
}
export function readStored(key, fallback = {}) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
export function storePreferences(key, value) {
  try { localStorage.setItem(key, JSON.stringify(readingPreferences(value))); return true; } catch { return false; }
}

// A DOM text position stays useful after reflow. This is a Sela locator, not EPUB CFI.
export function captureTextPosition(container) {
  const rootTop = container.getBoundingClientRect().top;
  const sections = [...container.querySelectorAll('.flippy-epub-chapter')].filter(el => !el.hidden);
  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    const article = section.shadowRoot?.querySelector('article');
    if (!article || section.getBoundingClientRect().bottom <= rootTop + 2) continue;
    const blocks = [...article.querySelectorAll('p,h1,h2,h3,h4,li,blockquote,pre')];
    const block = blocks.findIndex(el => el.getBoundingClientRect().bottom > rootTop + 2);
    if (block >= 0) {
      const rect = blocks[block].getBoundingClientRect();
      return { page: Number(section.dataset.page) || 1, block, fraction: Math.max(0, Math.min(1, (rootTop - rect.top) / Math.max(1, rect.height))) };
    }
  }
  return { page: 1, ratio: container.scrollTop / Math.max(1, container.scrollHeight - container.clientHeight) };
}
export function restoreTextPosition(container, location) {
  if (!location || typeof location !== 'object') return;
  const section = container.querySelector(`[data-page="${Math.max(1, Math.trunc(location.page) || 1)}"]`);
  const blocks = section?.shadowRoot?.querySelectorAll('article p,article h1,article h2,article h3,article h4,article li,article blockquote,article pre');
  const block = Number.isInteger(location.block) && location.block >= 0 ? blocks?.[location.block] : null;
  if (block) container.scrollTop += block.getBoundingClientRect().top - container.getBoundingClientRect().top + Math.max(0, Math.min(1, location.fraction || 0)) * block.getBoundingClientRect().height;
  else if (Number.isFinite(location.ratio)) container.scrollTop = Math.max(0, Math.min(1, location.ratio)) * (container.scrollHeight - container.clientHeight);
}
export function applyTypography(container, options) {
  const location = captureTextPosition(container);
  container.style.setProperty('--flippy-text-size', `${options.fontSize || 19}px`);
  container.style.setProperty('--sela-line-height', String(options.lineHeight || 1.8));
  container.style.setProperty('--sela-text-font', {serif:'Georgia,serif',sans:'system-ui,sans-serif',mono:'ui-monospace,monospace'}[options.fontFamily] || 'Georgia,serif');
  container.style.setProperty('--sela-text-align', options.textAlign || 'start');
  container.style.paddingInline = `${options.textMargin ?? 28}px`;
  restoreTextPosition(container, location);
}
