/**
 * Service Worker - PWA Support & Offline Mode
 * Caches assets for offline access and improves performance
 */

const CACHE_NAME = 'decor-carpi-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.log('[SW] Cache error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls - always fetch from network
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // For static assets, use cache-first strategy
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok && request.method === 'GET') {
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(request, response.clone()));
        }
        return response;
      });
    })
  );
});

// Message event - skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Web Push Notifications ─────────────────────────────────────────────────

// Event: Push Notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);

  if (!event.data) {
    console.log('[SW] No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Push data:', data);

    const options = {
      body: data.body || 'Nuova notifica',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      tag: data.tag || 'default',
      data: {
        type: data.type || 'general_update',
        ...data.data,
      },
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Notificare', options)
    );
  } catch (error) {
    console.error('[SW] Error processing push notification:', error);
    event.waitUntil(
      self.registration.showNotification('Nuova notifica', {
        body: 'Hai una nuova notifica',
        icon: '/icon-192x192.png',
      })
    );
  }
});

// Event: Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);

  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;

  if (action === 'close') {
    console.log('[SW] Notification closed by user');
    return;
  }

  const urlToOpen = getUrlForNotificationType(data.type, data);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Event: Notification Close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

/**
 * Obține URL-ul corespunzător tipului de notificare
 */
function getUrlForNotificationType(type, data) {
  const baseUrl = self.location.origin;

  switch (type) {
    case 'contact_response':
      return `${baseUrl}/?section=contact`;
    case 'preventivo_accepted':
      return `${baseUrl}/preventives`;
    case 'preventivo_rejected':
      return `${baseUrl}/preventives`;
    case 'general_update':
      return baseUrl;
    default:
      return baseUrl;
  }
}
