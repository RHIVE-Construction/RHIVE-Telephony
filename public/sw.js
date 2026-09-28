// RHIVE Telephony Service Worker (v85 - Emergency Cache Buster & Worker Purge)
const CACHE_NAME = 'rhive-telephony-v85';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      console.log('[SW] Purging all legacy and foreign caches...');
      return Promise.all(
        keys.map((key) => {
          console.log('[SW] Deleting cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

// Direct network passthrough: Never serve cached HTML shells
self.addEventListener('fetch', (event) => {
  // Allow all network requests to proceed natively
  return;
});
