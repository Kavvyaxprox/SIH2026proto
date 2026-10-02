import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// onnxruntime-web's "simd-threaded" wasm build uses SharedArrayBuffer, which
// requires cross-origin isolation. "credentialless" COEP keeps cross-origin
// requests (Open-Meteo, OSM tiles) working without embedding headers on them.
const crossOriginIsolation = () => ({
  name: 'cross-origin-isolation',
  configurePreviewServer(server) {
    server.middlewares.use((_req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless')
      next()
    })
  },
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless')
      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), crossOriginIsolation()],
})