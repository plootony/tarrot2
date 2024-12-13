import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/scss/abstracts/_variables.scss";
          @import "@/scss/abstracts/_mixins.scss";
          @import "@/scss/abstracts/_functions.scss";
        `
      }
    }
  }
})
