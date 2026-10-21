import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Alert, Anchor, Badge, Button, Card, Chip, Group, Loader, Modal, SegmentedControl, Select, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ArrowDownToLine, ArrowUpRight, BookOpen, Compass, ExternalLink, Search, ShoppingBag, Shuffle } from 'lucide-react';
import curatedBooks from '../../../../../library/public-books.json' with { type: 'json' };
import indonesianBooks from '../../../../../library/indonesia-tech-books.json' with { type: 'json' };
import { searchBooks, acquireBook } from '../../../../../app/library/book-sources.ts';
import { opdsBooks } from '../../../../../app/library/opds.ts';
import { fetchFile } from '../../../../../app/library/network.ts';
import { catalogCoverUrl, catalogCoverUrlForQuality, type CatalogCoverQuality } from '../../../../../app/library/covers.ts';
import { lookupCatalogBookDetails, type CatalogBookDetails } from '../../../../../app/library/catalog-details.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

type CatalogBook = {
  id: string; title: string; author?: string; language?: string; genre?: string; rights?: string;
  source: string; repo?: string; branch?: string; pageid?: number; coverUrl?: string; coverDownloadUrl?: string; url?: string;
  format?: string; external?: string; navigation?: string; description?: string; accessType?: string; year?: string | number;
  isbn?: string[]; isbn10?: string; isbn13?: string; publisher?: string; pages?: number; topics?: string[];
};
type CatalogPage = { books: CatalogBook[]; next?: boolean; continuation?: string; total?: number };
type Provider = { id: string; source: string; en: string; idLabel: string; detailEn: string; detailId: string; collections: string[]; topics: string[]; sourceUrl: string };

const providers: Provider[] = [
  { id: 'sela', source: 'local', en: 'Sela picks', idLabel: 'Pilihan Sela', detailEn: 'Free classic texts chosen for memory, homecoming, longing, and uncanny storytelling. Download only the books you want to keep.', detailId: 'Klasik gratis pilihan tentang ingatan, kepulangan, kerinduan, dan cerita ganjil. Unduh hanya buku yang ingin kamu simpan.', collections: ['all'], topics: ['uncanny', 'memory-home', 'longing', 'poetry-sound', 'myth-folklore', 'speculative', 'reflection', 'life-writing', 'storycraft', 'nature-journey'], sourceUrl: 'https://www.gutenberg.org/' },
  { id: 'gutenberg', source: 'gutendex', en: 'Project Gutenberg', idLabel: 'Project Gutenberg', detailEn: 'Popular and recently added public domain editions.', detailId: 'Edisi domain publik populer dan yang baru ditambahkan.', collections: ['trending', 'recent'], topics: ['fiction', 'nonfiction', 'comics', 'children', 'history', 'fantasy', 'mystery', 'romance', 'science_fiction', 'poetry', 'philosophy', 'biography'], sourceUrl: 'https://www.gutenberg.org/' },
  { id: 'wikisource', source: 'wikisource', en: 'Wikisource', idLabel: 'Wikisumber', detailEn: 'Community transcriptions across 14 languages.', detailId: 'Transkripsi komunitas dalam 14 bahasa.', collections: ['open'], topics: ['fiction', 'poetry', 'short-stories'], sourceUrl: 'https://id.wikisource.org/' },
  { id: 'gitenberg', source: 'gitenberg', en: 'GITenberg', idLabel: 'GITenberg', detailEn: 'Searchable Gutenberg mirrors with plain text editions.', detailId: 'Mirror Gutenberg yang bisa dicari dan menyediakan edisi teks.', collections: ['all'], topics: [], sourceUrl: 'https://gitenberg.org/' },
  { id: 'openlibrary', source: 'openlibrary-trending', en: 'Open Library', idLabel: 'Open Library', detailEn: 'Reader trends, hidden gems, genre shelves, and catalog search.', detailId: 'Tren pembaca, temuan tersembunyi, kategori, dan pencarian katalog.', collections: ['trending', 'hidden', 'all'], topics: ['fiction', 'comics', 'graphic_novels', 'nonfiction', 'children', 'history', 'fantasy', 'mystery', 'romance', 'science_fiction', 'religion', 'technology', 'psychology', 'health', 'nature', 'business', 'self_help', 'poetry', 'philosophy', 'biography'], sourceUrl: 'https://openlibrary.org/' },
  { id: 'bookrank', source: 'bookrank', en: 'BookRank', idLabel: 'BookRank', detailEn: 'Open data reader rankings. Book links and rights vary by source.', detailId: 'Peringkat pembaca berbasis data terbuka. Hak buku mengikuti sumbernya.', collections: ['trending'], topics: ['fiction', 'comics', 'graphic_novels', 'history', 'fantasy', 'mystery', 'romance', 'science_fiction', 'science', 'religion', 'technology', 'psychology', 'health', 'nature', 'business', 'self_help', 'cooking', 'music', 'personal_finance', 'poetry', 'philosophy', 'biography'], sourceUrl: 'https://openbookrank.com/en/open-data' },
  { id: 'openstax', source: 'openstax', en: 'OpenStax', idLabel: 'OpenStax', detailEn: 'Free textbooks published by Rice University.', detailId: 'Buku ajar gratis yang diterbitkan Rice University.', collections: ['open'], topics: [], sourceUrl: 'https://openstax.org/subjects' },
  { id: 'indonesia-tech', source: 'id-tech', en: 'Indonesian tech', idLabel: 'Teknologi Indonesia', detailEn: 'A directory of Indonesian programming books and learning resources.', detailId: 'Direktori buku pemrograman dan materi belajar berbahasa Indonesia.', collections: ['all'], topics: [], sourceUrl: 'https://github.com/EbookFoundation/free-programming-books' },
  { id: 'opds', source: 'opds', en: 'My OPDS catalog', idLabel: 'Katalog OPDS-ku', detailEn: 'Connect a browser-accessible OPDS 1 or 2 catalog over HTTPS.', detailId: 'Hubungkan katalog OPDS 1 atau 2 melalui HTTPS yang bisa diakses browser.', collections: ['open'], topics: [], sourceUrl: '' },
];

