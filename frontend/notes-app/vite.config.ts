import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy requests that start with '/api'
      '/api': {
        target: 'http://localhost:8000', // Your FastAPI server address
        changeOrigin: true,              // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove '/api' prefix when forwarding
      },
    },
  },
})
