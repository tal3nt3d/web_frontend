import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest:{
        name: "EleCalc",
        short_name: "EleCalc",
        start_url: "/web_frontend/",
        display: "standalone",
        background_color: "#fdfdfd",
        theme_color: "#db4938",
        orientation: "portrait-primary",
        icons: [
          {
            "src": "small_logo512x512.png",
            "type": "image/png", "sizes": "192x192"
          },
          {
            "src": "small_logo512x512.png",
            "type": "image/png", "sizes": "512x512"
          }
        ],
      }
    })
  ],
  base: '/',
  server: {
    watch: {
        usePolling: true,
    }, 
    strictPort: true,
    port: 3000,
    proxy: {
      "/api": {
        target: "http://172.27.61.159:8080",
        changeOrigin: true,
        secure: false,
        //rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});