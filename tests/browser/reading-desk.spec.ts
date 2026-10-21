import { test, expect } from '@playwright/test';

const setEnglish = () => localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en' }));

test('local open-book discovery searches and imports a classic into the React shelf', async ({ page }) => {
  const remoteCatalogRequests: string[] = [];
  page.on('request', request => { if (/openlibrary|gutendex|googleapis|microsoftonline|raw\.githubusercontent/.test(request.url())) remoteCatalogRequests.push(request.url()); });
  await page.addInitScript(setEnglish);
  await page.route('https://raw.githubusercontent.com/GITenberg/**', route => route.fulfill({ contentType: 'text/plain', body: 'Chapter One\n\nA complete classic stays inside Sela.\n\nChapter Two\n\nThe story continues.' }));
  await page.goto('/app/');
  await page.getByRole('link', { name: 'Discover', exact: true }).click();
  const catalog = page.locator('.catalog-explorer');
  await expect(catalog.locator('.catalog-result-card').first()).toBeVisible();
  expect(remoteCatalogRequests).toEqual([]);
  await catalog.getByLabel('Search books', { exact: true }).fill('Walden');
  await catalog.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(catalog.locator('.catalog-result-card')).toHaveCount(1);
  await expect(catalog.locator('.catalog-result-card').first()).toContainText('Walden');
  await catalog.locator('.catalog-result-card').getByRole('button', { name: 'Download & add to shelf', exact: true }).click();
  await expect(page.getByText('1 book added to your shelf.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'My shelf', exact: true }).click();
  await expect(page.locator('.book-card')).toHaveCount(1);
  await page.locator('.book-title-button').click();
  await expect(page.locator('.reader-body')).toContainText('A complete classic stays inside Sela.');
  await page.getByRole('button', { name: 'Back to shelf', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/#\/shelf$/);
});

test('mobile focus timer remains reachable without covering the dock', async ({ page }) => {
  await page.addInitScript(setEnglish);
  await page.goto('/app/');
  const app = page.locator('.sela-app');
  const timer = page.locator('.focus-timer-card');
  const dock = page.locator('.mobile-dock');
  await expect(timer).toBeVisible();
  for (const width of [320, 393, 600]) {
    await page.setViewportSize({ width, height: 852 });
    await timer.scrollIntoViewIfNeeded();
    for (const appearance of ['light', 'dark'] as const) {
      if (await app.getAttribute('data-appearance') !== appearance) {
        await page.getByRole('button', { name: appearance === 'dark' ? 'Switch to dark mode' : 'Switch to light mode', exact: true }).click();
      }
      await expect(app).toHaveAttribute('data-appearance', appearance);
      const layout = await page.evaluate(() => {
        const timer = document.querySelector('.focus-timer-card')!.getBoundingClientRect();
        const dock = document.querySelector('.mobile-dock')!.getBoundingClientRect();
        return { width: document.documentElement.scrollWidth, viewport: innerWidth, timerBottom: timer.bottom, dockTop: dock.top, timerHeight: timer.height };
      });
      expect(layout.width, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(layout.viewport);
      expect(layout.timerHeight).toBeGreaterThan(100);
      expect(layout.timerBottom, `focus timer is covered by navigation at ${width}px`).toBeLessThan(layout.dockTop);
    }
  }
});

test('failed catalog download stays in discovery and never reports a shelf import', async ({ page }) => {
  await page.addInitScript(setEnglish);
  let failedDownloads = 0;
  await page.route(url => url.hostname === 'raw.githubusercontent.com' && /\/gitenberg\/frankenstein_84\/.+\.txt$/i.test(url.pathname), route => {
    failedDownloads += 1;
    return route.fulfill({ status: 503, body: 'Unavailable' });
  });
  await page.goto('/app/#/discover');
  const catalog = page.locator('.catalog-explorer');
  await catalog.getByLabel('Search books', { exact: true }).fill('Frankenstein');
  await catalog.getByRole('button', { name: 'Search', exact: true }).click();
  const result = catalog.locator('.catalog-result-card');
  await expect(result).toHaveCount(1);
  await result.getByRole('button', { name: 'Download & add to shelf', exact: true }).click();
  await expect.poll(() => failedDownloads).toBeGreaterThan(0);
  await expect(catalog.getByRole('alert')).toContainText(/could not|unavailable|failed/i, { timeout: 15000 });
  await page.getByRole('link', { name: 'My shelf', exact: true }).click();
  await expect(page.locator('.book-card')).toHaveCount(0);
});

test('weather requests location only after a user action and keeps city search as a fallback', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('sela:app:preferences')) localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en' }));
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: (_success: unknown, error: (reason: { code: number }) => void) => { (window as any).locationPromptCount = ((window as any).locationPromptCount || 0) + 1; error({ code: 1 }); } } });
  });
  const requests: string[] = [];
  page.on('request', request => { if (/open-meteo/.test(request.url())) requests.push(request.url()); });
  await page.route('https://geocoding-api.open-meteo.com/**', route => route.fulfill({ json: { results: [{ name: 'Yogyakarta', admin1: 'DIY', country: 'Indonesia', latitude: -7.8, longitude: 110.36, timezone: 'Asia/Jakarta' }] } }));
  await page.route('https://api.open-meteo.com/**', route => route.fulfill({ json: { current: { temperature_2m: 27.4, weather_code: 3, is_day: 1 }, timezone: 'Asia/Jakarta' } }));
  await page.goto('/app/#/settings/appearance');
  await page.getByRole('switch', { name: /^Weather/ }).check();
  await page.getByRole('link', { name: 'Today', exact: true }).click();
  const weather = page.locator('.weather-widget');
  await expect(weather).toBeVisible();
  expect(await page.evaluate(() => (window as any).locationPromptCount || 0)).toBe(0);
  expect(requests).toEqual([]);
  await weather.getByRole('button', { name: 'Choose a city', exact: true }).click();
  const locationDialog = page.getByRole('dialog', { name: 'Weather location', exact: true });
  await locationDialog.getByRole('button', { name: 'Use my location', exact: true }).click();
  await expect(locationDialog).toContainText('Location permission was declined');
  expect(await page.evaluate(() => (window as any).locationPromptCount)).toBe(1);
  await locationDialog.getByLabel('Find a city', { exact: true }).fill('Jogja');
  await locationDialog.getByRole('button', { name: 'Search', exact: true }).click();
  await locationDialog.getByRole('button', { name: 'Yogyakarta, DIY, Indonesia', exact: true }).click();
  await expect(weather.locator('.weather-current strong')).toHaveText('27°C');
  await expect(weather.locator('.weather-current span')).toHaveText('Overcast');
  expect(requests.filter(url => url.includes('geocoding-api.open-meteo.com'))).toHaveLength(1);
  expect(requests.filter(url => url.includes('api.open-meteo.com/v1/forecast'))).toHaveLength(1);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('sela:app:preferences') || '{}').widgets?.weather)).toBe(true);
  await page.reload();
  await expect(page.locator('.weather-current strong')).toHaveText('27°C');
  expect(requests.filter(url => url.includes('api.open-meteo.com/v1/forecast'))).toHaveLength(1);
  await page.locator('.weather-widget').getByRole('button', { name: 'Weather settings', exact: true }).click();
  await page.getByRole('dialog', { name: 'Weather location', exact: true }).getByRole('button', { name: 'Remove saved location', exact: true }).click();
  await expect(page.locator('.weather-widget')).toContainText('No location is saved.');
});
