import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev-only API proxy target. Keeping the browser on the Vite origin makes the
// HttpOnly session cookies first-party and removes the local CORS requirement.
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080'

const apiProxy = {
  target: apiProxyTarget,
  changeOrigin: true,
  secure: false,
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind all interfaces so the sandbox/preview host can reach the dev server.
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: true,
    proxy: {
      '/api': apiProxy,
      // Host API paths that must not collide with the /host SPA routes.
      '/host/create': apiProxy,
      '/host/update': apiProxy,
      '/host/email': apiProxy,
      '/host/phone': apiProxy,
    },
  },
  preview: { host: '0.0.0.0', allowedHosts: true },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
