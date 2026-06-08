import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/compat/jsx-runtime',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/framer-motion'))  return 'vendor-motion';
          if (id.includes('node_modules/docx'))           return 'vendor-docx';
          if (id.includes('node_modules/canvas-confetti')) return 'vendor-confetti';
          if (id.includes('node_modules/i18next'))        return 'vendor-i18n';
        },
      },
    },
  },
})

