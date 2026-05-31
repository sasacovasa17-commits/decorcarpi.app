import { useState, useCallback, useRef, useEffect } from 'react';

interface PendingPrompt {
  resolve: (value: string | null) => void;
  title: string;
  placeholder: string;
}

let pendingPrompt: PendingPrompt | null = null;

export function PromptDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose global function - SIMPLE și DIRECT
  const showPromptDialog = useCallback(
    (dialogTitle: string, dialogPlaceholder: string): Promise<string | null> => {
      return new Promise((resolve) => {
        pendingPrompt = { resolve, title: dialogTitle, placeholder: dialogPlaceholder };
        setTitle(dialogTitle);
        setPlaceholder(dialogPlaceholder);
        setInputValue('');
        setIsOpen(true);
      });
    },
    []
  );

  // Register global function on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).showPromptDialog = showPromptDialog;
    }
  }, [showPromptDialog]);

  const handleConfirm = () => {
    if (pendingPrompt) {
      // CRITICO: Citire DIRECTA din input element, NU din state!
      const valueFromInput = inputRef.current?.value || '';
      console.log('[PromptDialog] ===== CONFIRMING =====');
      console.log('[PromptDialog] inputRef.current?.value:', valueFromInput);
      console.log('[PromptDialog] inputValue (state):', inputValue);
      console.log('[PromptDialog] Sunt identice?', valueFromInput === inputValue);
      
      pendingPrompt.resolve(valueFromInput);
      pendingPrompt = null;
    }
    setIsOpen(false);
    setInputValue('');
  };

  const handleCancel = () => {
    if (pendingPrompt) {
      console.log('[PromptDialog] Cancelled');
      pendingPrompt.resolve(null);
      pendingPrompt = null;
    }
    setIsOpen(false);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white/40 backdrop-blur-sm rounded-lg p-6 w-80 shadow-2xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('[PromptDialog] Input changed to:', newValue);
            setInputValue(newValue);
          }}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-[#c9a227] text-white rounded-md hover:bg-[#b8921f]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
