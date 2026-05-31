/**
 * useServiceWorker Hook - Register and manage service worker
 */

import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] Registered successfully:', registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, notify user
                  console.log('[SW] New version available');
                  // You can show a toast notification here
                }
              });
            }
          });
        })
        .catch((err) => {
          console.error('[SW] Registration failed:', err);
        });
    }
  }, []);
}
