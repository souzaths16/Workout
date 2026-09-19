import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  base: '/Workout/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Treino',
        short_name: 'Treino',
        description: 'Programa de força para hipertrofia, baseado em evidências em mulheres.',
        lang: 'pt-BR',
        start_url: '/Workout/',
        scope: '/Workout/',
        display: 'standalone',
        background_color: '#0f0f12',
        theme_color: '#0f0f12',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] }
    })
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { rollupOptions: { output: { manualChunks: { recharts: ['recharts'] } } } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] }
} as Parameters<typeof defineConfig>[0])
