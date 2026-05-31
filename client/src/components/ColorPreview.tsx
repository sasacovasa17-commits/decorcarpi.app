import React from 'react';

interface ColorPreviewProps {
  bgColor: string;
  accentColor: string;
  goldColor: string;
}

export function ColorPreview({ bgColor, accentColor, goldColor }: ColorPreviewProps) {
  return (
    <div
      className="p-4 rounded-sm border"
      style={{
        background: bgColor,
        borderColor: `${goldColor}33`,
      }}
    >
      <h4 className="text-xs font-bold mb-3" style={{ color: goldColor, fontFamily: "'Raleway', sans-serif" }}>
        📋 Anteprima Tema
      </h4>

      {/* Card Example */}
      <div
        className="p-3 rounded-sm mb-3 border"
        style={{
          background: `${goldColor}14`,
          borderColor: `${goldColor}33`,
        }}
      >
        <p className="text-xs font-bold mb-2" style={{ color: goldColor, fontFamily: "'Raleway', sans-serif" }}>
          Titolo Card
        </p>
        <p className="text-xs mb-3" style={{ color: accentColor, fontFamily: "'Open Sans', sans-serif" }}>
          Questo è un esempio di testo con il colore Accento selezionato
        </p>

        {/* Button Examples */}
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded-sm text-xs font-bold"
            style={{
              background: goldColor,
              color: bgColor,
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            Pulsante
          </button>
          <button
            className="px-3 py-1 rounded-sm text-xs font-bold border"
            style={{
              background: 'transparent',
              color: goldColor,
              borderColor: `${goldColor}66`,
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            Outline
          </button>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="flex gap-2 items-center">
        <div className="text-xs" style={{ color: accentColor, fontFamily: "'Open Sans', sans-serif" }}>
          Colori:
        </div>
        <div
          className="w-6 h-6 rounded-sm border"
          style={{ background: bgColor, borderColor: `${goldColor}66` }}
          title={`Sfondo: ${bgColor}`}
        />
        <div
          className="w-6 h-6 rounded-sm border"
          style={{ background: accentColor, borderColor: `${goldColor}66` }}
          title={`Accento: ${accentColor}`}
        />
        <div
          className="w-6 h-6 rounded-sm border"
          style={{ background: goldColor, borderColor: `${goldColor}66` }}
          title={`Oro: ${goldColor}`}
        />
      </div>
    </div>
  );
}
