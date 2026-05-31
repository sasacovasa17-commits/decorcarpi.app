import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'ai_cost_alert_limit';
const DEFAULT_LIMIT = 50000; // €500

export function CostAlertSettings() {
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
  const [isEditing, setIsEditing] = useState(false);
  const [tempLimit, setTempLimit] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Load limit from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setLimit(parseInt(saved, 10));
    }
  }, []);

  const handleEdit = () => {
    setTempLimit((limit / 100).toString());
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    const value = parseFloat(tempLimit);

    if (isNaN(value) || value < 0) {
      toast.error('Valore non valida');
      setIsSaving(false);
      return;
    }

    const newLimit = Math.round(value * 100);
    setLimit(newLimit);
    localStorage.setItem(STORAGE_KEY, newLimit.toString());
    setIsEditing(false);
    setIsSaving(false);
    toast.success('Limite salvato');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempLimit('');
  };

  return (
    <Card className="border-gold/30 bg-black/50">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Avviso Costo Massimo
        </CardTitle>
        <CardDescription>Imposta il limite mensile del costo AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <div className="space-y-4">
            <div className="p-4 bg-black/30 rounded">
              <p className="text-sm text-gray-400">Limite mensile corrente</p>
              <p className="text-3xl font-bold text-gold mt-2">
                €{(limit / 100).toFixed(2)}
              </p>
            </div>
            <Button
              onClick={handleEdit}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              Modifica Limite
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Limite mensile (€)
              </label>
              <Input
                type="number"
                min="0"
                step="10"
                value={tempLimit}
                onChange={(e) => setTempLimit(e.target.value)}
                placeholder="Ex: 500"
                className="bg-black/50 border-gold/30 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !tempLimit}
                className="flex-1 bg-gold hover:bg-gold/90 text-black font-semibold"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvataggio in corso...' : 'Salva'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
              >
                Annulla
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-amber-900/20 border border-amber-600/30 rounded text-sm text-amber-200">
          <p className="font-semibold mb-1">ℹ️ Notifica</p>
          <p>Riceverai un avviso quando i costi mensili si avvicinano a €{(limit / 100).toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Check if cost alert should be triggered
 */
export function checkCostAlert(currentCost: number): boolean {
  const saved = localStorage.getItem(STORAGE_KEY);
  const limit = saved ? parseInt(saved, 10) : DEFAULT_LIMIT;
  return currentCost >= limit * 0.8; // Alert at 80% of limit
}

/**
 * Get cost alert percentage
 */
export function getCostAlertPercentage(currentCost: number): number {
  const saved = localStorage.getItem(STORAGE_KEY);
  const limit = saved ? parseInt(saved, 10) : DEFAULT_LIMIT;
  return Math.round((currentCost / limit) * 100);
}
