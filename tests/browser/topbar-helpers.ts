import type { Page } from '@playwright/test';

export async function setTopbarAppearance(page: Page, appearance: 'light' | 'dark' | 'oled') {
  await page.getByRole('button', { name: /^(Display settings|Pengaturan tampilan)$/ }).click();
  const label = appearance === 'light' ? /^(Light|Terang)$/ : appearance === 'dark' ? /^(Dark|Gelap)$/ : /^OLED$/;
  await page.getByRole('menuitem', { name: label }).click();
}

export async function setTopbarLanguage(page: Page, language: 'en' | 'id') {
  await page.getByRole('button', { name: /^(Choose language|Pilih bahasa)$/ }).click();
  await page.getByRole('menuitem', { name: language === 'id' ? 'Bahasa Indonesia' : 'English' }).click();
}
