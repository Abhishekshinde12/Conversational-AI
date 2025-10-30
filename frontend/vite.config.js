import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
// here we can remove the proxy as we have already setted up CORS
// but just letting it keep
export default defineConfig({
  plugins: [react(), tailwindcss()],
    server: {
    proxy: {
      '/auth': { // Proxy requests starting with /auth
        target: 'http://localhost:8000', // Your Django backend URL
        changeOrigin: true, // Needed for virtual hosting
        secure: false, // Don't check SSL certs for local development
      },
    }
  }
})
