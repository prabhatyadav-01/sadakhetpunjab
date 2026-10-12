import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(source)) return;
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  const files = fs.readdirSync(source, { withFileTypes: true });
  for (const file of files) {
    const curSource = path.join(source, file.name);
    const curTarget = path.join(target, file.name);
    if (file.isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'copy-video-assets',
      closeBundle() {
        const rootVideo = path.resolve(__dirname, 'video');
        const distVideo = path.resolve(__dirname, 'dist/video');
        copyFolderRecursiveSync(rootVideo, distVideo);
      },
    },
  ],
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

