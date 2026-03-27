const CACHE_NAME = 'sadhana-cache-v1';

// Install event - basic setup
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Fetch event - Cache First strategy
self.addEventListener('fetch', (event) => {
  // We only care about caching GET requests for images/audio
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If it's in cache, return it immediately
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network, then cache it for next time
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Fallback if offline and not in cache
        return new Response("Offline content not available");
      });
    })
  );
});