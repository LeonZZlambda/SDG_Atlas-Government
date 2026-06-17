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

export default defineConfig({
  plugins: [preact(), asyncCss()],
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
