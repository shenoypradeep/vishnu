self.addEventListener('fetch', function(event) {
  // This is a basic pass-through service worker
  event.respondWith(fetch(event.request));
});