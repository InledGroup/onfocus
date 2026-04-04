import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest.json'
import { resolve } from 'path'

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        blocked: resolve(__dirname, 'src/ui/common/blocked.html'),
        wizard: resolve(__dirname, 'src/ui/wizard/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    hmr: {
      port: 5173,
    },
  },
})