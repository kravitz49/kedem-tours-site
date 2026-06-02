const CACHE = 'kedem-v3';

const STATIC = [
  '/',
  '/index.html',
  '/kabinet.html',
  '/reviews-page.php',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Установка
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

// Активация — чистим старый кэш
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch — сеть первая, при ошибке кэш
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API и PHP — не кэшируем, только сеть
  if (url.pathname.endsWith('.php') ||
      url.pathname.includes('/api/') ||
      url.pathname.includes('settings') ||
      url.pathname.includes('reviews') ||
      url.pathname.includes('orders') ||
      url.pathname.includes('login') ||
      e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request)
        .then(r => r || caches.match('/'))
      )
  );
});

// Push-уведомления
self.addEventListener('push', e => {
  const d = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(d.title || 'Kedem Tours', {
      body:    d.body || 'Новое уведомление',
      icon:    '/icons/icon-192.png',
      badge:   '/icons/icon-72.png',
      vibrate: [200, 100, 200],
      data:    { url: d.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});
