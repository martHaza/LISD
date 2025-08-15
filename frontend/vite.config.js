import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  base: '/lisd/',
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
        name: "LISD",
        short_name: "LISD",
        description: "Laboratory Inventory System Development",
        start_url: "/lisd/",
        scope: "/lisd/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#42b883",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,png,svg,webp,woff2}"],
        navigateFallback: '/lisd/index.html',        
    navigateFallbackAllowlist: [
      /^\/lisd\/.*/                              
    ]
      }
    })
  ]
})
