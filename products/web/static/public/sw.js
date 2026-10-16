// Map2Online service worker.
// - the app shell works offline (network first for the page, cache first for
//   hashed assets);
// - tiles from our own tile servers are kept in a capped cache so recently
//   viewed areas render without a connection. Third-party maps (Google,
//   Yandex, OpenStreetMap) are never cached: their terms forbid it.
const VERSION = 'v1';
const SHELL = `map2online-shell-${VERSION}`;
const TILES = 'map2online-tiles';
const OWN_TILES = /^https:\/\/tiles-proxy-[a-z]\.s4y\.solutions\//;
const MAX_TILES = 5000;
let tilesAdded = 0;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(['./', './manifest.webmanifest', './icons/icon-192.png'])));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('map2online-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const networkFirst = async (request, fallback) => {
  const cache = await caches.open(SHELL);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(fallback || request, response.clone());
    return response;
  } catch (e) {
    const cached = await cache.match(fallback || request);
    if (cached) return cached;
    throw e;
  }
};

const cacheFirst = async (cacheName, request, onStore) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    await cache.put(request, response.clone());
    if (onStore) onStore(cache);
  }
  return response;
};

// oldest entries go first; checked every 200 stored tiles
const trimTiles = async (cache) => {
  if (++tilesAdded % 200 !== 0) return;
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_TILES)).map((k) => cache.delete(k)));
};

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './'));
  } else if (url.origin === self.location.origin) {
    event.respondWith(url.pathname.includes('/assets/') ? cacheFirst(SHELL, request) : networkFirst(request));
  } else if (OWN_TILES.test(request.url)) {
    event.respondWith(cacheFirst(TILES, request, trimTiles));
  }
});
