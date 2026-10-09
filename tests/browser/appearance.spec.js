import {test,expect} from '@playwright/test';
test('icon tabs, keyboard navigation and appearance API remain usable on mobile',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto('/?geo=off');await page.evaluate(async()=>{await SelaReady;window.r=new Sela({url:'/example/sela.html',language:'en',mode:'single'});await r.open();await r.showTools();});
 await expect(page.getByRole('tab')).toHaveCount(6);await page.getByRole('tab',{name:'Contents',exact:true}).press('ArrowRight');await expect(page.getByRole('tab',{name:'Find in book',exact:true})).toBeFocused();
 await page.getByRole('tab',{name:'Appearance',exact:true}).click();await expect(page.getByRole('combobox',{name:'Page filter',exact:true}).locator('option')).toHaveCount(12);
 await page.getByRole('combobox',{name:'Page filter',exact:true}).selectOption('night');await page.evaluate(()=>r.setBrightness(.6).setDim(true));
 await expect(page.locator('.library-reader-overlay')).toHaveAttribute('data-dim','true');
 const filter=await page.locator('.flippy-epub-chapter').first().evaluate(el=>getComputedStyle(el).filter);expect(filter).toContain('brightness(0.6)');expect(filter).toContain('invert(0.9)');
 await page.evaluate(()=>r.setFilter('none').setBrightness(1).setDim(false));await expect(page.locator('.library-reader-overlay')).toHaveAttribute('data-dim','false');
 const box=await page.locator('.sela-tools').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(320);
});
test('extension update button links to a validated stable release and handles offline',async({page})=>{
 await page.route('https://api.github.com/repos/bobbyfch/sela/releases/latest',route=>route.fulfill({json:{tag_name:'v1.2.0',html_url:'https://evil.invalid/'}}));await page.goto('/extension/library.html');await page.locator('#check-update').click();await expect(page.locator('#update-link')).toHaveAttribute('href','https://github.com/bobbyfch/sela/releases/tag/v1.2.0');await expect(page.locator('#update-status')).toContainText('1.2.0');
 await page.route('https://api.github.com/repos/bobbyfch/sela/releases/latest',route=>route.abort());await page.locator('#check-update').click();await expect(page.locator('#update-status')).toContainText('Could not check');
});
