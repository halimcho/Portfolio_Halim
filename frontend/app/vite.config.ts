import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  root: resolve(__dirname, 'client'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client', 'src'),
      '@shared': resolve(__dirname, 'shared'),
      '@assets': resolve(__dirname, 'attached_assets'),
    },
  },
  publicDir: resolve(__dirname, 'client', 'public'),
  server: { host: true, port: 5173, fs: { strict: false, deny: ['**/.*'] } },
  build: { outDir: resolve(__dirname, 'client_dist'), emptyOutDir: true },
})
