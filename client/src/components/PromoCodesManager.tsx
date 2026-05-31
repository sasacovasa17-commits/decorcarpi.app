/**
 * PromoCodesManager - Gestionare coduri promo (Admin)
 * Creere, vizualizare, dezactivare coduri
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, Plus, Trash2, CheckCircle2, Loader2, Copy } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface PromoCode {
  id: number;
  code: string;
  generationsLimit: number;
  generationsUsed: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  notes: string | null;
  createdBy: number | null;
}

export function PromoCodesManager() {
  const [newCode, setNewCode] = useState('');
  const [generationsLimit, setGenerationsLimit] = useState('20');
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Query pentru obținerea codurilor
  const { data: promoCodes = [], refetch: refetchCodes, isLoading: isLoadingCodes } = trpc.admin.getAllPromoCodes.useQuery(
    { password: localStorage.getItem('adminPassword') || '' },
    { enabled: !!localStorage.getItem('adminPassword') }
  );

  // Mutation pentru creere Codice
  const createCodeMutation = trpc.admin.createPromoCode.useMutation();

  // Mutation pentru dezactivare Codice
  const deactivateCodeMutation = trpc.admin.deactivatePromoCode.useMutation();

  const handleCreateCode = async () => {
    if (!newCode.trim()) {
      toast.error('Inserisci un codice');
      return;
    }

    setIsLoading(true);
    try {
      await createCodeMutation.mutateAsync({
        code: newCode.trim().toUpperCase(),
        generationsLimit: isUnlimited ? -1 : parseInt(generationsLimit) || 20,
        notes: notes || undefined,
        password: localStorage.getItem('adminPassword') || '',
      });

      toast.success('Codice creato con successo!');
      setNewCode('');
      setGenerationsLimit('20');
      setIsUnlimited(false);
      setNotes('');
      refetchCodes();
    } catch (error) {
      toast.error('Errore nella creazione del codice');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateCode = async (codeId: number) => {
    try {
      await deactivateCodeMutation.mutateAsync({
        codeId,
        password: localStorage.getItem('adminPassword') || '',
      });

      toast.success('Codice disattivato');
      refetchCodes();
    } catch (error) {
      toast.error('Errore nella disattivazione');
      console.error(error);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Codice copiato!');
  };

  return (
    <div className="space-y-6">
      {/* Sezione Creere Codice */}
      <Card className="bg-[#1a1a1a] border-[#c9a227]/30 p-6">
        <h3 className="text-xl font-bold text-[#c9a227] mb-4 flex items-center gap-2">
          <Plus size={20} />
          Crea Nuovo Codice
        </h3>

        <div className="space-y-4">
          {/* Input Codice */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Codice</label>
            <Input
              placeholder="es. PROMO2024"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              disabled={isLoading}
              className="bg-[#2a2a2a] border-[#c9a227]/30 text-white placeholder-gray-500"
            />
          </div>

          {/* Generazioni */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Generazioni</label>
              <Input
                type="number"
                placeholder="20"
                value={generationsLimit}
                onChange={(e) => setGenerationsLimit(e.target.value)}
                disabled={isLoading || isUnlimited}
                className="bg-[#2a2a2a] border-[#c9a227]/30 text-white placeholder-gray-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnlimited}
                  onChange={(e) => setIsUnlimited(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Illimitato</span>
              </label>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Note (opzionale)</label>
            <Input
              placeholder="es. 20 generazioni, valido 30 giorni"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              className="bg-[#2a2a2a] border-[#c9a227]/30 text-white placeholder-gray-500"
            />
          </div>

          {/* Bottone Crea */}
          <Button
            onClick={handleCreateCode}
            disabled={isLoading || !newCode.trim()}
            className="w-full bg-[#c9a227] hover:bg-[#c9a227]/90 text-black font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creazione...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Crea Codice
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Sezione Lista Codici */}
      <Card className="bg-[#1a1a1a] border-[#c9a227]/30 p-6">
        <h3 className="text-xl font-bold text-[#c9a227] mb-4">Codici Attivi</h3>

        {isLoadingCodes ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#c9a227]" />
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nessun codice creato</p>
          </div>
        ) : (
          <div className="space-y-3">
            {promoCodes.map((code: PromoCode) => (
              <div
                key={code.id}
                className="bg-[#2a2a2a] border border-[#c9a227]/20 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-[#c9a227] font-mono font-bold text-lg">{code.code}</code>
                    <button
                      onClick={() => handleCopyCode(code.code)}
                      className="p-1 hover:bg-[#3a3a3a] rounded transition"
                      title="Copia codice"
                    >
                      <Copy size={16} className="text-gray-400" />
                    </button>
                    {code.isActive ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Attivo
                      </span>
                    ) : (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                        Disattivato
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>
                      Generazioni: {code.generationsLimit === -1 ? '∞ Illimitato' : `${code.generationsLimit}`}
                      {code.generationsUsed > 0 && ` (${code.generationsUsed} usate)`}
                    </p>
                    {code.notes && <p className="text-gray-500">Note: {code.notes}</p>}
                    <p className="text-xs text-gray-600">
                      Creato: {new Date(code.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>

                {code.isActive && (
                  <Button
                    onClick={() => handleDeactivateCode(code.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info */}
      <div className="bg-[#2a2a2a] border border-[#c9a227]/20 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          💡 <strong>Suggerimento:</strong> Crea codici con limite di generazioni (20, 30) per nuovi utenti, e codici illimitati per il tuo uso personale.
        </p>
      </div>
    </div>
  );
}
