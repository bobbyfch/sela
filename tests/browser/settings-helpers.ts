import type {Page} from '@playwright/test';

/** Open one categorized Settings page, returning from another category if needed. */
export async function openSettingsCategory(page:Page,category:string):Promise<void>{
 const settingsTab=page.locator('[data-tab=settings]');
 if(await settingsTab.getAttribute('aria-current')!=='true')await settingsTab.click();
 const categories=page.getByRole('navigation',{name:'Settings categories'});
 if(await categories.isHidden())await page.locator('.settings-detail-back').click();
 await categories.getByRole('button',{name:category,exact:true}).click();
}
