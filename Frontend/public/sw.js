/*
 * AgriScan AI — service worker.
 *
 * Strategy:
 *  - Static assets (JS/CSS bundles, icons, manifest): cache-first,
 *    refreshed in the background so updates land on next load.
 *  - Navigation requests (HTML): network-first with an offline fallback
 *    to the cached index.html, so history still renders offline.
 *  - The ONNX model + onnxruntime wasm glue are pre-cached so the *real*
 *    on-device AI keeps working with zero connectivity (the core of the
 *    offline-first SIH demo).
 *
 * The scan history itself lives in IndexedDB, so it is available offline
 * without any server round-trip.
 */
const CACHE_NAME = 'agriscan-v2'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // On-device AI artefacts (real model + runtime).
  '/models/agriscan-v0.1-demo.onnx',
  '/ort/ort-wasm-simd-threaded.wasm',
  '/ort/ort-wasm-simd-threaded.mjs',
  // Demo-sample set used by the offline demo flow.
  '/demo-samples/manifest.json',
  '/demo-samples/apple_healthy.jpg',
  '/demo-samples/apple_scab.jpg',
  '/demo-samples/maize_healthy.jpg',
  '/demo-samples/maize_leaf_blight.jpg',
  '/demo-samples/potato_early_blight.jpg',
  '/demo-samples/potato_healthy.jpg',
  '/demo-samples/potato_late_blight.jpg',
  '/demo-samples/tomato_early_blight.jpg',
  '/demo-samples/tomato_healthy.jpg',
  '/demo-samples/tomato_late_blight.jpg',
]

// Pre-cache the app shell the moment the SW is installed.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      // Activate immediately instead of waiting for reloads.
      .then(() => self.skipWaiting()),
  )
})

// Remove outdated caches from previous versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only interested in GET requests.
  if (request.method !== 'GET') return

  // Page navigations: try the network, fall back to cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  // Everything else: cache-first with background refresh.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          // Cache only same-origin, successful responses.
          if (response.ok && new URL(request.url).origin === location.origin) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached)

      return cached || network
    }),
  )
})