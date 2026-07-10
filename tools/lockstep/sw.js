const CACHE = 'lockstep-runtime-v1';
const SCOPE = '/tools/lockstep/';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('lockstep-runtime-') && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(async response => {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match(`${SCOPE}`))));
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(async response => {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
    return response;
  })));
});
