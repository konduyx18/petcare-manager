import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // Use custom service worker with push handling
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      
      // Manifest configuration
      manifest: {
        name: 'PetCare Manager',
        short_name: 'PetCare',
        description: 'Never miss a vaccine or run out of pet supplies',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        // TODO: Replace with custom pet-themed PNG icons later:
        //   - public/icon-192.png (192x192 pixels)
        //   - public/icon-512.png (512x512 pixels)
        // TEMPORARY: Use vite.svg until we create proper PNG icons
        icons: [
          {
            src: '/vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      
      // Workbox configuration for caching
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/node_modules/**/*', '**/sw.js', '**/workbox-*.js']
      },
      
      // Enable in development for testing
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
