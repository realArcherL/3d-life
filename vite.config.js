import { defineConfig } from 'vite';
import { resolve } from 'path';

const pagesRoot = resolve(__dirname, 'src/pages');

export default defineConfig({
  root: pagesRoot,
  base: './',
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(pagesRoot, 'index.html'),
        f1_miami: resolve(pagesRoot, 'f1-miami.html'),
        triathlon: resolve(pagesRoot, 'triathlon.html'),
        raceEngineering: resolve(pagesRoot, 'race-engineering.html'),
        drawTrack: resolve(pagesRoot, 'draw-track.html'),
        drawLabels: resolve(pagesRoot, 'draw-labels.html'),
      },
    },
  },
});
