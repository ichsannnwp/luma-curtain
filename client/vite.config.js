
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'lumacurtainclient-production.up.railway.app'
    ],
    proxy: {
      '/api': 'http://127.0.0.1:3001'
    }
  },

  preview: {
    host: '0.0.0.0',
    allowedHosts: [
      'lumacurtainclient-production.up.railway.app'
    ]
  },

  build: {
    outDir: '../../dist/client',
    emptyOutDir: true
  }
})
