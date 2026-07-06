import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = {
  target: 'http://109.68.213.17',
  changeOrigin: true,
  cookieDomainRewrite: 'localhost',
  proxyTimeout: 0,
  timeout: 0,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': apiTarget,
      '/users': apiTarget,
      '/workspaces': apiTarget,
      '/tasks': apiTarget,
      '/comments': apiTarget,
      '/notifications': apiTarget,
    },
  },
})