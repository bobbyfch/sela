import {test,expect} from '@playwright/test';

test('reader page materials sit with page filters and persist independently of app palettes',async({page})=>{
 await page.goto('/');
 await page.evaluate(async()=>{const {default:Sela}=await import('/dist/js/sela.esm.js');const viewer=new Sela({format:'txt',language:'en',theme:'light',pageSurface:'oak',persistPreferences:false});(window as any).__surfaceReader=viewer;await viewer.open(new Blob(['A quiet page with warm paper.'],{type:'text/plain'}));viewer.overlay?.querySelector('[aria-label="Reader settings"]')?.click();});
 const overlay=page.locator('.library-reader-overlay').last(),surface=overlay.getByLabel('Page material');await expect(surface).toBeVisible();await expect(surface).toHaveValue('oak');
 const filter=overlay.getByLabel('Page filter');await expect(filter).toBeVisible();const order=await overlay.locator('select[aria-label="Page filter"],select[aria-label="Page material"]').evaluateAll(elements=>elements.map(element=>element.getAttribute('aria-label')));expect(order).toEqual(['Page filter','Page material']);
 await surface.selectOption('walnut');await expect(overlay).toHaveAttribute('data-page-surface','walnut');
 await page.evaluate(()=>{(window as any).__surfaceReader?.destroy();delete (window as any).__surfaceReader;});
});
