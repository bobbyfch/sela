import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
import type { PackFaith, TextSection, TextVerse, TextWork } from '../app/library/content-packs.ts';

type PackSpec = {
  id: string;
  file: string;
  faiths: PackFaith[];
  category: string;
  language: string;
  title: { id: string; en: string };
  description: { id: string; en: string };
  edition: string;
  status: 'complete';
  source: { label: string; url: string }[];
  license: { code: string; name: string; noticePath: string };
  works: () => Promise<TextWork[]>;
};

const agent = { 'User-Agent': 'Mozilla/5.0 (Sela importer)' };
const only = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const dryRun = process.argv.includes('--dry-run');

async function fetchBytes(url: string): Promise<Uint8Array> {
  let failure: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { headers: agent });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return new Uint8Array(await response.arrayBuffer());
    } catch (reason) {
      failure = reason;
      await new Promise(resolve => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }
  throw failure;
}
const fetchText = async (url: string) => new TextDecoder('utf-8').decode(await fetchBytes(url)).replace(/\r\n?/g, '\n');

async function pool<T, R>(items: readonly T[], size: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    for (;;) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await work(items[index]);
    }
  }));
  return results;
}

const slug = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 38).replace(/-+$/, '') || 'x';
const titleCase = (text: string) => text.toLowerCase().replace(/(^|[\s(-])([a-zà-ÿ])/g, (_, lead, letter) => lead + letter.toUpperCase()).replace(/\b(Of|The|And|To|In|On|A|An|For|Or|At|By|With|From)\b(?!$)/g, word => word.toLowerCase()).replace(/^./, letter => letter.toUpperCase());
const roman = (text: string) => { const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 }; let total = 0; for (let i = 0; i < text.length; i++) { const value = map[text[i]]; total += value < (map[text[i + 1]] ?? 0) ? -value : value; } return total; };

function clean(text: string): string {
  return text
    .replace(/\[Illustration[^\]]*\]/gi, '')
    .replace(/\[Footnote[^\]]*\]/gi, '')
    .replace(/\(\d{1,4}\)/g, '')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/[ \t]+$/gm, '');
}

function paragraphsOf(block: string): string[] {
  return clean(block).split(/\n\s*\n/).map(part => {
    const lines = part.split('\n').filter(line => line.trim());
    if (!lines.length) return '';
    const longest = Math.max(...lines.map(line => line.trim().length));
    const average = lines.reduce((sum, line) => sum + line.trim().length, 0) / lines.length;
    const verse = lines.length > 1 && longest <= 62 && average <= 48;
    return verse ? lines.map(line => line.trim()).join('\n') : lines.map(line => line.trim()).join(' ').replace(/\s{2,}/g, ' ');
  }).filter(part => part.length > 0);
}

async function gutenberg(id: number): Promise<string[]> {
  const text = await fetchText(`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`);
  const start = text.search(/\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\n/);
  const end = text.search(/\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG EBOOK/);
  if (start < 0 || end < 0) throw new Error(`Gutenberg ${id} has no start or end marker`);
  const lines = text.slice(text.indexOf('\n', start) + 1, end).split('\n');
  const tail = lines.findIndex(line => /^\s*End of (the )?Project Gutenberg/i.test(line));
  return tail < 0 ? lines : lines.slice(0, tail);
}

type Marker = { line: number; kind: string; label: string; group: string };
type Span = Marker & { text: string };

function spans(lines: string[], markers: Marker[], minimum: number, keyOf: (marker: Marker) => string = marker => `${marker.kind}:${marker.group}:${marker.label}`): Span[] {
  const last = new Map<string, Marker>();
  for (const marker of markers) last.set(keyOf(marker), marker);
  const kept = markers.filter(marker => last.get(keyOf(marker)) === marker);
  const out: Span[] = [];
  kept.forEach((marker, index) => {
    const text = lines.slice(marker.line + 1, kept[index + 1]?.line ?? lines.length).join('\n');
    if (text.replace(/\s+/g, ' ').trim().length >= minimum) out.push({ ...marker, text });
  });
  return out;
}

function headAndBody(text: string): { head: string; body: string } {
  const [head, ...rest] = text.replace(/^\s+/, '').split(/\n\s*\n/);
  return { head: (head ?? '').replace(/\s*\n\s*/g, ' ').trim(), body: rest.join('\n\n') };
}

const sectionOf = (id: string, title: string, text: string): TextSection => ({ id, title, paragraphs: paragraphsOf(text) });
const finish = (works: TextWork[]) => works.filter(work => work.sections.length && work.sections.every(section => (section.paragraphs?.length ?? 0) + (section.verses?.length ?? 0) > 0));