const collectionLabels: Record<string, [string, string]> = {
  trending: ['Most read', 'Paling banyak dibaca'], open: ['Open texts', 'Teks terbuka'], recent: ['Recently added', 'Baru ditambahkan'],
  hidden: ['Hidden gems', 'Temuan tersembunyi'], all: ['Browse all', 'Jelajahi semua'],
};
const topicLabels: Record<string, [string, string]> = {
  fiction: ['Novels & fiction', 'Novel & fiksi'], comics: ['Comics', 'Komik'], graphic_novels: ['Graphic novels', 'Novel grafis'],
  nonfiction: ['Non-fiction', 'Nonfiksi'], 'short-stories': ['Short stories', 'Cerita pendek'], children: ['Children', 'Anak-anak'], history: ['History', 'Sejarah'],
  fantasy: ['Fantasy', 'Fantasi'], mystery: ['Mystery', 'Misteri'], romance: ['Romance', 'Romansa'], science_fiction: ['Science fiction', 'Fiksi ilmiah'],
  science: ['Science & learning', 'Sains & pembelajaran'], religion: ['Religion', 'Agama'], technology: ['Technology', 'Teknologi'], psychology: ['Psychology', 'Psikologi'],
  health: ['Health & wellbeing', 'Kesehatan'], nature: ['Nature', 'Alam'], business: ['Business', 'Bisnis'], self_help: ['Personal growth', 'Pengembangan diri'],
  cooking: ['Cooking', 'Memasak'], music: ['Music', 'Musik'], personal_finance: ['Personal finance', 'Keuangan pribadi'], poetry: ['Poetry', 'Puisi'],
  philosophy: ['Philosophy', 'Filsafat'], biography: ['Biography', 'Biografi'],
  uncanny: ['The uncanny', 'Yang ganjil'], 'memory-home': ['Memory & home', 'Ingatan & rumah'], longing: ['Longing & loss', 'Rindu & kehilangan'],
  'poetry-sound': ['Poetry & sound', 'Puisi & bunyi'], 'myth-folklore': ['Myth & folklore', 'Mitos & folklor'],
  speculative: ['Dreams & other worlds', 'Mimpi & dunia lain'], reflection: ['Reflection', 'Renungan'],
  'life-writing': ['Lives & letters', 'Kisah hidup & surat'], storycraft: ['Stories & drama', 'Cerita & drama'],
  'nature-journey': ['Nature & journeys', 'Alam & perjalanan'],
};
const wikiLanguages = [['id', 'Indonesia'], ['en', 'English'], ['jv', 'Javanese'], ['su', 'Sundanese'], ['fr', 'French'], ['es', 'Spanish'], ['de', 'German'], ['nl', 'Dutch'], ['pt', 'Portuguese'], ['it', 'Italian'], ['zh', 'Chinese'], ['ja', 'Japanese'], ['ru', 'Russian'], ['ar', 'Arabic']] as const;
const bookrankTopics: Record<string, string> = { fiction: 'literary-fiction', comics: 'comics', graphic_novels: 'graphic-novels', mystery: 'crime', science_fiction: 'science-fiction', science: 'popular-science', self_help: 'self-help', personal_finance: 'personal-finance' };
const openLibraryTopics: Record<string, string> = { children: 'childrens_literature', mystery: 'mystery_and_detective_stories' };
const gutenbergTopics: Record<string, string> = { nonfiction: 'nonfiction', comics: 'comics', science_fiction: 'science_fiction' };
const opdsProfilesKey = 'sela-library:catalogs';
const coverQualityKey = 'sela:app:cover-quality';

function readCoverQuality(): CatalogCoverQuality {
  try { return localStorage.getItem(coverQualityKey) === 'hd' ? 'hd' : 'sd'; }
  catch { return 'sd'; }
}

