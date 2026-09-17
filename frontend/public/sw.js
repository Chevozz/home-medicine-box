// Service Worker for Home Medicine Tracker
// Cache-first strategy with offline fallback

const CACHE_NAME = 'medtracker-v1';
const STATIC_ASSETS = [
  '/',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
});

// Fetch event - cache-first with network fallback
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return response;
      });
    }).catch(() => {
      // Offline fallback - return HTML for routes, image for icons
      if (e.request.headers.get('accept')?.includes('text/html')) {
        return caches.match('/');
      }
      return new Response('', { status: 503 });
    })
  );
});

// Background sync for offline data submission (optional)
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-consumption') {
    e.waitUntil(syncConsumption());
  }
});

async function syncConsumption() {
  // Implementation for syncing consumption data when back online
}
