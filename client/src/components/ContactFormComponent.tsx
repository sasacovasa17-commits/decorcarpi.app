/**
 * ContactFormComponent
 * Componente per l'invio di messaggi di contatto tramite tRPC
 * Con loading state, error handling e notifiche toast
 */

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useTheme } from '@/contexts/ThemeContext';
import { Send, Loader } from 'lucide-react';

interface ContactFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function ContactFormComponent({ onSuccess, onError }: ContactFormProps) {
  const { currentColorTheme } = useTheme();
  const { successTranslated, errorTranslated, handleError } = useToastNotifications();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Mutation pentru trimitere Messaggio
  const sendContactMutation = trpc.contact.sendContactMessage.useMutation({
    onSuccess: () => {
      successTranslated('contact_success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setErrors({});
      onSuccess?.();
    },
    onError: (error) => {
      const errorMsg = error.message || 'Errore nell\'invio del messaggio';
      errorTranslated('contact_error');
      setErrors({ submit: errorMsg });
      onError?.(errorMsg);
      handleError(errorMsg, 'contact_form');
    },
  });

  // Validazione form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Nome troppo breve (minimo 2 caratteri)';
    }

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Email non valida';
    }

    if (!formData.phone || formData.phone.length < 5) {
      newErrors.phone = 'Telefono non valido (minimo 5 caratteri)';
    }

    if (!formData.message || formData.message.length < 10) {
      newErrors.message = 'Messaggio troppo breve (minimo 10 caratteri)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handler pentru submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        handleError('Verifica i dati e riprova', 'contact_form_validation');
        return;
      }

      setIsLoading(true);

      try {
        await sendContactMutation.mutateAsync({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        });
      } catch (error) {
        // La gestione degli errori è gestita nel callback onError
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, sendContactMutation, handleError]
  );

  // Handler pentru schimbare input
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Cancella errore per questo campo quando l'utente inizia a scrivere
      if (errors[name]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [errors]
  );

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nome */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: '#c9a227' }}>
            Nome *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={isLoading}
            className="w-full px-3 py-2 rounded-sm text-sm transition-all"
            style={{
              background: currentColorTheme.colors.bg,
              color: '#e8e8e8',
              border: errors.name ? '1px solid #ff6b6b' : '1px solid rgba(201,162,39,0.3)',
            }}
          />
          {errors.name && (
            <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: '#c9a227' }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            disabled={isLoading}
            className="w-full px-3 py-2 rounded-sm text-sm transition-all"
            style={{
              background: currentColorTheme.colors.bg,
              color: '#e8e8e8',
              border: errors.email ? '1px solid #ff6b6b' : '1px solid rgba(201,162,39,0.3)',
            }}
          />
          {errors.email && (
            <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Telefono */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: '#c9a227' }}>
            Telefono *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+40123456789"
            disabled={isLoading}
            className="w-full px-3 py-2 rounded-sm text-sm transition-all"
            style={{
              background: currentColorTheme.colors.bg,
              color: '#e8e8e8',
              border: errors.phone ? '1px solid #ff6b6b' : '1px solid rgba(201,162,39,0.3)',
            }}
          />
          {errors.phone && (
            <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>
              {errors.phone}
            </p>
          )}
        </div>

        {/* Messaggio */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: '#c9a227' }}>
            Messaggio *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Scrivi il tuo messaggio..."
            disabled={isLoading}
            rows={4}
            className="w-full px-3 py-2 rounded-sm text-sm transition-all resize-none"
            style={{
              background: currentColorTheme.colors.bg,
              color: '#e8e8e8',
              border: errors.message ? '1px solid #ff6b6b' : '1px solid rgba(201,162,39,0.3)',
            }}
          />
          {errors.message && (
            <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>
              {errors.message}
            </p>
          )}
        </div>

        {/* Error general */}
        {errors.submit && (
          <div
            className="p-3 rounded-sm text-xs"
            style={{
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              color: '#ff6b6b',
            }}
          >
            {errors.submit}
          </div>
        )}

        {/* Buton Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 flex items-center justify-center gap-2 rounded-sm font-bold text-base transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: '#c9a227',
            color: '#0a0a0a',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? (
            <>
              <Loader size={18} className="animate-spin" />
              Invio in corso...
            </>
          ) : (
            <>
              <Send size={18} />
              Invia Messaggio
            </>
          )}
        </button>

        <p className="text-xs text-center" style={{ color: '#666' }}>
          * Campi obbligatori
        </p>
      </form>
    </div>
  );
}
