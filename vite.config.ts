import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  plugins: [react()],
  build: {
    target: 'es2022',
    outDir: '.build/app',
    lib: { entry: 'app/mobile/react-app.tsx', formats: ['es'], fileName: () => 'app.js' },
    minify: true,
    // Native controllers and the universal SDK retain their published asset URLs.
    rolldownOptions: { external: id => /(?:library|dist\/js)\/.*\.js$/.test(id) },
  },
});
