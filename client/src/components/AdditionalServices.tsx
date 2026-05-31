import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: string;
  details: string[];
}

const SERVICES: Service[] = [
  {
    id: "color-consultation",
    title: "Consulenza Colori",
    description: "Consulenza personalizzata per la scelta dei colori e delle texture",
    price: "€50",
    icon: "🎨",
    details: [
      "Analisi della luce naturale e artificiale",
      "Suggerimenti basati sullo stile dell'ambiente",
      "Campioni di colore personalizzati",
      "Durata: 1 ora"
    ]
  },
  {
    id: "wall-prep",
    title: "Preparazione Pareti",
    description: "Preparazione professionale delle pareti prima dell'applicazione",
    price: "€15/m²",
    icon: "🔨",
    details: [
      "Pulizia e sgrassaggio",
      "Stuccatura crepe e imperfezioni",
      "Carteggiatura e levigatura",
      "Primer di base"
    ]
  },
  {
    id: "maintenance",
    title: "Manutenzione e Pulizia",
    description: "Servizio di manutenzione periodica per mantenere le finiture",
    price: "€30/ora",
    icon: "🧹",
    details: [
      "Pulizia specializzata",
      "Ritocchi e riparazioni minori",
      "Trattamento protettivo",
      "Consulenza di manutenzione"
    ]
  },
  {
    id: "design-consultation",
    title: "Progettazione d'Interni",
    description: "Consulenza completa per il design dell'ambiente",
    price: "€100",
    icon: "📐",
    details: [
      "Analisi dello spazio",
      "Proposta di layout e design",
      "Selezione materiali e finiture",
      "Rendering 3D (opzionale)"
    ]
  },
  {
    id: "emergency-service",
    title: "Servizio d'Emergenza",
    description: "Intervento rapido per problemi urgenti",
    price: "€200 + costi",
    icon: "🚨",
    details: [
      "Disponibilità 24/7",
      "Intervento entro 48 ore",
      "Diagnosi e soluzione rapida",
      "Garanzia di qualità"
    ]
  },
  {
    id: "warranty",
    title: "Garanzia Estesa",
    description: "Protezione estesa per i tuoi lavori",
    price: "€150/anno",
    icon: "🛡️",
    details: [
      "Copertura 3 anni",
      "Manutenzione gratuita",
      "Ritocchi inclusi",
      "Supporto prioritario"
    ]
  }
];

export function AdditionalServices() {
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const toggleService = (id: string) => {
    setExpandedService(expandedService === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
        ⭐ Servizi Aggiuntivi
      </h3>
      <p className="text-[#aaa] text-xs leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
        Scopri i nostri servizi complementari per completare il tuo progetto.
      </p>

      <div className="grid grid-cols-1 gap-2">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            className="rounded-sm overflow-hidden transition-all"
            style={{
              background: expandedService === service.id 
                ? "rgba(201,162,39,0.1)" 
                : "rgba(201,162,39,0.05)",
              border: "1px solid rgba(201,162,39,0.25)"
            }}
          >
            {/* Header */}
            <button
              onClick={() => toggleService(service.id)}
              className="w-full p-3 flex items-start justify-between gap-3 hover:bg-[rgba(201,162,39,0.05)] transition"
            >
              <div className="flex items-start gap-3 flex-1 text-left">
                <span style={{ fontSize: "20px" }}>{service.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                    {service.title}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
                    {service.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                  {service.price}
                </span>
                {expandedService === service.id ? (
                  <ChevronUp size={16} style={{ color: "#c9a227" }} />
                ) : (
                  <ChevronDown size={16} style={{ color: "#c9a227" }} />
                )}
              </div>
            </button>

            {/* Details */}
            {expandedService === service.id && (
              <div className="px-3 pb-3 pt-0 border-t" style={{ borderColor: "rgba(201,162,39,0.15)" }}>
                <ul className="space-y-1">
                  {service.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span style={{ color: "#c9a227", fontSize: "12px" }}>✓</span>
                      <span className="text-[10px]" style={{ color: "#aaa", fontFamily: "'Open Sans', sans-serif" }}>
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div
        className="p-3 rounded-sm text-xs"
        style={{
          background: "rgba(201,162,39,0.08)",
          border: "1px solid rgba(201,162,39,0.2)",
          color: "#aaa",
          fontFamily: "'Open Sans', sans-serif"
        }}
      >
        <p className="font-semibold mb-1" style={{ color: "#c9a227" }}>
          💡 Nota
        </p>
        <p>
          Tutti i servizi possono essere personalizzati in base alle tue esigenze. Contattaci per ricevere un preventivo dettagliato.
        </p>
      </div>
    </div>
  );
}
