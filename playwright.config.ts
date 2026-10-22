import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Use an optional isolated Firefox executable when configured; otherwise use Playwright's installation.
const localFirefox=process.env.PLAYWRIGHT_FIREFOX_EXECUTABLE_PATH||resolve('.build/browser-cache/firefox-1555/firefox/firefox.exe');
export default defineConfig({
  testDir: './tests/browser',
  timeout: 45000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', headless: true, serviceWorkers: 'block' },
  projects: [
    {name:'chromium',testIgnore:'**/pwa-*.spec.ts',use:{browserName:'chromium',launchOptions:!process.env.CI&&process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}}},
    {name:'firefox',testIgnore:'**/pwa-*.spec.ts',use:{browserName:'firefox',launchOptions:!process.env.CI&&existsSync(localFirefox)?{executablePath:localFirefox}:{}}},
    {name:'webkit',testIgnore:'**/pwa-*.spec.ts',use:{browserName:'webkit'}},
    {name:'chromium-pwa',testMatch:'**/pwa-*.spec.ts',use:{browserName:'chromium',serviceWorkers:'allow'}}
  ],
  webServer: { command: 'node --experimental-strip-types scripts/serve.ts', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
  reporter: process.env.GITHUB_ACTIONS ? [['github'],['list']] : [['list']],
});
