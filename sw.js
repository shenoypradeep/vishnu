const CACHE_NAME = 'vedicspace-cache-v6';

// Files to cache immediately on install so both apps work offline
const CORE_ASSETS = [
  '/sadhana.html',
  '/learnvss.html'
];

function shouldHandleRequest(request) {
  if (request.method !== 'GET') {
    return false;
  }

  const url = new URL(request.url);

  // Only cache same-origin static assets
  if (url.origin !== self.location.origin) {
    return false;
  }

  return ['document', 'style', 'script', 'image', 'font', 'audio'].includes(request.destination);
}

// Install event - Cache core HTML files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Clear old caches
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// Fetch event - Smart routing for both apps
self.addEventListener('fetch', (event) => {
  if (!shouldHandleRequest(event.request)) {
    return;
  }

  const url = new URL(event.request.url);

  // 1. Handle HTML Page Navigations (Offline Support)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If offline, check if they wanted learnvss or sadhana
        if (url.pathname.includes('learnvss')) {
          return caches.match('/learnvss.html');
        }
        return caches.match('/sadhana.html');
      })
    );
    return;
  }

  // 2. Handle Static Assets (Images, Audio, Scripts, CSS) -> Cache First strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Optional: return a fallback offline image/asset here if needed
      });
    })
  );
});