import { test, expect } from '@playwright/test';

async function start(page: import('@playwright/test').Page) {
  await page.addInitScript(() => localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en', appearance: 'light' })));
  await page.goto('/app/#/discover');
  await expect(page.locator('.catalog-explorer')).toBeVisible();
}

test('Taman Bacaan searches its local catalogue and keeps source browsing in Discover', async ({ page }) => {
  await start(page);
  await expect(page.getByRole('heading', { name: 'Taman Bacaan', level: 1 })).toBeVisible();
  await expect(page.locator('.reading-garden-card')).toHaveCount(8);
  await expect(page.getByText('Translations load from QuranEnc when you open a surah; they are not bundled for offline use.')).toBeVisible();
  const search = page.getByRole('textbox', { name: 'Search Taman Bacaan' });
  await search.fill('Bhikkhu Sujato');
  await expect(page.locator('.reading-garden-card')).toHaveCount(1);
  await expect(page.locator('.reading-garden-card').first()).toContainText('Dhammapada');
  await search.clear();

  await page.getByRole('combobox', { name: 'Availability' }).click();
  await page.getByRole('option', { name: 'Metadata only' }).click();
  await expect(page.locator('.reading-garden-card')).toHaveCount(1);
  const classics = page.locator('.reading-garden-card').filter({ hasText: 'SELA Picks · world classics' });
  await expect(classics).toContainText('227 records');
  await expect(classics).toContainText('Gutenberg status varies by country');
  await classics.getByRole('button', { name: 'Browse 227 titles' }).click();

  await expect(page.getByRole('heading', { name: 'Find your next read.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Browse sources' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.catalog-source-card').filter({ hasText: 'Sela picks' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.catalog-results-context')).toContainText('227 books');
  await page.getByRole('button', { name: 'Taman Bacaan' }).first().click();
  await expect(page.getByRole('heading', { name: 'Taman Bacaan', level: 1 })).toBeVisible();
});

test('an included edition opens its source-attributed chapter browser without a text download action', async ({ page }) => {
  await start(page);
  const dhammapada = page.locator('.reading-garden-card').filter({ hasText: 'Dhammapada' });
  await dhammapada.getByRole('button', { name: 'Browse Dhammapada' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('CC0 1.0');
  await expect(dialog).toContainText('Included with Sela. In the installed app, browse once online before using it offline.');
  await expect(dialog.getByRole('link', { name: 'Open original source' })).toHaveAttribute('href', 'https://suttacentral.net/edition/dhp/en/sujato');
  await expect(dialog.getByRole('combobox', { name: 'Chapter' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Open in Sela' })).toBeEnabled();
});

test('Taman Bacaan remains inside the viewport at phone, tablet, and desktop widths', async ({ page }, testInfo) => {
  await start(page);
  for (const width of [320, 375, 414, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('heading', { name: 'Taman Bacaan', level: 1 })).toBeVisible();
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, content: document.querySelector('.reading-garden')?.scrollWidth || 0 }));
    expect(dimensions.document, `document overflow at ${width}px`).toBeLessThanOrEqual(width);
    expect(dimensions.content, `reading garden overflow at ${width}px`).toBeLessThanOrEqual(width);
    if (width === 375 || width === 1440) {
      await page.screenshot({ path: testInfo.outputPath(`taman-bacaan-${width}.png`), fullPage: true });
    }
  }
});
