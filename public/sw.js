// RHIVE Telephony Service Worker (Enables Standalone Native PWA Installation on Android/Pixel 8 Pro)
// Bump version to v81 to eradicate all stale dark-mode caches and force fresh chamfered UI
const CACHE_NAME = 'rhive-telephony-v81';
const ASSETS_TO_CACHE = [
  '/mobile',
  '/dialer',
  '/manifest.json',
  '/rhive-logo-white.png',
  '/rhive-logo-black.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First Strategy: Always fetch fresh code from the server.
// Fall back to cache ONLY when offline or network drops.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Never intercept API requests
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/mobile');
          }
        });
      })
  );
});
