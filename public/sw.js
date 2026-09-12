// YAADRI offline core service worker (prototype).
// Caches the app shell for offline reload. This is a minimal, honest
// implementation: it does NOT implement background sync, push, or
// encrypted storage. Media/data persistence is handled separately via
// IndexedDB in src/lib/db.ts, not through this cache.
const CACHE_NAME = 'yaadri-shell-v1'
const SHELL = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {})
          return res
        })
        .catch(() => cached || new Response('Offline and not cached', { status: 503 }))
    })
  )
})
