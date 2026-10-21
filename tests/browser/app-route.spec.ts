import {test,expect} from '@playwright/test';

test('the React app owns /app and retired /mobile assets stay absent',async({page,request})=>{
 await page.goto('/app/');
 await expect(page.locator('.sela-app')).toBeVisible();
 await expect(page).toHaveTitle('Sela Books — Your reading room');
 expect(new URL(page.url()).pathname).toBe('/app/');
 const manifestHref=await page.locator('link[rel=manifest]').getAttribute('href');expect(manifestHref).toMatch(/^\.\/manifest\.webmanifest\?v=[^&]+-[a-f0-9]{12}$/);
 const manifestResponse=await request.get('/app/'+manifestHref);expect(manifestResponse.ok()).toBe(true);
 const manifest=await manifestResponse.json();expect(manifest.start_url).toBe('./?installed=1');expect(manifest.scope).toBe('./');expect(manifest.share_target.action).toBe('./share');
 const retiredRoute=await request.get('/mobile/');expect(retiredRoute.status()).toBe(404);
 const retiredManifest=await request.get('/mobile/manifest.webmanifest');expect(retiredManifest.status()).toBe(404);
});
