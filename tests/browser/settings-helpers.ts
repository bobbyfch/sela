import type {Page} from '@playwright/test';

/** Open one current React Settings detail page from the retired feature label. */
export async function openSettingsCategory(page:Page,category:string):Promise<void>{
 const normalized=category.toLowerCase();
 const section=normalized.includes('appearance')||normalized.includes('palette')||normalized.includes('display')?'appearance'
  :normalized.includes('reading')?'reading'
  :normalized.includes('backup')||normalized.includes('data')?'data'
  :normalized.includes('home')||normalized.includes('personal')||normalized.includes('library')?'library'
  :'library';
 await page.goto(`/app/#/settings/${section}`);
 await page.locator('.settings-detail').waitFor({state:'visible'});
}
