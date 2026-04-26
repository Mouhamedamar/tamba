const CACHE_NAME = 'tamba-politique-v1'
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
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
  const { request } = event
  const url = new URL(request.url)

  // Ne pas intercepter les requetes POST, API, ou non-GET
  if (request.method !== 'GET') return
  if (url.pathname.startsWith('/api/')) return

  // Network First pour les pages HTML
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return res
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // Cache First pour les assets statiques
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((res) => {
        if (res.ok && res.status === 200) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return res
      }).catch(() => cached)
    })
  )
})
