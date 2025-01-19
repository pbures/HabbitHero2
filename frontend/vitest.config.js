import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],

  test: {
    globals: true,
    environment: 'jsdom', // Simulates a browser environment
    setupFiles: './vitest.setup.js', // Optional setup file

    
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
});