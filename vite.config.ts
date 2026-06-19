import { defineConfig, type Plugin } from 'vite'
import preact from '@preact/preset-vite'

/** Load the full stylesheet without blocking first paint (critical CSS is inlined in index.html). */
function asyncCss(): Plugin {
  return {
    name: 'async-css',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
        (_match, href: string) =>
          `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">\n` +
          `    <noscript><link rel="stylesheet" href="${href}"></noscript>`,
      )
    },
  }
}

/** Copy PWA assets to dist directory */
function copyPwaAssets(): Plugin {
  return {
    name: 'copy-pwa-assets',
    apply: 'build',
    closeBundle() {
      const fs = require('fs');
      const path = require('path');
      
      // Copy manifest.json
      const manifestSrc = path.resolve(__dirname, 'public/manifest.json');
      const manifestDest = path.resolve(__dirname, 'dist/manifest.json');
      if (fs.existsSync(manifestSrc)) {
        fs.copyFileSync(manifestSrc, manifestDest);
      }
      
      // Copy service worker
      const swSrc = path.resolve(__dirname, 'public/sw.js');
      const swDest = path.resolve(__dirname, 'dist/sw.js');
      if (fs.existsSync(swSrc)) {
        fs.copyFileSync(swSrc, swDest);
      }
    },
  }
}

export default defineConfig({
  plugins: [preact(), asyncCss(), copyPwaAssets()],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/compat/jsx-runtime',
    },
  },
  build: {
    outDir: 'dist',
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-motion', test: /node_modules\/framer-motion/ },
            { name: 'vendor-docx', test: /node_modules\/docx/ },
            { name: 'vendor-confetti', test: /node_modules\/canvas-confetti/ },
            { name: 'vendor-i18n', test: /node_modules\/i18next/ },
          ],
        },
      },
    },
  },
})
