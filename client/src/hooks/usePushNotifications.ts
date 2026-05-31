/**
 * usePushNotifications Hook - Web Push API Integration
 */

import { useEffect, useState } from 'react';

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if Push Notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      // Check if already subscribed
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribe = async () => {
    if (!isSupported) {
      console.warn('Push Notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      setSubscription(sub);
      setIsSubscribed(true);

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      console.log('[Push] Subscribed successfully');
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);

      // Notify server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      console.log('[Push] Unsubscribed successfully');
    } catch (error) {
      console.error('[Push] Unsubscription failed:', error);
    }
  };

  const sendNotification = async (options: PushNotificationOptions) => {
    if (!subscription) {
      console.warn('Not subscribed to push notifications');
      return;
    }

    try {
      await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          ...options,
        }),
      });

      console.log('[Push] Notification sent');
    } catch (error) {
      console.error('[Push] Failed to send notification:', error);
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
    sendNotification,
  };
}
