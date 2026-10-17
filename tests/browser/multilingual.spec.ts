import {test,expect} from '@playwright/test';

test('mobile and public language selectors offer the same locales and keep one preference',async({page})=>{
 await page.route('https://date.nager.at/api/v3/PublicHolidays/**',route=>route.fulfill({json:[]}));
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 const mobileLanguage=page.locator('#language');await expect(mobileLanguage.locator('option')).toHaveCount(3);await mobileLanguage.selectOption('ja-JP');
 await expect(page.locator('html')).toHaveAttribute('lang','ja-JP');await expect(page.locator('.settings-page>h2')).toHaveText('設定');await expect.poll(()=>page.evaluate(()=>localStorage.getItem('sela:language'))).toBe('ja-JP');
 await page.goto('/');const publicLanguage=page.locator('#language');await expect(publicLanguage).toBeVisible();await expect(publicLanguage).toHaveValue('ja-JP');await expect(page.locator('html')).toHaveAttribute('lang','ja-JP');
 await publicLanguage.selectOption('id-ID');await expect(page.locator('html')).toHaveAttribute('lang','id-ID');await expect.poll(()=>page.evaluate(()=>localStorage.getItem('sela:language'))).toBe('id-ID');
 await page.goto('/app/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await expect(page.locator('#language')).toHaveValue('id-ID');await expect(page.locator('#books')).toHaveAttribute('aria-label','Pilih berkas buku');await page.locator('#language').selectOption('ja-JP');await expect(page.locator('#books')).toHaveAttribute('aria-label','本のファイルを選択');await page.locator('#language').selectOption('en-US');await expect(page.locator('#books')).toHaveAttribute('aria-label','Choose book files');
});
