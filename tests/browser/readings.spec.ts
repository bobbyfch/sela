import { test, expect, type Page } from '@playwright/test';

async function openFaith(page: Page, faith = 'islam', language = 'id') {
  await page.addInitScript(([value, lang]) => {
    localStorage.setItem('sela-library:personal', JSON.stringify({ version: 1, faith: value }));
    localStorage.setItem('sela:app:preferences', JSON.stringify({ language: lang }));
  }, [faith, language]);
  await page.goto('/sela/app/#/shelf?tab=faith');
}

const card = (page: import('@playwright/test').Page) => page.getByRole('article', { name: /Kisah 25 Nabi|Stories of the 25 Prophets/ });
const download = /Download for offline|Unduh untuk offline/;

test('Faith readings download a verified pack, reads it offline, and removes it', async ({ page, context }) => {
  const pageErrors: string[] = [];
  const outsideBase: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => { const url = new URL(request.url()); if (url.pathname.includes('/library/packs/') && !url.pathname.startsWith('/sela/')) outsideBase.push(url.pathname); });

  await openFaith(page);
  await expect(card(page)).toBeVisible();
  await expect(card(page).getByText(/Not yet reviewed by scholars|Belum ditelaah ulama/)).toBeVisible();
  await expect(card(page).getByText(/^(Draft|Draf)$/)).toHaveCount(0);
  await expect(card(page).getByText(/^(25 stories|25 kisah)$/)).toBeVisible();

  await card(page).getByRole('button', { name: download }).click();
  await expect(card(page).getByRole('button', { name: /^(Read|Baca)$/ })).toBeVisible();
  await expect(card(page).getByText(/^(Downloaded|Terunduh)$/)).toBeVisible();

  await card(page).getByRole('button', { name: /^(Read|Baca)$/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: /Kisah 25 Nabi|Stories of the 25 Prophets/ })).toBeVisible();
  await page.getByRole('link', { name: /Nabi Yusuf/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Nabi Yusuf' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Y.suf 12:3–10/ })).toBeVisible();
  await expect(page.getByText(/penafsiran, bukan teks wahyu|interpretation, not scripture/i)).toBeVisible();

  await page.getByRole('button', { name: /^(Save|Simpan)$/ }).click();
  await expect(page.getByRole('button', { name: /^(Saved|Tersimpan)$/ })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sela-library:personal') || '{}').readingsSaved)).toEqual(['sela-prophets-id-v1/yusuf']);

  await context.setOffline(true);
  await page.getByRole('link', { name: /Semua kisah|All entries/i }).click();
  await page.getByRole('link', { name: /Nabi Ibrahim/ }).click();
  await expect(page).toHaveURL(/#\/readings\/sela-prophets-id-v1\/ibrahim/);
  await expect(page.getByRole('heading', { level: 2, name: 'Nabi Ibrahim' })).toBeVisible();
  await context.setOffline(false);

  await page.getByRole('button', { name: /Back to Faith readings|Kembali ke Bacaan agama/ }).click();
  await expect(page.getByRole('region', { name: /Saved|Tersimpan/ }).getByRole('link', { name: /Nabi Yusuf/ })).toBeVisible();
  await card(page).getByRole('button', { name: /^(Remove|Hapus)$/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: /^(Remove|Hapus)$/ }).click();
  await expect(card(page).getByRole('button', { name: download })).toBeVisible();

  expect(outsideBase).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('a changed download is discarded with a clear error and nothing is saved', async ({ page }) => {
  await page.route('**/library/packs/prophets-id-v1.json', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('Nabi Nuh', 'Nabi Nuf') });
  });
  await openFaith(page);
  await card(page).getByRole('button', { name: download }).click();
  await expect(card(page).getByRole('alert')).toContainText(/checksum|incomplete|changed/i);
  await expect(card(page).getByRole('button', { name: download })).toBeVisible();
  await expect(card(page).getByText(/^(Downloaded|Terunduh)$/)).toHaveCount(0);
});

test('a catalogue failure offers retry, and the page does not overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  let fail = true;
  await page.route('**/library/packs/index.json', route => fail ? route.fulfill({ status: 503, body: 'down' }) : route.continue());
  await openFaith(page);
  await expect(page.getByRole('alert').first()).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: /Try again|Coba lagi/ }).click();
  await expect(card(page)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
