import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'CryptoMonitor - 合约价格监控',
        short_name: 'CryptoMonitor',
        description: '实时监控虚拟货币合约价格，对比 Binance 和 OKX',
        theme_color: '#0b0e11',
        background_color: '#0b0e11',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/crypto-monitor/',
        scope: '/crypto-monitor/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fapi\.binance\.com/,
            handler: 'NetworkFirst',
            options: { cacheName: 'binance-api', expiration: { maxEntries: 10, maxAgeSeconds: 60 } },
          },
          {
            urlPattern: /^https:\/\/www\.okx\.com/,
            handler: 'NetworkFirst',
            options: { cacheName: 'okx-api', expiration: { maxEntries: 10, maxAgeSeconds: 60 } },
          },
        ],
      },
    }),
  ],
  base: '/crypto-monitor/',
})
