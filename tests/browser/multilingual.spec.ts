import {test,expect} from '@playwright/test';

test('mobile and public language selectors offer the same locales and keep one preference',async({page})=>{
 await page.route('https://date.nager.at/api/v3/PublicHolidays/**',route=>route.fulfill({json:[]}));
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 const mobileLanguage=page.locator('#language');await expect(mobileLanguage.locator('option')).toHaveCount(10);await mobileLanguage.selectOption('ja-JP');
 await expect(page.locator('html')).toHaveAttribute('lang','ja-JP');await expect(page.locator('.settings-page>h2')).toHaveText('設定');await expect.poll(()=>page.evaluate(()=>localStorage.getItem('sela:language'))).toBe('ja-JP');
 await page.goto('/');const publicLanguage=page.locator('#language');await expect(publicLanguage).toBeVisible();await expect(publicLanguage).toHaveValue('ja-JP');await expect(page.locator('html')).toHaveAttribute('lang','ja-JP');
 await publicLanguage.selectOption('es-ES');await expect(page.locator('html')).toHaveAttribute('lang','es-ES');await expect.poll(()=>page.evaluate(()=>localStorage.getItem('sela:language'))).toBe('es-ES');
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await expect(page.locator('#language')).toHaveValue('es-ES');
});
