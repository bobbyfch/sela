import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
// This host's global Firefox executable failed to launch. Prefer the verified isolated
// copy when present; CI and other machines use Playwright's normal installation.
const localFirefox=resolve('.build/browser-cache/firefox-1555/firefox/firefox.exe');
export default defineConfig({
  testDir: './tests/browser',
  timeout: 45000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', headless: true, serviceWorkers: 'block' },
  projects: [
    {name:'chromium',use:{browserName:'chromium',launchOptions:!process.env.CI&&existsSync(edge)?{executablePath:edge}:{}}},
    {name:'firefox',use:{browserName:'firefox',launchOptions:!process.env.CI&&existsSync(localFirefox)?{executablePath:localFirefox}:{}}},
    {name:'webkit',use:{browserName:'webkit'}}
  ],
  webServer: { command: 'node --experimental-strip-types scripts/serve.ts', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
  reporter: process.env.GITHUB_ACTIONS ? [['github'],['list']] : [['list']],
});
