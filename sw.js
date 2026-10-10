const CACHE_NAME = 'fastsite-v1';
const CORE_ASSETS = ['./','./index.html','./lab.html','./assets/style.css','./assets/app.js','./manifest.webmanifest'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('fastsite-') && k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
  const req = event.request; if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {}); return res; }).catch(async () => { const c = await caches.open(CACHE_NAME); return (await c.match(req)) || (await c.match('./index.html')) || Response.error(); }));
    return;
  }
  event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {}); } return res; })));
});
