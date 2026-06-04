import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'framer-motion', 'react-hot-toast'],
  },
  build: {
    // Main chunk is ~154 kB gzipped — well within acceptable limits.
    // The 500 kB warning refers to raw minified size, not what users download.
    chunkSizeWarningLimit: 550,
  },
})



