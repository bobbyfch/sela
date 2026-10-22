import { test, expect, type Page, type Route } from '@playwright/test';
import { QURAN_VERSE_COUNTS } from '../../app/library/quran-structure.ts';

// Publisher APIs are mocked so the suite is deterministic and never contacts QuranEnc or HadeethEnc.
const json = (route: Route, body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });
const calls: string[] = [];

async function mockQuranEnc(page: Page, options: { failSurah?: number; shortSurah?: number } = {}) {
  await page.route('https://quranenc.com/api/v1/**', route => {
    const url = new URL(route.request().url());
    calls.push(url.pathname);
    if (url.pathname.endsWith('/translations/list/id')) return json(route, { translations: [{ key: 'indonesian_test', language_iso_code: 'id', version: '9.9.9', title: 'Terjemahan Uji', description: 'Edisi uji.' }] });
    const match = url.pathname.match(/\/translation\/sura\/indonesian_test\/(\d+)$/);
    if (!match) return json(route, {}, 404);
    const surah = Number(match[1]);
    if (surah === options.failSurah) return json(route, { error: 'down' }, 503);
    const count = surah === options.shortSurah ? QURAN_VERSE_COUNTS[surah - 1] - 1 : QURAN_VERSE_COUNTS[surah - 1];
    return json(route, { result: Array.from({ length: count }, (_, index) => ({ id: String(surah * 1000 + index), sura: String(surah), aya: String(index + 1), arabic_text: `نص ${surah}:${index + 1}`, translation: `Terjemahan ${surah}:${index + 1}`, footnotes: '' })) });
  });
}

async function mockHadeethEnc(page: Page) {
  const record = (id: string) => ({ id, title: `Judul hadis ${id}`, hadeeth: `Isi hadis ${id} persis seperti dari penerbit.`, attribution: 'Muttafaq ‘alaih', grade: 'Sahih', explanation: `Penjelasan ${id}.`, hints: [`1- Faedah ${id}.\r`], hadeeth_ar: 'نص عربي', categories: ['85'], translations: ['ar', 'id'] });
  await page.route('https://hadeethenc.com/api/v1/**', route => {
    const url = new URL(route.request().url());
    calls.push(url.pathname + url.search);
    if (url.pathname.endsWith('/categories/list/')) return json(route, [{ id: '3', title: 'Akidah', hadeeths_count: '3', parent_id: null }, { id: '8', title: 'Anak kategori', hadeeths_count: '1', parent_id: '3' }]);
    if (url.pathname.endsWith('/hadeeths/list/')) return json(route, { data: ['101', '102', '103'].map(id => ({ id, title: `Judul hadis ${id}`, translations: ['id'] })), meta: { current_page: '1', last_page: 1, total_items: 3, per_page: '1000' } });
    if (url.pathname.endsWith('/hadeeths/one/')) return json(route, record(url.searchParams.get('id') || ''));
    return json(route, {}, 404);
  });
}

const open = async (page: Page) => { await page.addInitScript(() => localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'id' }))); await page.goto('/sela/app/#/discover?lens=taman'); };

test('a Quran edition is downloaded from the publisher, verified, and then read with no publisher requests', async ({ page }) => {
  calls.length = 0;
  await mockQuranEnc(page);
  await open(page);
  await page.getByRole('button', { name: /Tampilkan edisi Al-Qur’an Indonesia/ }).click();
  const card = page.getByRole('article', { name: 'Terjemahan Uji' });
  await expect(card).toBeVisible();
  await expect(card.getByText('9.9.9')).toBeVisible();
  await card.getByRole('button', { name: 'Unduh untuk offline' }).click();
  await expect(card.getByRole('button', { name: 'Baca' })).toBeVisible();
  await expect(card.getByText('Terunduh')).toBeVisible();
  const before = calls.length;

  await card.getByRole('button', { name: 'Baca' }).click();
  await expect(page).toHaveURL(/#\/faith\/quran\//);
  await expect(page.getByText('Terjemahan 1:1', { exact: false }).first()).toBeVisible();
  await page.goto('/sela/app/#/faith/quran/2?verse=3');
  await expect(page.getByText('Terjemahan 2:3', { exact: false }).first()).toBeVisible();
  expect(calls.slice(before)).toEqual([]);
});

test('a failed or short surah discards the whole Quran download', async ({ page }) => {
  await mockQuranEnc(page, { failSurah: 50 });
  await open(page);
  await page.getByRole('button', { name: /Tampilkan edisi Al-Qur’an Indonesia/ }).click();
  const card = page.getByRole('article', { name: 'Terjemahan Uji' });
  await card.getByRole('button', { name: 'Unduh untuk offline' }).click();
  await expect(card.getByRole('alert')).toBeVisible({ timeout: 30000 });
  await expect(card.getByText('Terunduh')).toHaveCount(0);
  await expect(card.getByRole('button', { name: 'Unduh untuk offline' })).toBeVisible();

  await page.unrouteAll();
  await mockQuranEnc(page, { shortSurah: 2 });
  await card.getByRole('button', { name: 'Unduh untuk offline' }).click();
  await expect(card.getByRole('alert')).toContainText(/tidak memiliki|expected|nothing was saved/i, { timeout: 30000 });
  await expect(card.getByText('Terunduh')).toHaveCount(0);
});

test('a hadith collection is saved unchanged, searchable and readable offline', async ({ page }) => {
  calls.length = 0;
  await mockHadeethEnc(page);
  await open(page);
  await page.getByRole('button', { name: /Tampilkan koleksi hadis/ }).click();
  const card = page.getByRole('article', { name: 'Akidah' });
  await expect(card).toBeVisible();
  await expect(page.getByRole('article', { name: 'Anak kategori' })).toHaveCount(0);
  await card.getByRole('button', { name: 'Unduh untuk offline' }).click();
  await expect(card.getByRole('button', { name: 'Baca' })).toBeVisible();
  const before = calls.length;

  await card.getByRole('button', { name: 'Baca' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Akidah' })).toBeVisible();
  await page.getByRole('searchbox', { name: /Cari di koleksi ini/ }).fill('102');
  await expect(page.getByRole('link', { name: /Judul hadis 102/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Judul hadis 101/ })).toHaveCount(0);
  await page.getByRole('link', { name: /Judul hadis 102/ }).click();
  await expect(page.getByText('Isi hadis 102 persis seperti dari penerbit.')).toBeVisible();
  await expect(page.getByText('Sahih')).toBeVisible();
  await expect(page.getByText('Penjelasan 102.')).toBeVisible();
  await expect(page.getByRole('link', { name: /HadeethEnc/ })).toBeVisible();
  expect(calls.slice(before)).toEqual([]);
});
