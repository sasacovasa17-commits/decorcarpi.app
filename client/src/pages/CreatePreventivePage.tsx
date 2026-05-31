import { useState } from 'react';
import { useLocation } from 'wouter';
import { Toaster, toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { addPreventive } from '@/lib/preventiveStorage';

export default function CreatePreventivePage() {
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    workType: 'Stucchi Decorativi',
    description: '',
    subtotal: 0,
    others: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'subtotal' || name === 'others' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione
    if (!formData.clientName.trim()) {
      toast.error('Nome cliente obbligatorio', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
      return;
    }

    if (!formData.clientEmail.trim()) {
      toast.error('Email obbligatorio', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
      return;
    }

    if (formData.subtotal <= 0) {
      toast.error('Subtotale deve essere maggiore di 0', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
      return;
    }

    // Crea preventivo usando addPreventive
    const Totale = formData.subtotal + formData.others + 2; // +2 per altri costi fissi
    addPreventive(
      {
        nome: formData.clientName,
        email: formData.clientEmail,
        telefono: formData.clientPhone,
        indirizzo: formData.clientAddress,
      },
      formData.workType,
      formData.description,
      formData.subtotal,
      formData.others,
      Totale
    );

    toast.success('Preventivo creato!', {
      style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
    });

    // Redirect a My Preventives
    setTimeout(() => {
      setLocation('/my-preventives');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 pb-24">
      <Toaster />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setLocation('/my-preventives')}
          className="text-[#c9a227] hover:text-[#d4af37] transition-all"
          title="Indietro"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-[#c9a227]">Crea Preventivo</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        {/* Client Data */}
        <div className="bg-[#1a1a1a] border border-[#c9a227]/30 rounded-lg p-4 space-y-3">
          <h2 className="text-[#c9a227] font-bold text-lg">Dati Cliente</h2>
          
          <input
            type="text"
            name="clientName"
            placeholder="Nome cliente"
            value={formData.clientName}
            onChange={handleInputChange}
            className="w-full bg-[#0a0a0a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
          />
          
          <input
            type="email"
            name="clientEmail"
            placeholder="Email"
            value={formData.clientEmail}
            onChange={handleInputChange}
            className="w-full bg-[#0a0a0a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
          />
          
          <input
            type="tel"
            name="clientPhone"
            placeholder="Telefono"
            value={formData.clientPhone}
            onChange={handleInputChange}
            className="w-full bg-[#0a0a0a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
          />
          
          <input
            type="text"
            name="clientAddress"
            placeholder="Indirizzo"
            value={formData.clientAddress}
            onChange={handleInputChange}
            className="w-full bg-[#0a0a0a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
          />
        </div>

        {/* Work Details */}
        <div className="bg-[#1a1a1a] border border-[#c9a227]/30 rounded-lg p-4 space-y-3">
          <h2 className="text-[#c9a227] font-bold text-lg">Dettagli Lavoro</h2>
          
          <select
            name="workType"
            value={formData.workType}
            onChange={handleInputChange}
            className="w-full bg-[#0a0a0a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
          >
            <option value="Vernice">Vernice</option>
            <option value="Stucchi Decorativi">Stucchi Decorativi</option>
            <option value="Antimuffa">Antimuffa</option>
            <option value="Marmurino">Marmurino</option>
            <option value="Altro">Altro</option>
          </select>
          
          <textarea
            name="description"
            placeholder="Descrizione lavoro"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full bg-[#0a0a0a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none h-20 resize-none"
          />
        </div>

        {/* Pricing */}
        <div className="bg-[#1a1a1a] border border-[#c9a227]/30 rounded-lg p-4 space-y-3">
          <h2 className="text-[#c9a227] font-bold text-lg">Prezzi</h2>
          
          <div>
            <label className="text-[#888] text-sm">Subtotale (€)</label>
            <input
              type="number"
              name="subtotal"
              placeholder="0.00"
              value={formData.subtotal || ''}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full bg-[#0a0a0a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
            />
          </div>
          
          <div>
            <label className="text-[#888] text-sm">Altri Costi (€)</label>
            <input
              type="number"
              name="others"
              placeholder="0.00"
              value={formData.others || ''}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full bg-[#0a0a0a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
            />
          </div>
          
          <div className="bg-[#0a0a0a] rounded p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#888]">Totale:</span>
              <span className="text-[#c9a227] font-bold">
                €{(formData.subtotal + formData.others + 2).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLocation('/my-preventives')}
            className="flex-1 bg-[#3a1a1a] text-[#ff6b6b] py-2 rounded font-medium border border-[#ff6b6b]/30 hover:border-[#ff6b6b] transition-all"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#c9a227] text-[#0a0a0a] py-2 rounded font-bold hover:bg-[#d4af37] transition-all"
          >
            Crea Preventivo
          </button>
        </div>
      </form>
    </div>
  );
}
