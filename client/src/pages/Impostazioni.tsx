/**
 * Pagina Impostazioni - Decor Carpi
 * Accesso: /impostazioni
 * Pannello amministratore con monitoraggio costi AI
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminCostDashboard } from '@/components/AdminCostDashboard';
import { PromoCodesManager } from '@/components/PromoCodesManager';
import { Settings, BarChart3, Key } from 'lucide-react';

export default function Impostazioni() {
  const [activeTab, setActiveTab] = useState('costi');

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#c9a227] flex items-center gap-3">
          <Settings size={32} />
          Impostazioni
        </h1>
        <p className="text-gray-400 mt-2">Gestione pannello amministratore e monitoraggio costi</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a] border border-[#c9a227]/30 rounded-lg p-1">
          <TabsTrigger
            value="costi"
            className="data-[state=active]:bg-[#c9a227] data-[state=active]:text-[#0a0a0a] text-gray-300 rounded"
          >
            <BarChart3 size={18} className="mr-2" />
            Costi AI
          </TabsTrigger>
          <TabsTrigger
            value="generale"
            className="data-[state=active]:bg-[#c9a227] data-[state=active]:text-[#0a0a0a] text-gray-300 rounded"
          >
            <Settings size={18} className="mr-2" />
            Generale
          </TabsTrigger>
          <TabsTrigger
            value="coduri"
            className="data-[state=active]:bg-[#c9a227] data-[state=active]:text-[#0a0a0a] text-gray-300 rounded"
          >
            <Key size={18} className="mr-2" />
            Coduri Promo
          </TabsTrigger>
        </TabsList>

        {/* Tab: Costi AI */}
        <TabsContent value="costi" className="mt-6">
          <AdminCostDashboard />
        </TabsContent>

        {/* Tab: Generale */}
        <TabsContent value="generale" className="mt-6">
          <div className="bg-[#1a1a1a] border border-[#c9a227]/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-[#c9a227] mb-4">Impostazioni Generali</h2>
            <p className="text-gray-400">
              Sezione per impostazioni generali dell'applicazione (in sviluppo)
            </p>
          </div>
        </TabsContent>

        {/* Tab: Coduri Promo */}
        <TabsContent value="coduri" className="mt-6">
          <PromoCodesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
