// Keeps the app shell and the 3D libraries cached so the app opens fast.
// Map tiles are never cached here; Cesium manages those in memory.
const SHELL = 'coastwalk-shell-v4';
const SHELL_FILES = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const sameOrigin = url.origin === self.location.origin;
  const isLib = url.hostname === 'cdn.jsdelivr.net' && /\/(cesium|three)@/.test(url.pathname) && !/\/Assets\/|\/Workers\//.test(url.pathname);
  if (!sameOrigin && !isLib) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
