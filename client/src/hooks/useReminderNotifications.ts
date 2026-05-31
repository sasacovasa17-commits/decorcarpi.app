import { useEffect, useState } from 'react';
import { getPreventives } from '@/lib/preventiveStorage';

export function useReminderNotifications() {
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    const checkReminders = () => {
      const preventives = getPreventives();
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      const expiring = preventives.filter(p => {
        const createdAt = new Date(p.createdAt).getTime();
        const expiresAt = createdAt + thirtyDaysMs;
        const daysUntilExpiry = (expiresAt - now) / (24 * 60 * 60 * 1000);
        
        // Notifica dacă expiră în 3 Giorni sau mai puțin
        return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
      });

      setReminders(expiring);
    };

    checkReminders();
    
    // Verifica remindere la fiecare oră
    const interval = setInterval(checkReminders, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return reminders;
}
