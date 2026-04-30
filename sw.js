const CACHE_NAME = 'sadhana-cache-v5';

function shouldHandleRequest(request) {
  if (request.method !== 'GET') {
    return false;
  }

  const url = new URL(request.url);

  // Only cache same-origin static assets so navigations and API calls
  // always go to the network and don't get stuck on stale responses.
  if (url.origin !== self.location.origin) {
    return false;
  }

if (request.mode === 'navigate') {
  event.respondWith(fetch(event.request).catch(() => caches.match('/sadhana.html')));
  return;
}

  return ['style', 'script', 'image', 'font', 'audio'].includes(request.destination);
}

// Install event - basic setup
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event - Cache First strategy for static assets only
self.addEventListener('fetch', (event) => {
  if (!shouldHandleRequest(event.request)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If it's in cache, return it immediately
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network, then cache it for next time
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Fallback if offline and not in cache
        return new Response('Offline content not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});
