/**
 * PWAInstallPrompt Component - Mobile app install prompt
 * Persists dismiss state in localStorage so it doesn't show again after "Più tardi"
 * Shows again after 7 days if dismissed
 */

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface PWAInstallPromptProps {
  location?: string;
}

export function PWAInstallPrompt({ location }: PWAInstallPromptProps = {}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // ImportaNT: All hooks MUST be called before any conditional return
  // to respect React's Rules of Hooks (same number of hooks every render)

  useEffect(() => {
    // Don't run setup on full-screen AI page
    if (location === '/ispirazione-dc') return;

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed the prompt recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION_MS) {
        // Still within dismiss period, don't show
        return;
      }
      // Dismiss period expired, remove the key
      localStorage.removeItem(DISMISS_KEY);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Save the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [location]);

  // Hide on full-screen AI page (AFTER hooks)
  if (location === '/ispirazione-dc') return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('[PWA] Installation error:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Save dismiss timestamp so it doesn't show again for 7 days
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-black/70 border-t border-amber-600 p-4 z-[2147483645] animate-slide-up">
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-white">Installa Decor Carpi</h3>
              <p className="text-sm text-gray-300">Accesso rapido dal tuo home screen</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-black font-semibold"
          >
            Installa
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            Più tardi
          </Button>
        </div>
      </div>
    </div>
  );
}
