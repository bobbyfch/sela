import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 45000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', headless: true, serviceWorkers: 'block' },
  projects: [
    {name:'chromium',use:{browserName:'chromium',launchOptions:!process.env.CI&&existsSync(edge)?{executablePath:edge}:{}}},
    {name:'firefox',use:{browserName:'firefox'}},
    {name:'webkit',use:{browserName:'webkit'}}
  ],
  webServer: { command: 'node scripts/serve.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
  reporter: [['list']],
});