async function imitation(): Promise<TextWork[]> {
  const lines = await gutenberg(1653);
  const names: Record<string, number> = { FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4 };
  const markers: Marker[] = [];
  let book = '';
  lines.forEach((line, i) => {
    const text = line.trim();
    const bookMatch = text.match(/^THE (FIRST|SECOND|THIRD|FOURTH) BOOK$/);
    if (bookMatch) { book = String(names[bookMatch[1]]); markers.push({ line: i, kind: 'book', label: book, group: '' }); }
    const chapter = text.match(/^CHAPTER ([IVXL]+)$/);
    if (chapter) markers.push({ line: i, kind: 'chapter', label: String(roman(chapter[1])), group: book });
  });
  const works: TextWork[] = [];
  const subtitles = new Map<string, string>();
  for (const marker of spans(lines, markers, 0)) if (marker.kind === 'book') subtitles.set(marker.label, titleCase(headAndBody(marker.text).head));
  for (const marker of spans(lines, markers, 150)) {
    if (marker.kind !== 'chapter') continue;
    let work = works.find(item => item.id === `book-${marker.group}`);
    if (!work) { work = { id: `book-${marker.group}`, title: `Book ${marker.group}`, subtitle: subtitles.get(marker.group), author: 'Thomas à Kempis', sections: [] }; works.push(work); }
    const { head, body } = headAndBody(marker.text);
    work.sections.push(sectionOf(`chapter-${marker.label}`, `Chapter ${marker.label}: ${head.replace(/\.$/, '')}`, body));
  }
  return finish(works);
}

async function confessions(): Promise<TextWork[]> {
  const lines = await gutenberg(3296);
  const markers: Marker[] = [];
  lines.forEach((line, i) => { const book = line.trim().match(/^BOOK ([IVXL]+)$/); if (book) markers.push({ line: i, kind: 'book', label: String(roman(book[1])), group: '' }); });
  const sections = spans(lines, markers, 400).map(marker => sectionOf(`book-${marker.label}`, `Book ${marker.label}`, marker.text));
  return finish([{ id: 'confessions', title: 'The Confessions of St. Augustine', author: 'Augustine of Hippo', sections }]);
}

