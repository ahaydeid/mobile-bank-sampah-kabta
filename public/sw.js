const CACHE_NAME = 'bank-sampah-v2';

// Assets to precache on install (app shell)
const PRECACHE_URLS = [
  '/offline',
];

// Install: precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for navigations, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip non-http/https schemes (e.g., chrome-extension://)
  if (!(request.url.startsWith('http:') || request.url.startsWith('https:'))) return;

  // Skip API requests — always go to network
  if (request.url.includes('/api/')) return;

  // Navigation requests (HTML pages): Network-first, fallback to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          // Try cache first, then offline page
          return caches.match(request).then((cached) => {
            return cached || caches.match('/offline');
          });
        })
    );
    return;
  }

  // Static assets (JS, CSS, images): Network-first for dev stability, fallback to cache
  if (
    request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|eot)$/) ||
    request.url.includes('/_next/')
  ) {
    // Skip hot-updates and webpack internals - do not cache
    if (request.url.includes('hot-update') || request.url.includes('webpack')) {
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(request);
        })
    );
    return;
  }
});
