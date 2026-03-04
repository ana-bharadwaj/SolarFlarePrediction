import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxies /api/* → Flask server on :5000
// When your Flask API is running, the frontend just calls fetch('/api/predict')
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
