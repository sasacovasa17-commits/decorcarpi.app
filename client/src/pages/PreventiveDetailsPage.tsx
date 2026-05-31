import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getPreventives, updatePreventiveClientData } from '@/lib/preventiveStorage';
import { ChevronLeft } from 'lucide-react';

interface PreventiveData {
  id: number;
  numero?: string;
  nome: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
  codiceFiscale?: string;
  calculator: string;
  description: string;
  subtotal: number;
  others: number;
  discount?: number;
  notes?: string;
  lucrare?: string;
  descrizioneLucrare?: string;
  dataFirma?: string;
  iscalitura?: string;
}

export default function PreventiveDetailsPage() {
  const [, params] = useRoute('/Preventivi/:id');
  const [Preventivi, setPreventive] = useState<PreventiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PreventiveData>({
    id: 0,
    numero: '',
    nome: '',
    email: '',
    telefono: '',
    indirizzo: '',
    codiceFiscale: '',
    calculator: '',
    description: '',
    subtotal: 0,
    others: 0,
    discount: 0,
    notes: '',
    lucrare: '',
    descrizioneLucrare: '',
    dataFirma: '',
    iscalitura: '',
  });

  useEffect(() => {
    if (!params?.id) return;
    
    const preventives = getPreventives();
    const found = preventives.find(p => String(p.id) === String(params.id));
    
    if (found) {
      setPreventive(found as unknown as PreventiveData);
      setFormData({
        ...found,
        numero: (found as any).numero || `PREV-${found.id}`,
        lucrare: (found as any).lucrare || found.calculator,
        descrizioneLucrare: (found as any).descrizioneLucrare || found.description,
        dataFirma: (found as any).dataFirma || new Date().toLocaleDateString('it-IT'),
      } as unknown as PreventiveData);
    }
    setLoading(false);
  }, [params?.id]);

  const calculateTotal = () => {
    return formData.subtotal + formData.others - (formData.discount || 0);
  };

  const handleSave = () => {
    if (!Preventivi) return;

    if (!formData.nome.trim()) {
      toast.error('Nome cliente è obbligatorio');
      return;
    }

    // Actualizeaza datele clientului
    updatePreventiveClientData(String(Preventivi.id), {
      nome: formData.nome,
      email: formData.email || undefined,
      telefono: formData.telefono || undefined,
      indirizzo: formData.indirizzo || undefined,
      codiceFiscale: formData.codiceFiscale || undefined,
    });

    // Actualizeaza preventivul complet
    const preventives = getPreventives();
    const updatedPreventives = preventives.map(p => {
      if (String(p.id) === String(Preventivi.id)) {
        return {
          ...p,
          numero: formData.numero,
          calculator: formData.calculator,
          description: formData.description,
          subtotal: formData.subtotal,
          others: formData.others,
          Totale: calculateTotal(),
          discount: formData.discount || 0,
          notes: formData.notes,
          lucrare: formData.lucrare,
          descrizioneLucrare: formData.descrizioneLucrare,
          dataFirma: formData.dataFirma,
          iscalitura: formData.iscalitura,
        };
      }
      return p;
    });
    localStorage.setItem('decorcarpi_preventivi', JSON.stringify(updatedPreventives));
    toast.success('Preventivo salvato con successo!');
    window.location.href = '/my-preventives';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  if (!Preventivi) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Preventivo non trovato</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => window.location.href = '/my-preventives'}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-primary">
          {formData.numero || 'PREVENTIVO'}
        </h1>
      </div>

      {/* Form Sections */}
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Nomero Preventivo */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <label className="block text-sm font-semibold text-primary mb-2">
            Numero Preventivo
          </label>
          <Input
            value={formData.numero}
            onChange={(e) => setFormData({...formData, numero: e.target.value})}
            placeholder="Es. PREV-001"
            className="bg-background"
          />
        </div>

        {/* Cliente */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h2 className="text-lg font-bold text-primary mb-4">CLIENTE</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Nome *</label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Nome completo"
                className="bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Indirizzo</label>
              <Input
                value={formData.indirizzo}
                onChange={(e) => setFormData({...formData, indirizzo: e.target.value})}
                placeholder="Via Roma 123"
                className="bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Codice Fiscale</label>
              <Input
                value={formData.codiceFiscale}
                onChange={(e) => setFormData({...formData, codiceFiscale: e.target.value})}
                placeholder="RSSMRA80A01H501U"
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Telefono</label>
                <Input
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  placeholder="+39 333 1234567"
                  className="bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                  className="bg-background"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lucrare */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h2 className="text-lg font-bold text-primary mb-4">LUCRARE</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Lucrare</label>
              <Input
                value={formData.lucrare}
                onChange={(e) => setFormData({...formData, lucrare: e.target.value})}
                placeholder="Es. Verniciatura Pareti"
                className="bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Descrizione Lucrare</label>
              <Textarea
                value={formData.descrizioneLucrare}
                onChange={(e) => setFormData({...formData, descrizioneLucrare: e.target.value})}
                placeholder="Descrizione dettagliata della lucrare..."
                className="bg-background min-h-24"
              />
            </div>
          </div>
        </div>

        {/* Prezzi */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h2 className="text-lg font-bold text-primary mb-4">PREZZI</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Prezzo (€)</label>
              <Input
                type="number"
                value={formData.subtotal}
                onChange={(e) => setFormData({...formData, subtotal: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
                className="bg-background"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Altri Costi (€)</label>
              <Input
                type="number"
                value={formData.others}
                onChange={(e) => setFormData({...formData, others: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
                className="bg-background"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Sconto (€)</label>
              <Input
                type="number"
                value={formData.discount || 0}
                onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
                className="bg-background"
                step="0.01"
              />
            </div>
            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="text-sm font-semibold text-primary">
                TOTALE: €{calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Date Firma */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h2 className="text-lg font-bold text-primary mb-4">DATE FIRMA</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Decor Carpi</p>
            <p>Via Roma 123</p>
            <p>Tel: +39 334 360 0932</p>
            <p>Email: decorcarpi@gmail.com</p>
          </div>
        </div>



        {/* Note */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h2 className="text-lg font-bold text-primary mb-4">NOTE AGGIUNTIVE</h2>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Note aggiuntive..."
            className="bg-background min-h-20"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 sticky bottom-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/my-preventives'}
            className="flex-1"
          >
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Salva Preventivo
          </Button>
        </div>
      </div>
    </div>
  );
}
