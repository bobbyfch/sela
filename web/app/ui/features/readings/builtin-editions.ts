import type { FaithId } from '../../../../../app/library/scripture-sources.ts';

export const BUILTIN_EDITIONS: readonly { faith: FaithId; title: string; edition: string; license: string; source: string; sourceLabel: string; count: { en: string; id: string } }[] = [
  { faith: 'protestantism', title: 'World English Bible', edition: 'World English Bible', license: 'Public domain', source: 'https://ebible.org/engwebp/', sourceLabel: 'eBible.org', count: { en: '66 books · English', id: '66 kitab · Inggris' } },
  { faith: 'catholicism', title: 'Douay-Rheims', edition: 'Douay-Rheims 1899 American Edition', license: 'Public domain', source: 'https://ebible.org/engDRA/', sourceLabel: 'eBible.org', count: { en: '73 books · English', id: '73 kitab · Inggris' } },
  { faith: 'buddhism', title: 'Dhammapada', edition: 'Bhikkhu Sujato', license: 'CC0 1.0', source: 'https://suttacentral.net/licensing', sourceLabel: 'SuttaCentral', count: { en: '26 chapters · English', id: '26 bab · Inggris' } },
  { faith: 'hinduism', title: 'Bhagavad-Gita', edition: 'Sir Edwin Arnold, The Song Celestial', license: 'Public domain in the United States; check local law', source: 'https://www.gutenberg.org/ebooks/2388', sourceLabel: 'Project Gutenberg', count: { en: '18 chapters · English', id: '18 bab · Inggris' } },
  { faith: 'confucianism', title: 'The Analects', edition: 'James Legge', license: 'Public domain in the United States; check local law', source: 'https://www.gutenberg.org/ebooks/3330', sourceLabel: 'Project Gutenberg', count: { en: '20 books · English', id: '20 bagian · Inggris' } },
];
