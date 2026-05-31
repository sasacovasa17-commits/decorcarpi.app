/**
 * Web Push Notifications Utilities
 * Integrare Web Push API cu service worker
 */

/**
 * Tipuri de notificări push
 */
export type PushNotificationType = 'contact_response' | 'preventivo_accepted' | 'preventivo_rejected' | 'general_update';

/**
 * Interfață pentru Notifica push
 */
export interface PushNotificationPayload {
  type: PushNotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

/**
 * Verifica dacă browserul suportă Web Push
 */
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Cere permisiune pentru notificări
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return Notification.requestPermission();
  }

  return 'denied';
}

/**
 * Registra service worker și subscribe la push notifications
 */
export async function registerServiceWorkerAndSubscribe(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    // Registra service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[Push] Service Worker registered:', registration);

    // Cere permisiune
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('[Push] Permission denied');
      return null;
    }

    // Subscribe la push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
    });

    console.log('[Push] Subscribed to push notifications:', subscription);
    return subscription;
  } catch (error) {
    console.error('[Push] Error registering service worker:', error);
    return null;
  }
}

/**
 * Trimite Notifica push locală (pentru testing)
 */
export async function sendLocalNotification(payload: PushNotificationPayload): Promise<void> {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications not supported');
    return;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.log('[Push] Permission not granted');
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  const notificationOptions: NotificationOptions & { actions?: any[] } = {
    body: payload.body,
    icon: payload.icon || '/icon-192x192.png',
    badge: payload.badge || '/badge-72x72.png',
    tag: payload.tag || payload.type,
    data: {
      type: payload.type,
      ...payload.data,
    },
  };

  // Aggiungi actions dacă sunt suportate
  if ('actions' in Notification.prototype) {
    (notificationOptions as any).actions = [
      {
        action: 'open',
        title: 'Deschide',
        icon: '/icon-open.png',
      },
      {
        action: 'close',
        title: 'Închide',
        icon: '/icon-close.png',
      },
    ];
  }

  registration.showNotification(payload.title, notificationOptions);
}

/**
 * Unsubscribe de la push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<void> {
  if (!isPushNotificationSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('[Push] Unsubscribed from push notifications');
    }
  } catch (error) {
    console.error('[Push] Error unsubscribing:', error);
  }
}

/**
 * Obținere subscription Corrente
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  } catch (error) {
    console.error('[Push] Error getting subscription:', error);
    return null;
  }
}

/**
 * Hook pentru inițializare push notifications
 */
export function usePushNotifications() {
  const isSupported = isPushNotificationSupported();

  const initialize = async () => {
    if (!isSupported) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    try {
      const subscription = await registerServiceWorkerAndSubscribe();
      return !!subscription;
    } catch (error) {
      console.error('[Push] Initialization error:', error);
      return false;
    }
  };

  const sendNotification = async (payload: PushNotificationPayload) => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      await sendLocalNotification(payload);
      return true;
    } catch (error) {
      console.error('[Push] Error sending notification:', error);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      await unsubscribeFromPushNotifications();
      return true;
    } catch (error) {
      console.error('[Push] Error unsubscribing:', error);
      return false;
    }
  };

  return {
    isSupported,
    initialize,
    sendNotification,
    unsubscribe,
  };
}
