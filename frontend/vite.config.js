import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  server: {
    https: true
  },
  plugins: [
    mkcert(),
    vue(),
    VitePWA({
      registerType: 'autoUpdate', 
      devOptions: { enabled: true },
      manifest: {
        name: "My Vue PWA",
        short_name: "VuePWA",
        description: "A Vue 3 Progressive Web App",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#42b883",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,webp,woff2}"]
      //   runtimeCaching: [
      //     {
      //       urlPattern: /^https:\/\/your-api-url\.com\/.*/, // Cache API responses
      //       handler: 'NetworkFirst',
      //       options: {
      //         cacheName: 'api-cache',
      //         expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
      //       }
      //     },
      //     {
      //       urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/, // Cache Google Fonts
      //       handler: 'CacheFirst',
      //       options: {
      //         cacheName: 'google-fonts',
      //         expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 }
      //       }
      //     }
      //   ]
      }
    })
  ]
})
