import { useReminderNotifications } from '@/hooks/useReminderNotifications';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export function ReminderNotifications() {
  const reminders = useReminderNotifications();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleReminders = reminders.filter(r => !dismissed.has(r.id));

  if (visibleReminders.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-2 max-w-md">
      {visibleReminders.map(reminder => {
        const createdAt = new Date(reminder.createdAt).getTime();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const expiresAt = createdAt + thirtyDaysMs;
        const daysUntilExpiry = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));

        return (
          <div
            key={reminder.id}
            className="bg-[#3a2a1a] border border-[#d4af37]/50 rounded-lg p-4 flex items-start gap-3 shadow-lg"
          >
            <AlertCircle size={20} className="text-[#d4af37] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[#d4af37]">Preventivo în curs de expirare</p>
              <p className="text-sm text-gray-300 mt-1">
                Preventivo <span className="font-medium">{reminder.preventiveNumber}</span> expiră în {daysUntilExpiry} Giorni
              </p>
            </div>
            <button
              onClick={() => {
                const newDismissed = new Set(dismissed);
                newDismissed.add(reminder.id);
                setDismissed(newDismissed);
              }}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
