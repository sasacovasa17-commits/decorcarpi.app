import React from 'react';
import { Maximize, Minimize } from 'lucide-react';

interface AutoFitToggleProps {
  isFitToScreen: boolean;
  onToggle: () => void;
  theme?: {
    accentColor: string;
    textColor: string;
  };
}

export const AutoFitToggle: React.FC<AutoFitToggleProps> = ({
  isFitToScreen,
  onToggle,
  theme = { accentColor: '#c9a227', textColor: '#ffffff' },
}) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-2 rounded border transition-all"
      style={{
        borderColor: theme.accentColor,
        backgroundColor: isFitToScreen ? theme.accentColor : 'transparent',
        color: isFitToScreen ? '#000' : theme.textColor,
      }}
      title={isFitToScreen ? 'Dimensione reale' : 'Adatta allo schermo'}
    >
      {isFitToScreen ? (
        <>
          <Minimize size={16} />
          <span className="text-sm font-medium">Fit</span>
        </>
      ) : (
        <>
          <Maximize size={16} />
          <span className="text-sm font-medium">Full</span>
        </>
      )}
    </button>
  );
};
