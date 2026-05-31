/**
 * Hook pentru inițializare Web Push Notifications
 * Rulează o singură dată la mount
 */

import { useEffect, useRef } from 'react';
import { registerServiceWorkerAndSubscribe, isPushNotificationSupported } from '@/utils/pushNotifications';

export function usePushNotificationsInit() {
  const initRef = useRef(false);

  useEffect(() => {
    // Evita la doppia inizializzazione in strict mode
    if (initRef.current) return;
    initRef.current = true;

    if (!isPushNotificationSupported()) {
      console.log('[Push] Push notifications not supported in this browser');
      return;
    }

    // Inizializza le notifiche push con un piccolo ritardo
    const timer = setTimeout(async () => {
      try {
        const subscription = await registerServiceWorkerAndSubscribe();
        if (subscription) {
          console.log('[Push] Successfully initialized push notifications');
          // Puoi inviare l'abbonamento al backend se vuoi
        } else {
          console.log('[Push] User denied push notification permission');
        }
      } catch (error) {
        console.error('[Push] Initialization error:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
}