function sequentialRoman(lines: string[]): Marker[] {
  const heading = /^[\p{Lu}0-9 ,'’!?:;.\-]{3,90}$/u;
  const candidates = new Map<number, { line: number; inline: string }[]>();
  lines.forEach((line, i) => {
    const match = line.trim().match(/^([IVXLC]+)\.?(?:\s+(.+))?$/);
    if (!match) return;
    const inline = match[2]?.trim() ?? '';
    const next = inline || lines.slice(i + 1).find(candidate => candidate.trim())?.trim() || '';
    if (!heading.test(next) || !/\p{Lu}{3}/u.test(next)) return;
    const number = roman(match[1]);
    candidates.set(number, [...(candidates.get(number) ?? []), { line: i, inline }]);
  });
  const picked: Marker[] = [];
  let before = Infinity;
  for (let number = Math.max(0, ...candidates.keys()); number >= 1; number--) {
    const choice = (candidates.get(number) ?? []).filter(candidate => candidate.line < before).pop();
    if (!choice) break;
    picked.unshift({ line: choice.line, kind: 'item', label: String(number), group: choice.inline });
    before = choice.line;
  }
  return picked;
}

const itemParts = (marker: Span) => marker.group ? { head: marker.group, body: marker.text } : headAndBody(marker.text);

async function gospelOfBuddha(): Promise<TextWork[]> {
  const lines = await gutenberg(35895);
  const sections = spans(lines, sequentialRoman(lines), 300).map(marker => { const { head, body } = itemParts(marker); const section = sectionOf(`chapter-${marker.label}`, `${marker.label}. ${titleCase(head.replace(/[.!]$/, ''))}`, body); section.paragraphs = section.paragraphs?.map(paragraph => paragraph.replace(/\s\d{1,3}$/, '')); return section; });
  return finish([{ id: 'gospel-of-buddha', title: 'The Gospel of Buddha', author: 'Paul Carus', sections }]);
}

async function moreJataka(): Promise<TextWork[]> {
  const lines = await gutenberg(7518);
  const sections = spans(lines, sequentialRoman(lines), 400).map(marker => { const { head, body } = itemParts(marker); return sectionOf(`story-${marker.label}`, titleCase(head), body); });
  return finish([{ id: 'more-jataka-tales', title: 'More Jataka Tales', author: 'Ellen C. Babbitt', sections }]);
}

async function jatakaTales(): Promise<TextWork[]> {
  const lines = await gutenberg(62514);
  const titles: string[] = [];
  let tocEnd = 0;
  lines.slice(0, 200).forEach((line, i) => { const match = line.match(/^\s+([IVXLC]+)\s+(.+?)\s{2,}\d+\s*$/); if (match) { titles.push(match[2].trim()); tocEnd = i; } });
  const markers: Marker[] = [];
  let cursor = tocEnd + 1;
  titles.forEach((title, index) => {
    const at = lines.findIndex((line, i) => i >= cursor && line.trim() === title);
    if (at >= 0) { markers.push({ line: at, kind: 'story', label: String(index + 1), group: '' }); cursor = at + 1; }
  });
  const sections = spans(lines, markers, 400).map(marker => sectionOf(`story-${marker.label}`, titleCase(titles[Number(marker.label) - 1]), marker.text));
  return finish([{ id: 'jataka-tales', title: 'Jataka Tales', author: 'Ellen C. Babbitt', sections }]);
}

async function yogaSutras(): Promise<TextWork[]> {
  const lines = await gutenberg(2526);
  const markers: Marker[] = [];
  lines.forEach((line, i) => { const match = line.trim().match(/^BOOK ([IV]+)$/); if (match) markers.push({ line: i, kind: 'book', label: String(roman(match[1])), group: '' }); });
  const sections = spans(lines, markers, 1500).map(marker => sectionOf(`book-${marker.label}`, `Book ${marker.label}`, marker.text));
  return finish([{ id: 'yoga-sutras', title: 'The Yoga Sutras of Patanjali', subtitle: 'The Book of the Spiritual Man', author: 'Patañjali, translated by Charles Johnston', sections }]);
}

async function ramayan(): Promise<TextWork[]> {
  const lines = await gutenberg(24869);
  const markers: Marker[] = [];
  let book = '';
  lines.forEach((line, i) => {
    const text = line.trim();
    const bookMatch = text.match(/^(?:BOOK|Book) ([IVX]+)\.(?:\(\d+\))?$/);
    if (bookMatch) { book = String(roman(bookMatch[1])); markers.push({ line: i, kind: 'book', label: book, group: '' }); }
    const canto = text.match(/^Canto ([IVXLC]+)\.\s*(.*?)(?:\(\d+\))?$/);
    if (canto) markers.push({ line: i, kind: 'canto', label: String(roman(canto[1])), group: book });
  });
  const works: TextWork[] = [];
  for (const marker of spans(lines, markers, 400)) {
    if (marker.kind !== 'canto') continue;
    let work = works.find(item => item.id === `book-${marker.group}`);
    if (!work) { work = { id: `book-${marker.group}`, title: `Book ${marker.group}`, author: 'Válmíki, translated by Ralph T. H. Griffith', sections: [] }; works.push(work); }
    const title = lines[marker.line].trim().replace(/^Canto [IVXLC]+\.\s*/, '').replace(/\(\d+\)$/, '').replace(/\.$/, '');
    work.sections.push(sectionOf(`canto-${marker.label}`, `Canto ${marker.label}: ${title}`, marker.text));
  }
  return finish(works);
}

async function upanishads(): Promise<TextWork[]> {
  const lines = await gutenberg(3283);
  const at = (min: number, text: string) => lines.findIndex((line, i) => i > min && line.trim() === text);
  const isa = at(200, 'Isa-Upanishad');
  const katha = at(isa + 100, 'Katha-Upanishad');
  const kena = at(katha + 100, 'Kena-Upanishad');
  if (isa < 0 || katha < 0 || kena < 0) throw new Error('Upanishads markers not found');
  const parts = (from: number, to: number, prefix: string): TextSection[] => {
    const marks: Marker[] = [];
    for (let i = from; i < to; i++) { const match = lines[i].trim().match(/^Part (First|Second|Third|Fourth|Fifth|Sixth)$/i); if (match) marks.push({ line: i, kind: 'part', label: match[1].toLowerCase(), group: '' }); }
    return marks.map((mark, index) => sectionOf(`${prefix}-part-${index + 1}`, `Part ${titleCase(mark.label)}`, lines.slice(mark.line + 1, marks[index + 1]?.line ?? to).join('\n'))).filter(section => (section.paragraphs?.length ?? 0) > 0);
  };
  const end = lines.findIndex(line => /^THE FULL PROJECT GUTENBERG/.test(line.trim()));
  return finish([
    { id: 'isa', title: 'Isa Upanishad', author: 'Translated and commentated by Swami Paramananda', sections: [sectionOf('whole', 'The Isa Upanishad', lines.slice(isa + 1, katha).join('\n'))] },
    { id: 'katha', title: 'Katha Upanishad', author: 'Translated and commentated by Swami Paramananda', sections: parts(katha, kena, 'katha') },
    { id: 'kena', title: 'Kena Upanishad', author: 'Translated and commentated by Swami Paramananda', sections: parts(kena, end < 0 ? lines.length : end, 'kena') },
  ]);
}

async function taoTehKing(): Promise<TextWork[]> {
  const lines = await gutenberg(216);
  const partTwo = lines.findIndex(line => line.trim() === 'PART II.');
  const marks: { line: number; chapter: number }[] = [];
  let expected = 1;
  let lastVerse = 0;
  lines.forEach((line, i) => {
    const text = line.trim();
    const chapter = text.match(/^(?:Ch\. )?(\d{1,2})\.\s+(1\.\s+)?\S/);
    const bare = text.match(/^(\d{1,2})\.\s*$/);
    const number = Number(chapter?.[1] ?? bare?.[1]);
    if (!number) return;
    if (number === expected && (chapter?.[2] || number !== lastVerse + 1)) { marks.push({ line: i, chapter: expected }); expected++; lastVerse = 1; return; }
    if (number === lastVerse + 1) lastVerse = number;
  });
  if (marks.length !== 81) throw new Error(`Tao Teh King: found ${marks.length} chapters`);
  const section = (mark: { line: number; chapter: number }, index: number): TextSection => {
    const upto = marks[index + 1]?.line ?? lines.findIndex(line => /^End of the Project|^\*\*\*/.test(line.trim())) ?? lines.length;
    const body = lines.slice(mark.line, upto < 0 ? lines.length : upto).join('\n').replace(/^\s*(?:Ch\. )?\d{1,2}\.\s+(?:1\.\s+)?/, '');
    return sectionOf(`chapter-${mark.chapter}`, `Chapter ${mark.chapter}`, body);
  };
  const all = marks.map(section);
  const first = all.filter((_, index) => marks[index].line < partTwo);
  const second = all.filter((_, index) => marks[index].line >= partTwo);
  return finish([
    { id: 'part-1', title: 'Part I: The Tao', subtitle: 'Chapters 1 to 37', author: 'Laozi, translated by James Legge', sections: first },
    { id: 'part-2', title: 'Part II: The Characteristics of the Tao', subtitle: 'Chapters 38 to 81', author: 'Laozi, translated by James Legge', sections: second },
  ]);
}

async function wikisourceLegge(page: string, workId: string, title: string, revisionNote: string[]): Promise<TextWork[]> {
  const url = `https://en.wikisource.org/w/api.php?action=query&prop=revisions&rvprop=content|ids&rvslots=main&format=json&formatversion=2&titles=${encodeURIComponent(page)}`;
  const data = JSON.parse(await fetchText(url));
  const revision = data.query.pages[0].revisions[0];
  revisionNote.push(`${page}: revision ${revision.revid}`);
  const wikitext: string = revision.slots.main.content;
  const body = wikitext.replace(/\{\{header[\s\S]*?\n\}\}/, '').replace(/\{\{translation license[\s\S]*$/, '');
  const sections: { zh: boolean; text: string }[] = [];
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('{{lang|zh|')) { sections.push({ zh: true, text: '' }); continue; }
    const text = line.replace(/<[^>]+>/g, '').replace(/'''?/g, '').replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').replace(/\{\{[^}]*\}\}/g, '').trim();
    if (!text || text === title) continue;
    const last = sections[sections.length - 1];
    if (last?.zh) last.text += (last.text ? '\n\n' : '') + text;
    else if (last) last.text += '\n\n' + text;
  }
  const chapters = sections.filter(section => section.zh && section.text.trim().length > 20).map((section, index) => sectionOf(`chapter-${index + 1}`, `Part ${index + 1}`, section.text));
  return finish([{ id: workId, title, author: 'Translated by James Legge', sections: chapters }]);
}

const SUTTA_COMMIT = 'fdb7ff39a8cc31baa53c879866588992df00bc91';
type TreeEntry = { path: string; type: string };
let treeCache: TreeEntry[] | null = null;
async function suttaTree(): Promise<TreeEntry[]> {
  if (treeCache) return treeCache;
  const data = JSON.parse(await fetchText(`https://api.github.com/repos/suttacentral/bilara-data/git/trees/${SUTTA_COMMIT}?recursive=1`));
  if (data.truncated) throw new Error('bilara-data tree is truncated');
  treeCache = data.tree as TreeEntry[];
  return treeCache;
}

function naturalKey(text: string): (string | number)[] {
  return text.split(/(\d+)/).map(part => /^\d+$/.test(part) ? Number(part) : part);
}
function naturalCompare(a: string, b: string): number {
  const x = naturalKey(a), y = naturalKey(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if (x[i] === y[i]) continue;
    if (x[i] === undefined) return -1;
    if (y[i] === undefined) return 1;
    return typeof x[i] === 'number' && typeof y[i] === 'number' ? Number(x[i]) - Number(y[i]) : String(x[i]) < String(y[i]) ? -1 : 1;
  }
  return 0;
}

async function suttas(folder: string, workId: string, title: string, author: string, suffix: string, label: (uid: string) => string): Promise<TextWork> {
  const tree = await suttaTree();
  const files = tree.filter(entry => entry.type === 'blob' && entry.path.startsWith(folder) && entry.path.endsWith(`_${suffix}.json`)).map(entry => entry.path).sort((a, b) => naturalCompare(a.split('/').pop()!, b.split('/').pop()!));
  if (!files.length) throw new Error(`No sutta files under ${folder}`);
  const sections = await pool(files, 8, async path => {
    const uid = path.split('/').pop()!.replace(`_${suffix}.json`, '');
    const segments = JSON.parse(await fetchText(`https://raw.githubusercontent.com/suttacentral/bilara-data/${SUTTA_COMMIT}/${path}`)) as Record<string, string>;
    const heads: string[] = [];
    const blocks = new Map<string, string>();
    for (const [key, value] of Object.entries(segments)) {
      const position = key.slice(key.indexOf(':') + 1);
      const text = value.replace(/\s+/g, ' ');
      if (position.startsWith('0.')) { if (text.trim()) heads.push(text.trim()); continue; }
      const block = position.slice(0, position.lastIndexOf('.'));
      blocks.set(block, (blocks.get(block) ?? '') + text);
    }
    const name = (heads.length > 1 ? heads[heads.length - 1] : heads[0] ?? uid).replace(/^\d+\.\s*/, '');
    const paragraphs = [...blocks.values()].map(text => text.replace(/\s+/g, ' ').trim()).filter(Boolean);
    return { id: slug(uid), title: `${label(uid)} · ${name}`, paragraphs } as TextSection;
  });
  return { id: workId, title, author, sections: sections.filter(section => (section.paragraphs?.length ?? 0) > 0) };
}

const upper = (uid: string) => uid.replace(/^([a-z]+)/, prefix => prefix.toUpperCase()).replace(/^(SA)(\d)/, '$1 $2').replace(/^([A-Z]+)(\d)/, '$1 $2');

const USFM_NAMES: Record<string, string> = {};

async function tsiBible(): Promise<TextWork[]> {
  const archive = unzipSync(await fetchBytes('https://ebible.org/Scriptures/ind_usfm.zip'));
  const works: { order: number; work: TextWork }[] = [];
  const canonical = ['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'];
  for (const [name, bytes] of Object.entries(archive)) {
    if (!/\.(usfm|sfm)$/i.test(name)) continue;
    const text = strFromU8(bytes).replace(/\r\n?/g, '\n');
    const code = text.match(/^\\id\s+([A-Z0-9]{3})/m)?.[1];
    if (!code || !canonical.includes(code)) continue;
    const bookName = (text.match(/^\\toc2\s+(.+)$/m) ?? text.match(/^\\h\s+(.+)$/m) ?? text.match(/^\\toc1\s+(.+)$/m))?.[1].trim() ?? code;
    USFM_NAMES[code] = bookName;
    const sections: TextSection[] = [];
    let chapter: { number: string; verses: TextVerse[] } | null = null;
    let verse: TextVerse | null = null;
    const flush = () => { if (chapter && chapter.verses.length) sections.push({ id: `chapter-${chapter.number}`, title: `${bookName} ${chapter.number}`, verses: chapter.verses }); };
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      const c = line.match(/^\\c\s+(\d+)/);
      if (c) { flush(); chapter = { number: c[1], verses: [] }; verse = null; continue; }
      if (!chapter) continue;
      const v = line.match(/^\\v\s+(\d+(?:[-–]\d+)?[a-z]?)\s*(.*)$/);
      const content = (v ? v[2] : /^\\(p|q\d?|m|pi\d?|li\d?|b|nb|d|qa|qr|qc|mi|pmo|pm|pmc|pmr|qm\d?|ph\d?|r|s\d?|ms\d?|mr|sp|cl|cp|cd|tr|th\d?|tc\d?)\b/.test(line) || !line.startsWith('\\') ? line.replace(/^\\[a-z0-9]+\s*/, '') : '');
      const heading = /^\\(r|s\d?|ms\d?|mr|sp|cl|cp|cd|d)\b/.test(line);
      if (v) { verse = { n: v[1], text: '' }; chapter.verses.push(verse); }
      if (heading || !verse) continue;
      const plain = (v ? v[2] : content).replace(/\\f\s.*?\\f\*/g, '').replace(/\\x\s.*?\\x\*/g, '').replace(/\\(?:w|wj|nd|add|bk|dc|k|pn|qt|sc|sig|tl|ord|fig)\*?\s?/g, '').replace(/\|[^\\]*?(?=\\|\s|$)/g, '').replace(/\\[a-z0-9]+\*/g, '').replace(/\\[a-z0-9]+\s?/g, '').replace(/\s+/g, ' ').trim();
      if (plain) verse.text = verse.text ? `${verse.text} ${plain}` : plain;
    }
    flush();
    const cleaned = sections.map(section => ({ ...section, verses: section.verses!.filter(item => item.text) })).filter(section => section.verses.length);
    if (cleaned.length) works.push({ order: canonical.indexOf(code), work: { id: code.toLowerCase(), title: bookName, sections: cleaned } });
  }
  return works.sort((a, b) => a.order - b.order).map(item => item.work);
}

const notice = (title: string, body: string[]) => `# ${title}\n\n${body.join('\n\n')}\n`;
const gutenbergNotice = (works: string[]) => notice('Project Gutenberg public-domain texts', [
  'These readings are public-domain works distributed by Project Gutenberg. The Project Gutenberg header, footer and trademark text were removed, as its licence allows for public-domain works. Spelling and wording are unchanged. Paragraph breaks were rejoined and chapter headings were used to split each work into sections.',
  `Works in this pack: ${works.join('; ')}.`,
  'Public domain status is stated for the United States. Check your local law before reusing these texts outside Sela.',
  'SELA code is MIT licensed. That licence does not apply to these texts.',
]);

const specs: PackSpec[] = [
  {
    id: 'sela-tsi-id', file: 'tsi-id-v1.json', faiths: ['protestantism'], category: 'scripture', language: 'id',
    title: { id: 'Alkitab TSI (Terjemahan Sederhana Indonesia)', en: 'Indonesian Bible (TSI)' },
    description: { id: 'Perjanjian Baru lengkap dan 21 kitab Perjanjian Lama dalam bahasa Indonesia yang sederhana. Teks tidak diubah.', en: 'The complete New Testament and 21 Old Testament books in plain Indonesian. The text is unchanged.' },
    edition: 'Edisi Ketiga 2025', status: 'complete',
    source: [{ label: 'eBible.org · Alkitab TSI', url: 'https://ebible.org/find/details.php?id=ind' }, { label: 'Albata', url: 'https://alkitab.mobi/tsi' }],
    license: { code: 'CC-BY-SA-4.0', name: 'CC BY-SA 4.0 · Albata dan Pioneer Bible Translators', noticePath: 'licenses/sela-tsi-NOTICE.md' },
    works: tsiBible,
  },
  {
    id: 'sela-christian-classics-en', file: 'christian-classics-en-v1.json', faiths: ['protestantism', 'catholicism'], category: 'classics', language: 'en',
    title: { id: 'Karya klasik Kristen', en: 'Christian classics' },
    description: { id: 'The Imitation of Christ karya Thomas à Kempis dan The Confessions karya Augustinus dari Hippo, dalam bahasa Inggris.', en: 'The Imitation of Christ by Thomas à Kempis and The Confessions of St. Augustine.' },
    edition: 'Project Gutenberg 1653, 3296', status: 'complete',
    source: [{ label: 'Project Gutenberg #1653', url: 'https://www.gutenberg.org/ebooks/1653' }, { label: 'Project Gutenberg #3296', url: 'https://www.gutenberg.org/ebooks/3296' }],
    license: { code: 'PD-US', name: 'Domain publik (Amerika Serikat)', noticePath: 'licenses/sela-gutenberg-christian-NOTICE.md' },
    works: async () => [...await imitation(), ...await confessions()],
  },
  {
    id: 'sela-suttas-en', file: 'suttas-en-v1.json', faiths: ['buddhism'], category: 'scripture', language: 'en',
    title: { id: 'Sutta Pali pilihan (Sujato)', en: 'Selected Pali suttas (Sujato)' },
    description: { id: 'Digha Nikaya, Majjhima Nikaya, Sutta Nipata, Udana, Itivuttaka, Khuddakapatha, Theragatha, dan Therigatha dalam terjemahan Bhikkhu Sujato.', en: 'The Digha Nikaya, Majjhima Nikaya, Sutta Nipata, Udana, Itivuttaka, Khuddakapatha, Theragatha and Therigatha in Bhikkhu Sujato’s translation.' },
    edition: `SuttaCentral ${SUTTA_COMMIT.slice(0, 7)}`, status: 'complete',
    source: [{ label: 'SuttaCentral bilara-data (published)', url: 'https://github.com/suttacentral/bilara-data/tree/published' }, { label: 'SuttaCentral', url: 'https://suttacentral.net/' }],
    license: { code: 'CC0-1.0', name: 'CC0 1.0 · Bhikkhu Sujato', noticePath: 'licenses/sela-suttas-NOTICE.md' },
    works: async () => Promise.all([
      suttas('translation/en/sujato/sutta/dn/', 'digha-nikaya', 'Digha Nikaya', 'Long Discourses', 'translation-en-sujato', upper),
      suttas('translation/en/sujato/sutta/mn/', 'majjhima-nikaya', 'Majjhima Nikaya', 'Middle Discourses', 'translation-en-sujato', upper),
      suttas('translation/en/sujato/sutta/kn/snp/', 'sutta-nipata', 'Sutta Nipata', 'Anthology of Discourses', 'translation-en-sujato', upper),
      suttas('translation/en/sujato/sutta/kn/ud/', 'udana', 'Udana', 'Heartfelt Sayings', 'translation-en-sujato', upper),
      suttas('translation/en/sujato/sutta/kn/iti/', 'itivuttaka', 'Itivuttaka', 'So It Was Said', 'translation-en-sujato', upper),
      suttas('translation/en/sujato/sutta/kn/kp/', 'khuddakapatha', 'Khuddakapatha', 'Basic Passages', 'translation-en-sujato', upper),
      suttas('translation/en/sujato/sutta/kn/thag/', 'theragatha', 'Theragatha', 'Verses of the Senior Monks', 'translation-en-sujato', upper),
      suttas('translation/en/sujato/sutta/kn/thig/', 'therigatha', 'Therigatha', 'Verses of the Senior Nuns', 'translation-en-sujato', upper),
    ]),
  },
  {
    id: 'sela-sa-id', file: 'samyukta-agama-id-v1.json', faiths: ['buddhism'], category: 'scripture', language: 'id',
    title: { id: 'Kotbah-kotbah Berkelompok (Samyukta Agama)', en: 'Linked Discourses (Samyukta Agama), Indonesian' },
    description: { id: 'Sebelas sutra pertama Samyukta Agama dalam bahasa Indonesia, terjemahan Seniya, dari SuttaCentral.', en: 'The first eleven suttas of the Samyukta Agama in Indonesian, translated by Seniya, from SuttaCentral.' },
    edition: `SuttaCentral ${SUTTA_COMMIT.slice(0, 7)}`, status: 'complete',
    source: [{ label: 'SuttaCentral bilara-data (published)', url: 'https://github.com/suttacentral/bilara-data/tree/published/translation/id/seniya' }],
    license: { code: 'CC0-1.0', name: 'CC0 1.0 · Seniya', noticePath: 'licenses/sela-suttas-NOTICE.md' },
    works: async () => [await suttas('translation/id/seniya/sutta/sa/', 'samyukta-agama', 'Samyukta Agama', 'Seniya', 'translation-id-seniya', upper)],
  },
  {
    id: 'sela-buddhist-stories-en', file: 'buddhist-stories-en-v1.json', faiths: ['buddhism'], category: 'stories', language: 'en',
    title: { id: 'Kisah Buddha: Jataka dan Injil Buddha', en: 'Buddhist stories: Jataka tales and the Gospel of Buddha' },
    description: { id: 'Jataka Tales dan More Jataka Tales karya Ellen C. Babbitt, serta The Gospel of Buddha karya Paul Carus.', en: 'Jataka Tales and More Jataka Tales by Ellen C. Babbitt, and The Gospel of Buddha by Paul Carus.' },
    edition: 'Project Gutenberg 62514, 7518, 35895', status: 'complete',
    source: [{ label: 'Project Gutenberg #62514', url: 'https://www.gutenberg.org/ebooks/62514' }, { label: 'Project Gutenberg #7518', url: 'https://www.gutenberg.org/ebooks/7518' }, { label: 'Project Gutenberg #35895', url: 'https://www.gutenberg.org/ebooks/35895' }],
    license: { code: 'PD-US', name: 'Domain publik (Amerika Serikat)', noticePath: 'licenses/sela-gutenberg-buddhist-NOTICE.md' },
    works: async () => [...await jatakaTales(), ...await moreJataka(), ...await gospelOfBuddha()],
  },
  {
    id: 'sela-hindu-classics-en', file: 'hindu-classics-en-v1.json', faiths: ['hinduism'], category: 'scripture', language: 'en',
    title: { id: 'Karya klasik Hindu', en: 'Hindu classics' },
    description: { id: 'Isa, Katha, dan Kena Upanishad; Yoga Sutra Patanjali; dan Ramayana karya Valmiki dalam bahasa Inggris.', en: 'The Isa, Katha and Kena Upanishads, the Yoga Sutras of Patanjali, and the Ramayana of Valmiki in English.' },
    edition: 'Project Gutenberg 3283, 2526, 24869', status: 'complete',
    source: [{ label: 'Project Gutenberg #3283', url: 'https://www.gutenberg.org/ebooks/3283' }, { label: 'Project Gutenberg #2526', url: 'https://www.gutenberg.org/ebooks/2526' }, { label: 'Project Gutenberg #24869', url: 'https://www.gutenberg.org/ebooks/24869' }],
    license: { code: 'PD-US', name: 'Domain publik (Amerika Serikat)', noticePath: 'licenses/sela-gutenberg-hindu-NOTICE.md' },
    works: async () => [...await upanishads(), ...await yogaSutras(), ...await ramayan()],
  },
  {
    id: 'sela-confucian-classics-en', file: 'confucian-classics-en-v1.json', faiths: ['confucianism'], category: 'classics', language: 'en',
    title: { id: 'Tao Teh King (Laozi)', en: 'Tao Teh King (Laozi)' },
    description: { id: 'Klasik Tiongkok yang sering dibaca bersama tradisi Konghucu, terjemahan James Legge.', en: 'A Chinese classic often read alongside the Confucian tradition, translated by James Legge.' },
    edition: 'Project Gutenberg 216', status: 'complete',
    source: [{ label: 'Project Gutenberg #216', url: 'https://www.gutenberg.org/ebooks/216' }],
    license: { code: 'PD-US', name: 'Domain publik (Amerika Serikat)', noticePath: 'licenses/sela-gutenberg-confucian-NOTICE.md' },
    works: taoTehKing,
  },
  {
    id: 'sela-legge-wikisource-en', file: 'legge-wikisource-en-v1.json', faiths: ['confucianism'], category: 'scripture', language: 'en',
    title: { id: 'Da Xue dan Zhong Yong (Legge)', en: 'The Great Learning and the Doctrine of the Mean (Legge)' },
    description: { id: 'Dua dari Empat Kitab Konghucu dalam terjemahan James Legge, dari transkripsi Wikisource.', en: 'Two of the Four Books of the Confucian tradition in James Legge’s translation, from the Wikisource transcription.' },
    edition: 'Wikisource, The Chinese Classics vol. 1', status: 'complete',
    source: [{ label: 'Wikisource · The Great Learning', url: 'https://en.wikisource.org/wiki/The_Chinese_Classics/Volume_1/The_Great_Learning' }, { label: 'Wikisource · The Doctrine of the Mean', url: 'https://en.wikisource.org/wiki/The_Chinese_Classics/Volume_1/The_Doctrine_of_the_Mean' }],
    license: { code: 'CC-BY-SA-4.0', name: 'CC BY-SA 4.0 · kontributor Wikisource', noticePath: 'licenses/sela-wikisource-legge-NOTICE.md' },
    works: async () => {
      const revisions: string[] = [];
      const works = [
        ...await wikisourceLegge('The Chinese Classics/Volume 1/The Great Learning', 'great-learning', 'The Great Learning', revisions),
        ...await wikisourceLegge('The Chinese Classics/Volume 1/The Doctrine of the Mean', 'doctrine-of-the-mean', 'The Doctrine of the Mean', revisions),
      ];
      process.env.SELA_WIKISOURCE_REVISIONS = revisions.join('; ');
      return works;
    },
  },
];

const notices: Record<string, () => string> = {
  'licenses/sela-tsi-NOTICE.md': () => notice('Alkitab Terjemahan Sederhana Indonesia (TSI), Edisi Ketiga', [
    'Terjemahan Sederhana Indonesia © 2021 oleh Yayasan Alkitab BahasaKita (Albata) dan Pioneer Bible Translators International.',
    'Teks ini tersedia di bawah lisensi Creative Commons Attribution-ShareAlike 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Sumber: https://ebible.org/find/details.php?id=ind (berkas USFM bertanggal 3 Mei 2025).',
    'Perubahan: berkas USFM diubah menjadi JSON, dibagi per kitab dan pasal. Catatan kaki dan judul bagian tidak disertakan. Teks ayat tidak diubah. Albata dan Pioneer Bible Translators tidak mendukung atau mengesahkan perubahan format ini.',
    'Lisensi CC BY-SA berlaku untuk teks ini dan turunannya. Kode SELA berlisensi MIT, dan lisensi itu tidak berlaku untuk teks Alkitab ini.',
  ]),
  'licenses/sela-suttas-NOTICE.md': () => notice('SuttaCentral translations (CC0)', [
    `Teks diambil dari repositori bilara-data cabang published di SuttaCentral, commit ${SUTTA_COMMIT} (https://github.com/suttacentral/bilara-data).`,
    'Terjemahan bahasa Inggris oleh Bhikkhu Sujato (DN, MN, SNP, UD, ITI, KP), Bhikkhu Sujato bersama Jessica Walton (THAG, THIG), dan terjemahan bahasa Indonesia oleh Seniya (Samyukta Agama). Semuanya berlisensi CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/) menurut _publication.json pada commit itu.',
    'Perubahan: segmen dikelompokkan menjadi paragraf per sutta. Kata-kata tidak diubah.',
    'Kode SELA berlisensi MIT.',
  ]),
  'licenses/sela-wikisource-legge-NOTICE.md': () => notice('Legge, The Great Learning and The Doctrine of the Mean (Wikisource)', [
    'Terjemahan James Legge (1861) adalah karya domain publik. Transkripsinya di Wikisource dilisensikan CC BY-SA 4.0 oleh kontributor Wikisource (https://en.wikisource.org/wiki/Wikisource:Copyright_policy).',
    `Revisi yang dipakai: ${process.env.SELA_WIKISOURCE_REVISIONS ?? 'lihat riwayat halaman'}.`,
    'Perubahan: teks Tionghoa, templat, dan catatan dibuang; paragraf bahasa Inggris dikelompokkan per bab. Kata-kata tidak diubah.',
    'Kode SELA berlisensi MIT, dan lisensi itu tidak berlaku untuk teks ini.',
  ]),
  'licenses/sela-gutenberg-christian-NOTICE.md': () => gutenbergNotice(['The Imitation of Christ (Thomas à Kempis), Project Gutenberg #1653', 'The Confessions of St. Augustine, Project Gutenberg #3296']),
  'licenses/sela-gutenberg-buddhist-NOTICE.md': () => gutenbergNotice(['Jataka Tales (Ellen C. Babbitt), #62514', 'More Jataka Tales (Ellen C. Babbitt), #7518', 'The Gospel of Buddha (Paul Carus), #35895']),
  'licenses/sela-gutenberg-hindu-NOTICE.md': () => gutenbergNotice(['The Upanishads (Swami Paramananda), #3283', 'The Yoga Sutras of Patanjali (Charles Johnston), #2526', 'The Rámáyan of Válmíki (Ralph T. H. Griffith), #24869']),
  'licenses/sela-gutenberg-confucian-NOTICE.md': () => gutenbergNotice(['The Tao Teh King (James Legge), #216']),
};

const sizes: string[] = [];
await mkdir('library/packs', { recursive: true });
for (const spec of specs) {
  if (only.length && !only.includes(spec.id)) continue;
  const works = await spec.works();
  const payload = JSON.stringify({ schemaVersion: 1, packId: spec.id, works });
  const sections = works.reduce((sum, work) => sum + work.sections.length, 0);
  sizes.push(`${spec.id}: ${works.length} works, ${sections} sections, ${(payload.length / 1024).toFixed(0)} KB, sha ${createHash('sha256').update(payload).digest('hex').slice(0, 10)}`);
  if (dryRun) { for (const work of works) sizes.push(`  ${work.id}: ${work.sections.length} sections, first "${work.sections[0]?.title}", last "${work.sections[work.sections.length - 1]?.title}"`); continue; }
  await writeFile(`library/packs/${spec.file}`, payload);
  await writeFile(`library/packs/${spec.id}.manifest.json`, JSON.stringify({
    id: spec.id, schemaVersion: 1, kind: 'text-collection', status: spec.status, faiths: spec.faiths, category: spec.category, language: spec.language,
    title: spec.title, description: spec.description, edition: spec.edition, itemCount: works.length, source: spec.source, license: spec.license, payload: { path: spec.file },
  }, null, 2) + '\n');
}
if (!dryRun) for (const [path, build] of Object.entries(notices)) await writeFile(path, build());
console.log(sizes.join('\n'));