function sourceFor(provider: Provider, collection: string, wikiLanguage: string) {
  if (provider.id === 'openlibrary') return collection === 'trending' ? 'openlibrary-trending' : collection === 'hidden' ? 'openlibrary-hidden' : 'openlibrary';
  if (provider.id === 'wikisource') return wikiLanguage === 'id' ? 'wikisource' : `wiki-${wikiLanguage}`;
  return provider.source;
}
function topicFor(provider: Provider, topic: string) {
  if (!topic) return '';
  if (provider.id === 'bookrank') return bookrankTopics[topic] || topic;
  if (provider.id === 'openlibrary') return openLibraryTopics[topic] || topic;
  if (provider.id === 'gutenberg') return gutenbergTopics[topic] || topic;
  return topic;
}
function readProfiles(): { name: string; url: string }[] {
  try {
    const rows = JSON.parse(localStorage.getItem(opdsProfilesKey) || '[]');
    return Array.isArray(rows) ? rows.filter((row): row is { name: string; url: string } => !!row && typeof row.name === 'string' && typeof row.url === 'string' && /^https:\/\//i.test(row.url)).slice(-30) : [];
  } catch { return []; }
}
function opdsHeaders(url: string, baseUrl: string, username: string, password: string): Record<string, string> {
  if (!username && !password) return {};
  try {
    const target = new URL(url), origin = new URL(baseUrl);
    if (target.origin !== origin.origin) return {};
    return { Authorization: `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}` };
  } catch { return {}; }
}
function localTopicMatches(book: CatalogBook, topic: string) {
  if (!topic) return true;
  if (book.topics?.includes(topic)) return true;
  const value = `${book.title} ${book.author || ''} ${book.genre || ''}`.toLocaleLowerCase();
  const aliases: Record<string, string[]> = { fiction: ['fiction', 'novel'], nonfiction: ['non-fiction', 'nonfiction'], children: ['children', 'juvenile', 'family'], history: ['history', 'historical'], science_fiction: ['science fiction', 'science-fiction'] };
  return (aliases[topic] || [topic.replaceAll('_', ' ')]).some(term => value.includes(term));
}

const selaTopicCounts = Object.fromEntries((providers.find(item => item.id === 'sela')?.topics || []).map(value => [
  value,
  (curatedBooks as CatalogBook[]).filter(book => book.topics?.includes(value) || localTopicMatches(book, value)).length,
])) as Record<string, number>;

function curatedCoverUrl(book: CatalogBook) {
  if (book.coverUrl) return book.coverUrl;
  const id = book.external?.match(/^https:\/\/www\.gutenberg\.org\/ebooks\/(\d+)(?:[/?#]|$)/i)?.[1];
  return id ? catalogCoverUrl(`https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`) : undefined;
}

function jacketIndex(title: string) {
  return [...title].reduce((hash, character) => (hash * 31 + character.codePointAt(0)!) >>> 0, 7) % 6;
}

function CatalogBookCover({ book, detail = false, quality = 'sd' }: { book: CatalogBook; detail?: boolean; quality?: CatalogCoverQuality }) {
  const imageUrl = catalogCoverUrlForQuality(book.coverUrl, quality, book.coverDownloadUrl);
  const [loadedUrl, setLoadedUrl] = useState<string>();
  const loaded = !!imageUrl && loadedUrl === imageUrl;
  return <span className={detail ? 'catalog-detail-cover' : 'catalog-result-cover'} data-image-loaded={loaded ? 'true' : undefined} data-jacket={jacketIndex(book.title)}>
    {imageUrl && <img key={imageUrl} src={imageUrl} alt="" loading={detail ? 'eager' : 'lazy'} onLoad={() => setLoadedUrl(imageUrl)} onError={() => setLoadedUrl(undefined)} />}
    {!loaded && <span className="catalog-cover-art" aria-hidden="true"><span className="catalog-cover-mark"><BookOpen size={detail ? 21 : 17} strokeWidth={1.5} /></span><strong>{book.title}</strong><small>{book.author || 'Sela Books'}</small><span className="catalog-cover-edition">{book.language?.toLocaleUpperCase() || 'OPEN EDITION'}{book.year ? ` · ${book.year}` : ''}</span></span>}
  </span>;
}

function safeExternalUrl(value: string | undefined) {
  try { const url = new URL(value || ''); return url.protocol === 'https:' ? url.href : undefined; }
  catch { return undefined; }
}

function isGutenbergRecord(value: string | undefined) {
  try { const url = new URL(value || ''); return url.protocol === 'https:' && url.hostname === 'www.gutenberg.org' && /^\/ebooks\/\d+(?:\.html)?\/?$/.test(url.pathname); }
  catch { return false; }
}

function coverDownloadName(title: string, quality: CatalogCoverQuality, mimeType: string) {
  const base = title.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 90) || 'book-cover';
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : mimeType === 'image/avif' ? 'avif' : 'jpg';
  return `${base}-${quality.toUpperCase()}.${extension}`;
}

function shopSearchUrl(book: CatalogBook, details: CatalogBookDetails | null) {
  const edition = details?.editions.find(item => item.isbn13 || item.isbn10);
  const identifier = edition?.isbn13 || edition?.isbn10 || book.isbn13 || book.isbn10 || book.isbn?.[0];
  const query = [book.title, book.author, identifier].filter(Boolean).join(' ');
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
}

export function CatalogExplorer() {
  const { lang, importBooks } = useWorkspace();
  const mobile = useMediaQuery('(max-width: 48em)');
  const [providerId, setProviderId] = useState('sela');
  const [collection, setCollection] = useState('all');
  const [topic, setTopic] = useState('');
  const [wikiLanguage, setWikiLanguage] = useState('id');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<CatalogBook | null>(null);
  const [bookDetails, setBookDetails] = useState<CatalogBookDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [coverQuality, setCoverQuality] = useState<CatalogCoverQuality>(readCoverQuality);
  const [coverDownloading, setCoverDownloading] = useState(false);
  const [coverDownloadError, setCoverDownloadError] = useState('');
  const [next, setNext] = useState(false);
  const [total, setTotal] = useState<number>();
  const [continuation, setContinuation] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [downloading, setDownloading] = useState('');
  const [opdsUrl, setOpdsUrl] = useState(() => { try { return localStorage.getItem('sela-opds-url') || ''; } catch { return ''; } });
  const [profileName, setProfileName] = useState('');
  const [profiles, setProfiles] = useState(readProfiles);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const t = (en: string, id: string) => copy(lang, en, id);
  const provider = providers.find(item => item.id === providerId) || providers[0];
  const source = sourceFor(provider, collection, wikiLanguage);
  const selectedTopic = topicFor(provider, topic);
  const hasBrowseChoices = provider.collections.length > 1 || provider.topics.length > 0;
  const sourceLabel = t(provider.en, provider.idLabel);
  const sourceHref = provider.id === 'wikisource' ? `https://${wikiLanguage}.wikisource.org/` : provider.sourceUrl;

  useEffect(() => {
    if (!selectedBook) return;
    const controller = new AbortController();
    setBookDetails(null); setDetailsError(''); setDetailsLoading(true);
    void lookupCatalogBookDetails(selectedBook, controller.signal)
      .then(value => { if (!controller.signal.aborted) setBookDetails(value); })
      .catch(reason => { if (!controller.signal.aborted) setDetailsError(reason instanceof Error ? reason.message : t('Edition details are unavailable.', 'Detail edisi belum tersedia.')); })
      .finally(() => { if (!controller.signal.aborted) setDetailsLoading(false); });
    return () => controller.abort();
    // The selected record is immutable while its detail view is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook]);

  const load = async (append = false, explicitQuery = query, chosenSource = source, chosenTopic = selectedTopic, chosenProvider = provider) => {
    if (chosenProvider.id === 'opds' && !opdsUrl.trim()) { setError(t('Add an HTTPS OPDS catalog URL first.', 'Tambahkan URL katalog OPDS HTTPS terlebih dahulu.')); return; }
    abortRef.current?.abort();
    const controller = new AbortController(); abortRef.current = controller;
    setLoading(true); setError(''); setSearched(true);
    if (!append) setTotal(undefined);
    const targetPage = append ? page + 1 : 1;
    try {
      let data: CatalogPage;
      if (chosenProvider.id === 'opds') {
        const target = append && continuation ? continuation : opdsUrl.trim();
        data = await opdsBooks(target, { signal: controller.signal, query: explicitQuery.trim(), headers: opdsHeaders(target, opdsUrl, username, password) }) as CatalogPage;
        try { localStorage.setItem('sela-opds-url', opdsUrl.trim()); } catch { /* OPDS still works in private mode. */ }
      } else if (chosenProvider.id === 'sela' || chosenProvider.id === 'indonesia-tech') {
        const entries = chosenProvider.id === 'sela' ? curatedBooks : indonesianBooks;
        const terms = explicitQuery.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
        const all = (entries as CatalogBook[]).filter(book => {
          const haystack = `${book.title} ${book.author || ''} ${book.genre || ''} ${book.description || ''} ${(book.topics || []).join(' ')}`.toLocaleLowerCase();
          return terms.every(term => haystack.includes(term)) && localTopicMatches(book, chosenTopic);
        }).map(book => ({ ...book, source: chosenProvider.id === 'sela' ? book.source : chosenProvider.source, coverUrl: chosenProvider.id === 'sela' ? curatedCoverUrl(book) : book.coverUrl }));
        data = { books: all.slice((targetPage - 1) * 24, targetPage * 24), next: targetPage * 24 < all.length, total: all.length };
      } else {
        data = await searchBooks({ source: chosenSource, query: explicitQuery.trim(), page: targetPage, category: chosenTopic, collection: chosenProvider.id === 'gutenberg' ? collection : '', signal: controller.signal }) as CatalogPage;
      }
      if (controller.signal.aborted) return;
      setResults(previous => append ? [...previous, ...data.books] : data.books);
      setNext(Boolean(data.next)); setContinuation(data.continuation || ''); setPage(targetPage);
      setTotal(typeof data.total === 'number' && Number.isFinite(data.total) ? data.total : undefined);
    } catch (reason) {
      if (controller.signal.aborted) return;
      setError(reason instanceof Error ? reason.message : t('The catalog could not be reached.', 'Katalog belum bisa diakses.'));
      if (!append) { setResults([]); setTotal(undefined); }
      setNext(false); setContinuation('');
    } finally { if (!controller.signal.aborted) setLoading(false); }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(false); }, 240);
    return () => { window.clearTimeout(timer); abortRef.current?.abort(); };
    // Catalog changes and typed searches intentionally share the same debounced request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, collection, topic, wikiLanguage, query, opdsUrl]);

  const chooseProvider = (item: Provider) => { setProviderId(item.id); setCollection(item.collections[0]); setTopic(''); setPage(1); };
  const chooseCollection = (value: string) => { setCollection(value); setTopic(''); setPage(1); };
  const chooseTopic = (value: string) => { setTopic(current => current === value ? '' : value); setPage(1); };
  const submit = (event: FormEvent) => { event.preventDefault(); void load(false); };
  const surprise = () => {
    const choices = [...provider.collections.filter(value => value !== collection), ...provider.topics.filter(value => value !== topic)];
    if (!choices.length) return;
    const choice = choices[Math.floor(Math.random() * choices.length)];
    if (provider.collections.includes(choice)) chooseCollection(choice); else chooseTopic(choice);
  };
  const saveProfile = () => {
    try {
      const url = new URL(opdsUrl);
      if (url.protocol !== 'https:' || url.username || url.password || !profileName.trim()) throw new Error(t('Give this catalog a name and use a valid HTTPS URL.', 'Beri nama katalog dan gunakan URL HTTPS yang valid.'));
      const updated = [...profiles.filter(item => item.url !== url.href), { name: profileName.trim().slice(0, 40), url: url.href }].slice(-30);
      localStorage.setItem(opdsProfilesKey, JSON.stringify(updated)); setProfiles(updated); setProfileName(''); setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : t('Catalog could not be saved.', 'Katalog belum bisa disimpan.')); }
  };
  const openNavigation = (book: CatalogBook) => { if (!book.navigation) return; setOpdsUrl(book.navigation); setQuery(''); };
  const addBook = async (book: CatalogBook) => {
    setDownloading(book.id); setError('');
    try {
      const file = book.source === 'opds' && book.url
        ? await fetchFile(book.url, `${book.title}.${book.format || 'epub'}`, { headers: opdsHeaders(book.url, opdsUrl, username, password) })
        : await acquireBook(book);
      await importBooks([file]);
    } catch (reason) { setError(reason instanceof Error ? reason.message : t('This book could not be downloaded.', 'Buku ini belum bisa diunduh.')); }
    finally { setDownloading(''); }
  };
  const changeCoverQuality = (value: string) => {
    if (value !== 'sd' && value !== 'hd') return;
    const nextQuality = value as CatalogCoverQuality;
    setCoverQuality(nextQuality);
    try { localStorage.setItem(coverQualityKey, nextQuality); } catch { /* Keep the choice for this page session. */ }
  };
  const downloadCover = async (book: CatalogBook) => {
    const imageUrl = catalogCoverUrlForQuality(book.coverUrl, coverQuality, book.coverDownloadUrl);
    if (!imageUrl) return;
    setCoverDownloading(true); setCoverDownloadError('');
    try {
      const response = await fetch(imageUrl, { credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Cover source unavailable');
      const mimeType = (response.headers.get('content-type') || '').split(';', 1)[0].trim().toLocaleLowerCase();
      if (!/^image\/(?:jpeg|png|webp|avif)$/.test(mimeType)) throw new Error('Cover file is not a supported image');
      const size = Number(response.headers.get('content-length'));
      if (Number.isFinite(size) && size > 12 * 1024 * 1024) throw new Error('Cover file is too large');
      const blob = await response.blob();
      if (!blob.type.startsWith('image/') || blob.size > 12 * 1024 * 1024) throw new Error('Cover file is not a valid image');
      const objectUrl = URL.createObjectURL(blob), anchor = document.createElement('a');
      anchor.href = objectUrl; anchor.download = coverDownloadName(book.title, coverQuality, mimeType); anchor.hidden = true;
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch {
      setCoverDownloadError(t('This cover could not be downloaded from its source. Try opening the source record.', 'Cover ini belum bisa diunduh dari sumbernya. Coba buka data sumber buku.'));
    } finally { setCoverDownloading(false); }
  };
  const contextLabel = useMemo(() => {
    const selected = topic ? t(...(topicLabels[topic] || [topic, topic])) : t(...(collectionLabels[collection] || ['Browse all', 'Jelajahi semua']));
    return `${sourceLabel} · ${selected}`;
  }, [sourceLabel, topic, collection, lang]);

  return <div className="page-shell discover-screen catalog-explorer">
    <div className="catalog-heading-row"><div><PageEyebrow>{t('OPEN BOOKS', 'BUKU TERBUKA')}</PageEyebrow><Title order={1}>{t('Find your next read.', 'Temukan bacaan berikutnya.')}</Title><Text className="page-description">{t('Browse trusted catalogs, check the edition details, and keep open books on this device.', 'Jelajahi katalog tepercaya, periksa detail edisi, lalu simpan buku terbuka di perangkat ini.')}</Text></div><Badge className="catalog-count-badge" variant="light" leftSection={<Compass size={13} />}>{providers.length} {t('sources', 'sumber')}</Badge></div>

    <section aria-labelledby="catalog-sources-title" className="catalog-source-section"><div className="catalog-section-heading"><div><PageEyebrow>{t('01 · CHOOSE A SOURCE', '01 · PILIH SUMBER')}</PageEyebrow><Title id="catalog-sources-title" order={2}>{t('Where would you like to browse?', 'Mau menjelajah dari mana?')}</Title></div><Button variant="subtle" size="xs" leftSection={<Shuffle size={14} />} onClick={surprise}>{t('Surprise me', 'Beri kejutan')}</Button></div>
      <SimpleGrid cols={{ base: 1, xs: 2, lg: 3 }} spacing="sm">{providers.map(item => <button key={item.id} type="button" className="catalog-source-card" aria-pressed={provider.id === item.id} onClick={() => chooseProvider(item)}><span className="catalog-source-icon"><BookOpen size={17} strokeWidth={1.6} /></span><span className="catalog-source-title"><strong>{t(item.en, item.idLabel)}</strong>{item.id === 'sela' && <Badge className="catalog-source-count" variant="light">{(curatedBooks as CatalogBook[]).length} {t('books', 'buku')}</Badge>}</span><span className="catalog-source-detail">{t(item.detailEn, item.detailId)}</span></button>)}</SimpleGrid>
    </section>

    <Card className="catalog-search-card" withBorder radius="xl" padding="lg">
      <form onSubmit={submit} className="catalog-search-form"><TextInput value={query} onChange={event => setQuery(event.currentTarget.value)} leftSection={<Search size={16} />} placeholder={t('Search titles, authors, or a topic', 'Cari judul, penulis, atau topik')} aria-label={t('Search books', 'Cari buku')} maxLength={100} /><Button type="submit" leftSection={loading ? <Loader size={15} color="currentColor" /> : <Search size={15} />} disabled={loading}>{t('Search', 'Cari')}</Button></form>
      {provider.id === 'wikisource' && <div className="catalog-field-row"><Select label={t('Edition language', 'Bahasa edisi')} value={wikiLanguage} onChange={value => setWikiLanguage(value || 'id')} data={wikiLanguages.map(([value, label]) => ({ value, label: t(label, value === 'id' ? 'Indonesia' : label) }))} allowDeselect={false} /></div>}
      {provider.id === 'opds' && <Stack className="opds-setup" gap="sm"><Text size="sm" c="dimmed">{t('Use an HTTPS catalog that allows browser access. Username and password stay in this page session.', 'Gunakan katalog HTTPS yang mengizinkan akses browser. Username dan password hanya tersimpan selama sesi halaman ini.')}</Text>
        {profiles.length > 0 && <div className="opds-profiles"><Text size="xs" fw={600}>{t('Saved on this device', 'Tersimpan di perangkat ini')}</Text><Group gap="xs">{profiles.map(item => <Button key={item.url} size="compact-sm" variant="light" onClick={() => setOpdsUrl(item.url)}>{item.name}</Button>)}</Group></div>}
        <TextInput label={t('OPDS catalog URL', 'URL katalog OPDS')} type="url" value={opdsUrl} onChange={event => setOpdsUrl(event.currentTarget.value)} placeholder="https://…/opds" />
        <div className="opds-auth-grid"><TextInput label={t('Username · optional', 'Username · opsional')} autoComplete="username" value={username} onChange={event => setUsername(event.currentTarget.value)} /><TextInput label={t('Password · session only', 'Password · sesi ini saja')} type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.currentTarget.value)} /></div>
        <div className="opds-save-grid"><TextInput label={t('Catalog name', 'Nama katalog')} value={profileName} onChange={event => setProfileName(event.currentTarget.value.slice(0, 40))} maxLength={40} placeholder={t('For example: My library', 'Contoh: Perpustakaanku')} /><Button variant="default" onClick={saveProfile}>{t('Save catalog', 'Simpan katalog')}</Button></div>
      </Stack>}
      {hasBrowseChoices && <div className="catalog-browse-groups">
        {provider.collections.length > 1 && <div><Text className="catalog-group-label">{t('COLLECTION', 'KOLEKSI')}</Text><Group gap="xs" className="catalog-chip-row">{provider.collections.map(value => <Chip key={value} checked={collection === value} onChange={() => chooseCollection(value)}>{t(...(collectionLabels[value] || [value, value]))}</Chip>)}</Group></div>}
        {provider.topics.length > 0 && <div><Text className="catalog-group-label">{t('TOPICS', 'TOPIK')}</Text><Group gap="xs" className="catalog-chip-row">{provider.topics.filter(value => provider.id !== 'sela' || (selaTopicCounts[value] || 0) > 0).map(value => <Chip key={value} checked={topic === value} onChange={() => chooseTopic(value)}><span className="catalog-chip-content"><span>{t(...(topicLabels[value] || [value, value]))}</span>{provider.id === 'sela' && <span className="catalog-topic-count" aria-label={t(`${selaTopicCounts[value]} books`, `${selaTopicCounts[value]} buku`)}>{selaTopicCounts[value]}</span>}</span></Chip>)}</Group></div>}
      </div>}
      <Text className="catalog-rights-note">{provider.id === 'sela' ? t('Only this book list is stored with Sela. The full texts are fetched when you choose “Download & add to shelf”. Project Gutenberg states public-domain status for the United States; check local copyright.', 'Hanya daftar judul yang disimpan di Sela. Naskah lengkap baru diambil saat kamu memilih “Unduh & simpan ke rak”. Project Gutenberg menyatakan status domain publik untuk Amerika Serikat; periksa aturan hak cipta setempat.') : t('Edition availability and reuse terms vary. Check the source record and local copyright before sharing.', 'Ketersediaan edisi dan hak penggunaan berbeda-beda. Periksa halaman sumber dan aturan hak cipta setempat sebelum membagikan.')}</Text>
    </Card>

    {error && <Alert color="red" variant="light" title={t('Could not complete this request', 'Permintaan belum berhasil')} withCloseButton onClose={() => setError('')}>{error}</Alert>}
    <section className="catalog-results-section" aria-labelledby="catalog-results-title"><div className="catalog-section-heading"><div><PageEyebrow>{t('02 · RESULTS', '02 · HASIL')}</PageEyebrow><Title id="catalog-results-title" order={2}>{query.trim() ? t('Search results', 'Hasil pencarian') : t('A place to begin', 'Pilihan untuk memulai')}</Title><Text className="catalog-results-context">{contextLabel}{results.length ? ` · ${total !== undefined ? `${total} ${t('books', 'buku')}` : `${results.length}${next ? '+' : ''}`}` : ''}</Text></div><div className="catalog-results-tools"><div className="catalog-cover-quality"><Text className="catalog-cover-quality-label">{t('Cover size', 'Ukuran cover')}</Text><SegmentedControl aria-label={t('Cover image size', 'Ukuran gambar cover')} size="xs" value={coverQuality} onChange={changeCoverQuality} data={[{ label: 'SD', value: 'sd' }, { label: 'HD', value: 'hd' }]} /></div>{sourceHref && <Anchor href={sourceHref} target="_blank" rel="noopener noreferrer" size="sm" className="catalog-attribution">{t('Source details', 'Detail sumber')} <ArrowUpRight size={13} /></Anchor>}</div></div>
      {loading && results.length === 0 ? <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">{[0, 1, 2, 3, 4, 5].map(index => <Skeleton key={index} h={212} radius="lg" />)}</SimpleGrid>
        : results.length ? <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, lg: 4, xl: 5 }} spacing={{ base: 'sm', md: 'md' }}>{results.map((book, index) => <CatalogResult key={`${book.id}-${index}`} book={book} lang={lang} quality={coverQuality} loading={downloading === book.id} onAdd={() => void addBook(book)} onNavigate={() => openNavigation(book)} onOpenDetails={() => { setSelectedBook(book); setCoverDownloadError(''); }} t={t} />)}</SimpleGrid>
        : searched && !loading ? <Card className="catalog-empty-state" withBorder radius="lg"><Text fw={600}>{t('No editions found.', 'Tidak ada edisi ditemukan.')}</Text><Text size="sm" c="dimmed">{error ? t('Check the address or try another source.', 'Periksa alamat atau coba sumber lain.') : t('Try a shorter title, a different spelling, or another topic.', 'Coba judul lebih singkat, ejaan lain, atau topik lain.')}</Text></Card>
        : <Card className="catalog-empty-state" withBorder radius="lg"><Text fw={600}>{t('Your next book is a few shelves away.', 'Buku berikutnya hanya beberapa rak dari sini.')}</Text><Text size="sm" c="dimmed">{t('Choose a source or search its catalog.', 'Pilih sumber atau cari di katalognya.')}</Text></Card>}
      {next && <Group justify="center" mt="lg"><Button variant="default" onClick={() => void load(true)} loading={loading}>{t('More books', 'Buku lainnya')}</Button></Group>}
    </section>

    <Modal className="catalog-detail-modal" opened={!!selectedBook} onClose={() => { setSelectedBook(null); setCoverDownloadError(''); }} portalProps={{ target: '.sela-app' }} centered fullScreen={!!mobile} size="min(860px, calc(100vw - 32px))" title={selectedBook?.title || t('Book details', 'Detail buku')} overlayProps={{ backgroundOpacity: .48, blur: 10 }}>
      {selectedBook && <div className="catalog-detail-layout">
        <CatalogBookCover book={selectedBook} detail quality={coverQuality} />
        <div className="catalog-detail-copy">
          <div><Text className="page-eyebrow">{selectedBook.source.replaceAll('-', ' ').toLocaleUpperCase()}{selectedBook.language ? ` · ${selectedBook.language.toLocaleUpperCase()}` : ''}</Text><Text size="sm" c="dimmed">{selectedBook.author || t('Author not listed', 'Penulis tidak dicantumkan')}</Text></div>
          <div>
            <Title order={3}>{t('About this book', 'Tentang buku ini')}</Title>
            {detailsLoading && !bookDetails?.description && <Group mt="xs" gap="xs"><Loader size={14} /><Text size="sm" c="dimmed">{t('Checking edition details at Open Library…', 'Memeriksa detail edisi di Open Library…')}</Text></Group>}
            {(bookDetails?.description || selectedBook.description) ? <Text className="catalog-detail-description">{bookDetails?.description || selectedBook.description}</Text> : !detailsLoading && <Text size="sm" c="dimmed">{t('No description is listed for this record yet.', 'Deskripsi belum tercantum pada data edisi ini.')}</Text>}
          </div>
          {detailsError && <Alert color="yellow" variant="light" title={t('Edition lookup unavailable', 'Pencarian edisi belum tersedia')}>{detailsError}</Alert>}
          <div className="catalog-detail-editions">
            <Title order={4}>{t('Editions & ISBN', 'Edisi & ISBN')}</Title>
            {bookDetails?.editions.length ? bookDetails.editions.map(edition => <div className="catalog-detail-edition" key={edition.key}>
              <Text size="sm" fw={600}>{edition.title}</Text>
              <Text size="xs" c="dimmed">{[edition.publisher, edition.published, edition.pages ? `${edition.pages} ${t('pages', 'halaman')}` : ''].filter(Boolean).join(' · ') || t('Edition details', 'Detail edisi')}</Text>
              {(edition.isbn13 || edition.isbn10) && <Text size="xs" mt={4}>{[edition.isbn13 && `ISBN-13 ${edition.isbn13}`, edition.isbn10 && `ISBN-10 ${edition.isbn10}`].filter(Boolean).join(' · ')}</Text>}
            </div>) : selectedBook.isbn13 || selectedBook.isbn10 || selectedBook.isbn?.length ? <div className="catalog-detail-edition"><Text size="xs">{[selectedBook.isbn13 && `ISBN-13 ${selectedBook.isbn13}`, selectedBook.isbn10 && `ISBN-10 ${selectedBook.isbn10}`, ...(selectedBook.isbn || []).slice(0, 2)].filter(Boolean).join(' · ')}</Text>{selectedBook.publisher && <Text size="xs" c="dimmed">{selectedBook.publisher}</Text>}</div> : <Text size="sm" c="dimmed">{detailsLoading ? t('Loading listed editions…', 'Memuat daftar edisi…') : t('Open Library does not list an ISBN for this record.', 'Open Library belum mencantumkan ISBN untuk data ini.')}</Text>}
          </div>
          <dl className="catalog-detail-metadata">
            {(selectedBook.year || selectedBook.genre || selectedBook.rights) && <>
              {selectedBook.year && <div><dt>{t('First published', 'Terbit pertama')}</dt><dd>{selectedBook.year}</dd></div>}
              {selectedBook.genre && <div><dt>{t('Category', 'Kategori')}</dt><dd>{selectedBook.genre}</dd></div>}
              {selectedBook.rights && <div><dt>{t('Access & rights', 'Akses & hak')}</dt><dd>{selectedBook.rights}</dd></div>}
            </>}
          </dl>
          <div className="catalog-detail-actions">
            {safeExternalUrl(bookDetails?.sourceUrl || selectedBook.external) && <Button component="a" href={safeExternalUrl(bookDetails?.sourceUrl || selectedBook.external)} target="_blank" rel="noopener noreferrer" variant="default" leftSection={<ExternalLink size={15} />}>{t('Open source record', 'Buka data sumber')}</Button>}
            {selectedBook.navigation && <Button variant="default" onClick={() => { openNavigation(selectedBook); setSelectedBook(null); }}>{t('Open collection', 'Buka koleksi')}</Button>}
            {(safeExternalUrl(selectedBook.external) || bookDetails?.found) && <Button component="a" href={shopSearchUrl(selectedBook, bookDetails)} target="_blank" rel="noopener noreferrer" variant="default" leftSection={<ShoppingBag size={15} />}>{t('Search shop listings', 'Cari di toko buku')}</Button>}
            {catalogCoverUrlForQuality(selectedBook.coverUrl, coverQuality, selectedBook.coverDownloadUrl) && <Button leftSection={coverDownloading ? <Loader size={14} color="currentColor" /> : <ArrowDownToLine size={15} />} onClick={() => void downloadCover(selectedBook)} disabled={coverDownloading}>{coverDownloading ? t('Preparing cover…', 'Menyiapkan cover…') : t(`Download cover · ${coverQuality.toUpperCase()}`, `Unduh cover · ${coverQuality.toUpperCase()}`)}</Button>}
            {(selectedBook.url || selectedBook.repo || selectedBook.source === 'wikisource' || selectedBook.source.startsWith('wiki-')) && <Button leftSection={downloading === selectedBook.id ? <Loader size={14} color="currentColor" /> : <ArrowDownToLine size={15} />} onClick={() => void addBook(selectedBook)} disabled={downloading === selectedBook.id}>{downloading === selectedBook.id ? t('Downloading…', 'Mengunduh…') : t('Download & add to shelf', 'Unduh & simpan ke rak')}</Button>}
          </div>
          {coverDownloadError && <Alert color="red" variant="light" title={t('Cover download unavailable', 'Unduhan cover belum tersedia')}>{coverDownloadError}</Alert>}
          <Text className="catalog-detail-source-note">{t('Descriptions and ISBNs are edition-specific metadata from Open Library. Shop search opens current listings; price and availability are not verified in Sela.', 'Deskripsi dan ISBN adalah metadata edisi dari Open Library. Pencarian toko menampilkan hasil terbaru; harga dan ketersediaan tidak diverifikasi oleh Sela.')}</Text>
        </div>
      </div>}
    </Modal>
  </div>;
}

function PageEyebrow({ children }: { children: ReactNode }) { return <Text className="page-eyebrow">{children}</Text>; }

function CatalogResult({ book, lang, quality, loading, onAdd, onNavigate, onOpenDetails, t }: { book: CatalogBook; lang: 'en' | 'id'; quality: CatalogCoverQuality; loading: boolean; onAdd: () => void; onNavigate: () => void; onOpenDetails: () => void; t: (en: string, id: string) => string }) {
  const canSave = !!(book.url || book.repo || book.source === 'wikisource' || book.source.startsWith('wiki-') || isGutenbergRecord(book.external));
  const sourceName = book.source === 'gutendex' ? 'Project Gutenberg' : book.source.replaceAll('-', ' ');
  return <Card className="catalog-result-card" withBorder radius="lg" padding="md">
    <button type="button" className="catalog-result-open" onClick={onOpenDetails} aria-label={t(`Open details for ${book.title}`, `Buka detail ${book.title}`)}>
      <CatalogBookCover book={book} quality={quality} />
      <span className="catalog-result-copy"><span className="catalog-result-source page-eyebrow">{sourceName.toLocaleUpperCase()}{book.language ? ` · ${book.language.toLocaleUpperCase()}` : ''}</span><span className="catalog-result-title">{book.title}</span><span className="catalog-result-author">{book.author || t('Author not listed', 'Penulis tidak dicantumkan')}</span>
        <span className="catalog-result-meta">{book.year && <span>{book.year}</span>}{book.genre && <span className="catalog-result-genre">{book.genre}</span>}</span></span>
    </button>
    <Group className="catalog-result-actions" gap="xs">{book.navigation && <Button variant="default" onClick={onNavigate}>{t('Open collection', 'Buka koleksi')}</Button>}{canSave && <Button leftSection={loading ? <Loader size={14} color="currentColor" /> : <ArrowDownToLine size={15} />} onClick={onAdd} disabled={loading}>{loading ? t('Downloading…', 'Mengunduh…') : t('Download & add to shelf', 'Unduh & simpan ke rak')}</Button>}</Group>
  </Card>;
}
