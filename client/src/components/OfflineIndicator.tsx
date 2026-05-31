/**
 * OfflineIndicator Component - Show offline status for PWA
 */

import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { Wifi, WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const isOnline = useOfflineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-2 z-50">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-semibold">Offline - Funzionalità limitate</span>
    </div>
  );
}
