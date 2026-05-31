import { useEffect, useState } from 'react';

interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  deferredPrompt: any;
}

export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInstalled: false,
    canInstall: false,
    deferredPrompt: null,
  });

  useEffect(() => {
    // NOTE: Service Worker is registered in main.tsx (sw.js) - do NOT register again here

    // Listen for online/offline events
    const handleOnline = () => setState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      setState((prev) => ({
        ...prev,
        canInstall: true,
        deferredPrompt: e,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setState((prev) => ({ ...prev, isInstalled: true }));
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setState((prev) => ({ ...prev, isInstalled: true, canInstall: false }));
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;
      setState((prev) => ({ ...prev, deferredPrompt: null, canInstall: false }));
      return outcome;
    }
    return null;
  };

  const requestPersistentStorage = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const persistent = await navigator.storage.persist();
      return persistent;
    }
    return false;
  };

  return {
    ...state,
    installApp,
    requestPersistentStorage,
  };
};
