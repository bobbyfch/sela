import type { BookMetadata } from '../../../../../src/public-api.ts';

export type ReaderPageAccess = {
  book?: { pdf?: { getPage?: (page: number) => Promise<any> } } | null;
  currentPage: () => number;
};

export async function captureReaderPage(reader: ReaderPageAccess): Promise<HTMLCanvasElement> {
  const documentProxy = reader.book?.pdf;
  if (!documentProxy?.getPage) throw new Error('Page images are available for PDF books. Use a quote card for text books.');
  const page = await documentProxy.getPage(reader.currentPage());
  const source = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: Math.min(2, 1000 / source.width, 1300 / source.height) });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(viewport.width)); canvas.height = Math.max(1, Math.ceil(viewport.height));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Page image export is unavailable in this browser.');
  const task = page.render({ canvasContext: context, viewport });
  await task.promise;
  return canvas;
}

type CardInput = { quote?: string; metadata?: BookMetadata; page?: number; pageImage?: HTMLCanvasElement | null };
export async function createReadingCard({ quote = '', metadata = {}, page = 1, pageImage = null }: CardInput): Promise<Blob> {
  const app = document.querySelector<HTMLElement>('.sela-app') || document.documentElement;
  const styles = getComputedStyle(app);
  const paper = styles.getPropertyValue('--color-paper-raised').trim() || '#f4f0e7';
  const soft = styles.getPropertyValue('--color-accent-soft').trim() || '#e6e0d2';
  const ink = styles.getPropertyValue('--color-ink').trim() || '#292720';
  const accent = styles.getPropertyValue('--color-accent').trim() || '#6c624d';
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image export is unavailable in this browser.');
  const gradient = context.createLinearGradient(0, 0, 1080, 1350); gradient.addColorStop(0, paper); gradient.addColorStop(1, soft);
  context.fillStyle = gradient; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = accent; context.font = '600 18px system-ui'; context.fillText('A MOMENT OF READING', 84, 94); context.fillRect(84, 122, 50, 3);

  const wrap = (value: string, font: string, width: number, maxLines: number) => {
    context.font = font; const lines: string[] = []; let line = '';
    for (const word of value.trim().split(/\s+/)) {
      let part = '';
      for (const character of word) { if (context.measureText(part + character).width > width && part) { lines.push(part); part = ''; } part += character; }
      if (!part) continue;
      if (context.measureText(`${line} ${part}`.trim()).width > width && line) { lines.push(line); line = part; } else line = `${line} ${part}`.trim();
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) { lines.length = maxLines; let last = lines[maxLines - 1]; while (last.length > 1 && context.measureText(`${last}…`).width > width) last = last.slice(0, -1); lines[maxLines - 1] = `${last}…`; }
    return lines;
  };

  if (pageImage) {
    const scale = Math.min(912 / pageImage.width, 880 / pageImage.height); const width = pageImage.width * scale; const height = pageImage.height * scale;
    context.save(); context.shadowColor = 'rgba(32, 35, 29, .16)'; context.shadowBlur = 35; context.drawImage(pageImage, (1080 - width) / 2, 165, width, height); context.restore();
  } else {
    const passage = quote.trim().slice(0, 800); if (!passage) throw new Error('Add a short passage first.');
    const size = passage.length > 450 ? 37 : passage.length > 220 ? 44 : 54;
    const lines = wrap(passage, `${size}px Georgia, serif`, 912, Math.floor(730 / (size * 1.45)));
    context.fillStyle = accent; context.font = '120px Georgia,serif'; context.fillText('“', 78, 252);
    context.fillStyle = ink; context.font = `${size}px Georgia,serif`;
    const startY = Math.max(270, 660 - lines.length * size * 0.7); lines.forEach((value, index) => context.fillText(value, 84, startY + index * size * 1.45));
  }

  context.fillStyle = accent; context.font = '600 30px Georgia,serif';
  wrap(metadata.title || 'Untitled', '600 30px Georgia,serif', 912, 2).forEach((line, index) => context.fillText(line, 84, 1110 + index * 38));
  context.fillStyle = ink; context.font = '22px system-ui';
  const author = [metadata.author || 'Author not provided', metadata.year].filter(Boolean).join(' · ');
  wrap(author, '22px system-ui', 912, 2).forEach((line, index) => context.fillText(line, 84, 1200 + index * 29));
  context.fillStyle = accent; context.font = '18px system-ui'; context.fillText(`p. ${Math.max(1, Math.trunc(page) || 1)}`, 84, 1290);
  context.textAlign = 'right'; context.fillText('Sela Books', 996, 1290);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG export failed.')), 'image/png'));
}
