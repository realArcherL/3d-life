import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        drawTrack: resolve(__dirname, 'draw-track.html'),
        drawLabels: resolve(__dirname, 'draw-labels.html'),
      },
    },
  },
});
