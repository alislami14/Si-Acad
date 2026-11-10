// SI-Acad Service Worker for Web Push & Notifications
const CACHE_NAME = 'si-acad-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification received
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'SI-Acad Notifikasi';
    const options = {
      body: data.body || 'Kamu memiliki pengingat akademik baru.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: {
        url: data.action_url || data.url || '/',
        id: data.id,
        type: data.notification_type,
      },
      vibrate: [100, 50, 100],
      tag: data.tag || 'si-acad-notification',
      renotify: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('SI-Acad Notifikasi', {
        body: text,
        icon: '/favicon.svg',
        data: { url: '/' },
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

