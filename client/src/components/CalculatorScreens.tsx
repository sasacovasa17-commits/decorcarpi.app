/*
 * Calculator Screens - Separated for Performance
 * Stucchi, Vernice, Antimuffa calculators
 */

import { useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";


interface CalculatorScreensProps {
  onBack: () => void;
  t: any;
}

export function CalculatorPretScreen({ onBack, t }: CalculatorScreensProps) {
  const generatePreventivId = () => {
    const counter = parseInt(localStorage.getItem('preventiv_counter') || '0') + 1;
    localStorage.setItem('preventiv_counter', counter.toString());
    return `PREV-${String(counter).padStart(6, '0')}`;
  };
  
  const [preventivId, setPreventivId] = useState(() => generatePreventivId());
  const [mqPeretiCalcolati, setMqPeretiCalcolati] = useState(0);
  const [mqSoffittoCalcolati, setMqSoffittoCalcolati] = useState(0);
  const [mqPorteFinestre, setMqPorteFinestre] = useState(0);
  const [selectedTexture, setSelectedTexture] = useState<string>("");

  const mq = mqPeretiCalcolati + mqSoffittoCalcolati;
  const totalMin = Math.round(mq * 8);
  const totalMax = Math.round(mq * 12);

  const handleWhatsApp = () => {
    if (!totalMin || !totalMax) {
      toast.error("Inserisci i m² per calcolare il preventivo", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }
    const msg = `Ciao Decor Carpi! Vorrei un preventivo per Stucchi:\n\n• Muri: ${mqPeretiCalcolati.toFixed(1)} m²\n• Soffitto: ${mqSoffittoCalcolati.toFixed(1)} m²\n• Stima: €${totalMin} - €${totalMax}\n\nPotete confermarmi il prezzo e i tempi? Grazie!`;
    window.open(`https://wa.me/393343600932?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };



  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          Preventivo Stucchi
        </h1>
      </div>
      <div className="flex-1 px-5 py-6 pb-28 flex flex-col gap-5 overflow-y-auto">
        <div className="text-center">
          <p className="text-xs" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
            Calcola il preventivo per gli Stucchi decorativi
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              ID Preventivo
            </label>
            <input
              type="text"
              value={preventivId}
              onChange={(e) => setPreventivId(e.target.value.toUpperCase())}
              className="w-full mt-2 px-3 py-2 rounded-sm text-sm"
              style={{ background: "#1a1a1a", color: "#fff", border: "1px solid rgba(201,162,39,0.3)" }}
              placeholder="Es. PREV-001"
            />
          </div>
          <div>
            <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              Muri (m²)
            </label>
            <input
              type="number"
              value={mqPeretiCalcolati}
              onChange={(e) => setMqPeretiCalcolati(Number(e.target.value) || 0)}
              className="w-full mt-2 px-3 py-2 rounded-sm text-sm"
              style={{ background: "#1a1a1a", color: "#fff", border: "1px solid rgba(201,162,39,0.3)" }}
              placeholder="Ex: 50"
            />
          </div>
          <div>
            <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              Soffitto (m²)
            </label>
            <input
              type="number"
              value={mqSoffittoCalcolati}
              onChange={(e) => setMqSoffittoCalcolati(Number(e.target.value) || 0)}
              className="w-full mt-2 px-3 py-2 rounded-sm text-sm"
              style={{ background: "#1a1a1a", color: "#fff", border: "1px solid rgba(201,162,39,0.3)" }}
              placeholder="Ex: 30"
            />
          </div>
          <div>
            <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              Porte/Finestre (m²)
            </label>
            <input
              type="number"
              value={mqPorteFinestre}
              onChange={(e) => setMqPorteFinestre(Number(e.target.value) || 0)}
              className="w-full mt-2 px-3 py-2 rounded-sm text-sm"
              style={{ background: "#1a1a1a", color: "#fff", border: "1px solid rgba(201,162,39,0.3)" }}
              placeholder="Ex: 5"
            />
          </div>
          <div>
            <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              Texture (Opzionale)
            </label>
            <input
              type="text"
              value={selectedTexture}
              onChange={(e) => setSelectedTexture(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-sm text-sm"
              style={{ background: "#1a1a1a", color: "#fff", border: "1px solid rgba(201,162,39,0.3)" }}
              placeholder="Es. Pietra Zen"
            />
          </div>
        </div>

        {/* Estimate */}
        <div className="p-4 rounded-sm" style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)" }}>
          <p className="text-xs" style={{ color: "#888" }}>Stima Prezzo</p>
          <p className="text-2xl font-bold mt-2" style={{ color: "#c9a227" }}>
            €{totalMin} - €{totalMax}
          </p>
          {mq > 0 && (
            <p className="text-xs mt-2" style={{ color: "#999" }}>
              {mq.toFixed(2)} m² @ €{(totalMin / mq).toFixed(0)} - €{(totalMax / mq).toFixed(0)}/m²
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pb-4">


          <button
            onClick={handleWhatsApp}
            className="w-full py-3 rounded-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{ background: "#25d366", color: "#fff" }}
          >
            <MessageCircle size={18} /> WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
