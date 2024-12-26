import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    sourcemap: false,
  },
  server: {
    sourcemap: true, // Enable source maps in development
    sourcemapIgnoreList: (sourcePath) => {
      // Ignore missing source maps for specific packages
      if (sourcePath.includes('auth0/auth0-vue')) {
        return true
      }
      return false
    }
  },
})
