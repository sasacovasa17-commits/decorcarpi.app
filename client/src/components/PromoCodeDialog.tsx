/**
 * PromoCodeDialog - Dialog pentru introducere Codice promo
 * Apare când utilizatorul epuizează generările gratuite
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface PromoCodeDialogProps {
  isOpen: boolean;
  sessionId: string;
  onClose: () => void;
  onCodeApplied: (result: { generationsRemaining: number; isUnlimited: boolean }) => void;
}

export function PromoCodeDialog({ isOpen, sessionId, onClose, onCodeApplied }: PromoCodeDialogProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const applyCodeMutation = trpc.usage.applyCode.useMutation();

  const handleApplyCode = async () => {
    if (!code.trim()) {
      setError('Inserisci il codice');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await applyCodeMutation.mutateAsync({
        sessionId,
        code: code.trim().toUpperCase(),
      });

      if (result.success) {
        setSuccess(true);
        setCode('');
        setTimeout(() => {
          onCodeApplied({
            generationsRemaining: result.generationsRemaining || 0,
            isUnlimited: result.isUnlimited || false,
          });
          onClose();
          // Reîncarcă pagina pentru a actualiza starea
          window.location.reload();
        }, 1500);
      } else {
        setError(result.error || 'Errore sconosciuto');
      }
    } catch (err) {
      setError('Errore nella connessione');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleApplyCode();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border border-[#c9a227]/30 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-[#c9a227] text-xl">Generazioni Esaurite</DialogTitle>
          <DialogDescription className="text-gray-400">
            Hai utilizzato tutte le generazioni gratuite. Contattaci per ricevere un codice di attivazione.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Messaggio informativo */}
          <div className="bg-[#2a2a2a] border border-[#c9a227]/20 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              📧 <strong>Contattaci su WhatsApp o Email</strong> per ricevere un codice di attivazione e ottenere più generazioni gratuite.
            </p>
          </div>

          {/* Input codice */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Codice di Attivazione</label>
            <Input
              placeholder="Inserisci il codice ricevuto"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              disabled={isLoading || success}
              className="bg-[#2a2a2a] border-[#c9a227]/30 text-white placeholder-gray-500"
            />
          </div>

          {/* Messaggio errore */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Messaggio successo */}
          {success && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-3 rounded">
              <CheckCircle2 size={16} />
              Codice applicato con successo! ✨
            </div>
          )}

          {/* Bottoni */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading || success}
              className="flex-1 border-[#c9a227]/30 text-gray-300 hover:bg-[#2a2a2a]"
            >
              Annulla
            </Button>
            <Button
              onClick={handleApplyCode}
              disabled={isLoading || success || !code.trim()}
              className="flex-1 bg-[#c9a227] hover:bg-[#c9a227]/90 text-black font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifica...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Applicato!
                </>
              ) : (
                'Applica Codice'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
