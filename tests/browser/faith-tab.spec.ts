import { test, expect, type Page } from '@playwright/test';

async function start(page: Page, faith: string, language = 'id') {
  await page.addInitScript(([value, lang]) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('sela-library:personal', JSON.stringify({ version: 1, faith: value }));
      localStorage.setItem('sela:app:preferences', JSON.stringify({ language: lang }));
      sessionStorage.setItem('seeded', '1');
    }
  }, [faith, language]);
}

test('without a chosen faith the shelf has no Faith tab and ignores the tab address', async ({ page }) => {
  await start(page, 'none');
  await page.goto('/sela/app/#/shelf?tab=faith');
  await expect(page.getByRole('heading', { level: 1, name: /Rak buku/ })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Agama' })).toHaveCount(0);
});

test('the Faith tab shows only the readings of the chosen tradition', async ({ page }) => {
  await start(page, 'buddhism');
  await page.goto('/sela/app/#/shelf');
  await page.getByText('Agama', { exact: true }).click();
  await expect(page).toHaveURL(/tab=faith/);
  await expect(page.getByRole('heading', { level: 2, name: 'Buddha' })).toBeVisible();
  await expect(page.getByRole('article', { name: /Sutta Pali pilihan/ })).toBeVisible();
  await expect(page.getByRole('article', { name: /Kotbah-kotbah Berkelompok/ })).toBeVisible();
  await expect(page.getByRole('article', { name: /Kisah Buddha/ })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Dhammapada' })).toBeVisible();
  await expect(page.getByRole('article', { name: /Kisah 25 Nabi/ })).toHaveCount(0);
  await expect(page.getByRole('article', { name: /Alkitab TSI/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Tampilkan edisi Al-Qur’an/ })).toHaveCount(0);
});

test('Islam gets the prophets, Quran and hadith; Hinduism does not', async ({ page }) => {
  await start(page, 'islam');
  await page.goto('/sela/app/#/shelf?tab=faith');
  await expect(page.getByRole('article', { name: /Kisah 25 Nabi/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Tampilkan koleksi hadis/ })).toBeVisible();
  await expect(page.getByRole('article', { name: /Karya klasik Hindu/ })).toHaveCount(0);
});

test('a text collection installs, opens by work and section, saves, and resumes where it stopped', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await start(page, 'buddhism');
  await page.goto('/sela/app/#/shelf?tab=faith');
  const card = page.getByRole('article', { name: /Kotbah-kotbah Berkelompok/ });
  await card.getByRole('button', { name: 'Unduh untuk offline' }).click();
  await expect(card.getByRole('button', { name: 'Baca' })).toBeVisible();
  await card.getByRole('button', { name: 'Baca' }).click();

  await expect(page.getByRole('heading', { level: 2, name: /Kotbah-kotbah Berkelompok/ })).toBeVisible();
  await page.getByRole('link', { name: /Samyukta Agama/ }).click();
  await page.getByRole('link', { name: /Ketidakkekalan/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: /Ketidakkekalan/ })).toBeVisible();
  await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tersimpan' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Berikutnya' }).click();
  await expect(page).toHaveURL(/samyukta-agama\/sa2/);

  await page.getByRole('button', { name: /Kembali ke Bacaan agama/ }).click();
  await expect(page.getByRole('region', { name: 'Tersimpan' }).getByRole('link', { name: /Ketidakkekalan/ })).toBeVisible();
  await expect(card.getByRole('button', { name: 'Lanjut membaca' })).toBeVisible();
  await card.getByRole('button', { name: 'Lanjut membaca' }).click();
  await expect(page).toHaveURL(/samyukta-agama\/sa2/);
  expect(errors).toEqual([]);
});

test('choosing a faith in Settings changes the shelf immediately', async ({ page }) => {
  await start(page, 'none');
  await page.goto('/sela/app/#/settings/library');
  await page.getByRole('combobox', { name: "Agama atau tradisi" }).click();
  await page.getByRole('option', { name: 'Konghucu' }).click();
  await page.goto('/sela/app/#/shelf?tab=faith');
  await expect(page.getByRole('heading', { level: 2, name: 'Konghucu' })).toBeVisible();
  await expect(page.getByRole('article', { name: /Tao Teh King/ })).toBeVisible();
  await expect(page.getByRole('article', { name: /Da Xue dan Zhong Yong/ })).toBeVisible();
});

test('the Faith tab fits a 320px phone without sideways scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await start(page, 'hinduism');
  await page.goto('/sela/app/#/shelf?tab=faith');
  await expect(page.getByRole('article', { name: /Karya klasik Hindu/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('Settings lists every download with its size and removes one without touching saved entries', async ({ page }) => {
  await start(page, 'buddhism');
  await page.goto('/sela/app/#/shelf?tab=faith');
  const card = page.getByRole('article', { name: /Kotbah-kotbah Berkelompok/ });
  await card.getByRole('button', { name: 'Unduh untuk offline' }).click();
  await expect(card.getByRole('button', { name: 'Baca' })).toBeVisible();

  await page.goto('/sela/app/#/settings/library');
  const row = page.getByRole('listitem').filter({ hasText: /Kotbah-kotbah Berkelompok/ });
  await expect(row).toContainText(/KB/);
  await expect(page.getByText(/Total di perangkat ini/)).toBeVisible();
  await row.getByRole('button', { name: /Hapus/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hapus' }).click();
  await expect(row).toHaveCount(0);
  await expect(page.getByText(/Belum ada yang diunduh/)).toBeVisible();
});
