import {test,expect} from '@playwright/test';

test('the app is served at /app and the old /mobile route points installs and canonical links to it',async({page,request})=>{
 await page.goto('/app/');
 await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://bobbyfch.github.io/sela/app/');
 const manifestHref=await page.locator('link[rel=manifest]').getAttribute('href');expect(manifestHref).toMatch(/^manifest\.webmanifest\?v=[^&]+-[a-f0-9]{12}$/);
 const manifestResponse=await request.get('/app/'+manifestHref);expect(manifestResponse.ok()).toBe(true);
 const manifest=await manifestResponse.json();expect(manifest.start_url).toBe('./?installed=1');expect(manifest.scope).toBe('./');expect(manifest.share_target.action).toBe('./share');
 await page.goto('/mobile/');
 await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://bobbyfch.github.io/sela/app/');
 const legacyManifestHref=await page.locator('link[rel=manifest]').getAttribute('href');expect(legacyManifestHref).toBe('../app/'+manifestHref);
});
