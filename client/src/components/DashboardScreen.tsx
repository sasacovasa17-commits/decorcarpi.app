import { useMemo } from 'react';
import { getPreventives } from '@/lib/preventiveStorage';
import { TrendingUp, FileText, Send, Clock } from 'lucide-react';

export default function DashboardScreen() {
  const preventives = useMemo(() => getPreventives(), []);

  // Calcul statistici
  const stats = useMemo(() => {
    const Totale = preventives.length;
    const totalValue = preventives.reduce((sum, p) => sum + (p.Totale || 0), 0);
    const averageValue = Totale > 0 ? totalValue / Totale : 0;
    
    // Preventivi Inviati (estimate: dacă au email/whatsapp)
    const sent = preventives.filter(p => p.clientData?.email || p.clientData?.telefono).length;
    
    // Preventivi în curs (estimate: create in last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const inProgress = preventives.filter(p => new Date(p.createdAt).getTime() > sevenDaysAgo).length;

    return {
      Totale,
      totalValue,
      averageValue,
      sent,
      inProgress,
    };
  }, [preventives]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#c9a227] mb-2">Dashboard</h1>
        <p className="text-gray-400">Statistici Preventivi</p>
      </div>

      {/* Statistici Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Totale Preventivi */}
        <div className="bg-[#1a1a1a] border border-[#c9a227]/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Totale Preventivi</p>
              <p className="text-3xl font-bold text-[#c9a227]">{stats.Totale}</p>
            </div>
            <FileText size={32} className="text-[#c9a227]/50" />
          </div>
        </div>

        {/* Valore Totale */}
        <div className="bg-[#1a1a1a] border border-[#4caf50]/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Valore Totale</p>
              <p className="text-3xl font-bold text-[#4caf50]">€{stats.totalValue.toFixed(2)}</p>
            </div>
            <TrendingUp size={32} className="text-[#4caf50]/50" />
          </div>
        </div>

        {/* Valore Media */}
        <div className="bg-[#1a1a1a] border border-[#7dd3fc]/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Valore Media</p>
              <p className="text-3xl font-bold text-[#7dd3fc]">€{stats.averageValue.toFixed(2)}</p>
            </div>
            <FileText size={32} className="text-[#7dd3fc]/50" />
          </div>
        </div>

        {/* Preventivi Inviati */}
        <div className="bg-[#1a1a1a] border border-[#b19cd9]/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Inviati</p>
              <p className="text-3xl font-bold text-[#b19cd9]">{stats.sent}</p>
            </div>
            <Send size={32} className="text-[#b19cd9]/50" />
          </div>
        </div>

        {/* In Corso */}
        <div className="bg-[#1a1a1a] border border-[#d4af37]/30 rounded-lg p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Ultimi 7 Giorni</p>
              <p className="text-3xl font-bold text-[#d4af37]">{stats.inProgress}</p>
            </div>
            <Clock size={32} className="text-[#d4af37]/50" />
          </div>
        </div>
      </div>

      {/* Ripartizione per Tipo di Lavoro */}
      <div className="bg-[#1a1a1a] border border-[#c9a227]/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c9a227] mb-4">Preventivi per Tipo di Lavoro</h2>
        
        {preventives.length === 0 ? (
          <p className="text-gray-400">Nessun preventivo salvato</p>
        ) : (
          <div className="space-y-3">
            {['Vernice', 'Stucchi Decorativi', 'Antimuffa', 'Marmurino', 'Resina', 'Carta da Parati', 'Tela da Parete', 'Altro'].map((type) => {
              const count = preventives.filter(p => p.calculator === type).length;
              const Totale = preventives
                .filter(p => p.calculator === type)
                .reduce((sum, p) => sum + (p.Totale || 0), 0);
              
              return count > 0 ? (
                <div key={type} className="flex justify-between items-center p-3 bg-[#0a0a0a] rounded border border-[#333]">
                  <div>
                    <p className="font-medium">{type}</p>
                    <p className="text-sm text-gray-400">{count} Preventivi</p>
                  </div>
                  <p className="font-bold text-[#c9a227]">€{Totale.toFixed(2)}</p>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Empty State */}
      {preventives.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Nessun Preventiva Salvata</p>
          <a href="/create-Preventivi" className="inline-block bg-[#c9a227] text-black px-6 py-2 rounded font-medium hover:bg-[#d4af37] transition-all">
            Crea Prima Preventiva
          </a>
        </div>
      )}
    </div>
  );
}
