import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    host: 'localhost',
  },
  preview: {
    port: 4173,
    open: true,
    host: 'localhost',
  },
  build: {
    assetsInlineLimit: 4096,
    sourcemap: false,
    cssMinify: true,
    minify: 'esbuild',
  },
});
