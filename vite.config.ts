import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';

export default defineConfig({
  plugins: [react(), { name: 'extension-manifest', closeBundle() { copyFileSync('manifest.json', 'dist/manifest.json'); } }],
  base: './',
  build: {
    rollupOptions: {
      input: { aquarium: 'index.html', popup: 'popup.html', serviceWorker: 'src/background/serviceWorker.ts' },
      output: { entryFileNames: '[name].js', chunkFileNames: 'assets/[name]-[hash].js' }
    }
  }
});
