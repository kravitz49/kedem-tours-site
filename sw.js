const CACHE = 'kedem-v1';
const OFFLINE_URL = '/kabinet.php';

const ASSETS = [
  '/kabinet.php',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Open+Sans:wght@400;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// Установка — кэшируем основные файлы
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Активация — удаляем старый кэш
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — сначала сеть, при ошибке — кэш
self.addEventListener('fetch', e => {
  // API-запросы не кэшируем
  if (e.request.url.includes('/api/') ||
      e.request.url.includes('.php') ||
      e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match(OFFLINE_URL)))
  );
});

// Push-уведомления (для будущего использования)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Kedem Tours', body: 'Новое уведомление' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'Kedem Tours', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/kabinet.php' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/kabinet.php'));
});
