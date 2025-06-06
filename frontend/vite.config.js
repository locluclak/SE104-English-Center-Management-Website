import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/courses': 'http://localhost:3000',
      '/assignments': 'http://localhost:3000',
      '/documents': 'http://localhost:3000',
      '/person': 'http://localhost:3000',
      '/payment': 'http://localhost:3000',
      '/category': 'http://localhost:3000',
      '/submissions': 'http://localhost:3000',
    }
  }
})
