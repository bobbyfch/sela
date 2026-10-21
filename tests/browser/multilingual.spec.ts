import {test,expect} from '@playwright/test';
import {setTopbarLanguage} from './topbar-helpers.ts';

test('React app language switch and public locale selector use their supported choices',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'})));
 await page.goto('/app/');
 await expect(page.locator('.sela-app')).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await expect(page.getByRole('link',{name:'My shelf',exact:true})).toBeVisible();
 await setTopbarLanguage(page,'id');
 await expect(page.locator('html')).toHaveAttribute('lang','id');
 await expect(page.getByRole('link',{name:'Rak buku',exact:true})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sela:app:preferences')||'{}').language)).toBe('id');
 await setTopbarLanguage(page,'en');
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await page.goto('/?geo=off');
 const publicLanguage=page.locator('#language');
 await expect(publicLanguage).toBeVisible();
 await publicLanguage.selectOption('ja-JP');
 await expect(page.locator('html')).toHaveAttribute('lang','ja-JP');
 await publicLanguage.selectOption('id-ID');
 await expect(page.locator('html')).toHaveAttribute('lang','id-ID');
 await expect(page.locator('.hero-copy h1')).not.toHaveText('Your books. Within reach.');
});
