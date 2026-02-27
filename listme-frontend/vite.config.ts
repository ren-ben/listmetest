import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const apiTarget = process.env.API_URL || 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Inline the service worker so Vite bundles it correctly
      injectRegister: 'auto',
      workbox: {
        // Cache all static app-shell assets (JS, CSS, HTML, fonts, icons)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // API responses are cached in IndexedDB (Dexie) by the app layer,
        // so we intentionally do NOT add a runtimeCaching rule for /api/**
        // to avoid header-keying issues with X-Device-Id.
        runtimeCaching: [
          {
            // Cache immutable assets from CDN/static with long TTL
            urlPattern: /\.(woff2|png|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
        // Skip waiting so new SW activates immediately
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'ListMe',
        short_name: 'ListMe',
        description: 'Kollaborative Einkaufslisten — offline first',
        theme_color: '#303446',
        background_color: '#232634',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': apiTarget,
      '/ws': {
        target: apiTarget,
        ws: true,
      },
    },
  },
})
