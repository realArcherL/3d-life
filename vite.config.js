import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        f1_miami: resolve(__dirname, 'f1-miami.html'),
        triathlon: resolve(__dirname, 'triathlon.html'),
        drawTrack: resolve(__dirname, 'draw-track.html'),
        drawLabels: resolve(__dirname, 'draw-labels.html'),
      },
    },
  },
});
