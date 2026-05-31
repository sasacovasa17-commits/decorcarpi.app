import { useState, useCallback } from 'react';
import { useLanguage } from './useLanguage';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  timestamp: number;
}

const TOAST_MESSAGES: Record<string, Record<string, string>> = {
  it: {
    'contact_success': 'Messaggio inviato con successo!',
    'contact_error': 'Errore nell\'invio del messaggio. Riprova.',
    'email_invalid': 'Email non valida',
    'upload_success': 'Immagine caricata con successo!',
    'upload_error': 'Errore nel caricamento dell\'immagine',
    'generation_success': 'Anteprima generata con successo!',
    'generation_error': 'Errore nella generazione. Riprova.',
    'rate_limit': 'Hai superato il limite di generazioni gratuite. Esegui l\'upgrade a PRO!',
    'network_error': 'Errore di connessione. Verifica la connessione internet.',
    'saved_success': 'Immagine salvata con successo!',
    'shared_success': 'Condiviso con successo!',
    'copied_success': 'Copiato negli appunti!',
    'deleted_success': 'Eliminato con successo!',
    'validation_error': 'Verifica i dati e riprova.',
  },
  ro: {
    'contact_success': 'Messaggio inviato con successo!',
    'contact_error': 'Errore nell\'invio del messaggio. Riprova.',
    'email_invalid': 'Email non valida',
    'upload_success': 'Immagine caricata con successo!',
    'upload_error': 'Errore nel caricamento dell\'immagine',
    'generation_success': 'Anteprima generata con successo!',
    'generation_error': 'Errore nella generazione. Riprova.',
    'rate_limit': 'Hai superato il limite di generazioni gratuite. Esegui l\'upgrade a PRO!',
    'network_error': 'Errore di connessione. Verifica la connessione internet.',
    'saved_success': 'Immagine salvata con successo!',
    'shared_success': 'Condiviso con successo!',
    'copied_success': 'Copiato negli appunti!',
    'deleted_success': 'Eliminato con successo!',
    'validation_error': 'Verifica i dati e riprova.',
  },
  en: {
    'contact_success': 'Message sent successfully!',
    'contact_error': 'Error sending message. Try again.',
    'email_invalid': 'Invalid email',
    'upload_success': 'Image uploaded successfully!',
    'upload_error': 'Error uploading image',
    'generation_success': 'Preview generated successfully!',
    'generation_error': 'Generation error. Try again.',
    'rate_limit': 'You have exceeded the free generation limit. Upgrade to PRO!',
    'network_error': 'Connection error. Check your internet.',
    'saved_success': 'Image saved successfully!',
    'shared_success': 'Shared successfully!',
    'copied_success': 'Copied to clipboard!',
    'deleted_success': 'Deleted successfully!',
    'validation_error': 'Check your data and try again.',
  },
};

export const useToastNotifications = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { language } = useLanguage();

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message, duration, timestamp: Date.now() };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration = 3000) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message: string, duration = 4000) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message: string, duration = 3000) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message: string, duration = 3000) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  // Metode cu traduceri
  const successTranslated = useCallback(
    (messageKey: string, duration = 3000) => {
      const msg = TOAST_MESSAGES[language]?.[messageKey] || messageKey;
      return addToast(msg, 'success', duration);
    },
    [language, addToast]
  );

  const errorTranslated = useCallback(
    (messageKey: string, duration = 4000) => {
      const msg = TOAST_MESSAGES[language]?.[messageKey] || messageKey;
      return addToast(msg, 'error', duration);
    },
    [language, addToast]
  );

  const warningTranslated = useCallback(
    (messageKey: string, duration = 3000) => {
      const msg = TOAST_MESSAGES[language]?.[messageKey] || messageKey;
      return addToast(msg, 'warning', duration);
    },
    [language, addToast]
  );

  // Handle errors cu logging
  const handleError = useCallback(
    (errorMsg: string, context?: string) => {
      // Log error pentru debugging
      if (process.env.NODE_ENV === 'development') {
        console.error(`[${context || 'Error'}]`, errorMsg);
      }
      return addToast(errorMsg, 'error', 4000);
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    successTranslated,
    errorTranslated,
    warningTranslated,
    handleError,
  };
};
