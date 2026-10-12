import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  srcDir: './web/',
  outDir: './.build/site/',
  publicDir: './web/public/',
  output: 'static',
  integrations: [react()],
  build: { format: 'directory' },
});
