import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [copied, setCopied] = useState(false);
  const [inputValue, setInputValue] = useState(color);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Validate HEX format
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onChange(val);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
  };

  return (
    <div className="flex flex-col gap-3">
      {label && <label className="text-sm font-medium" style={{ color: "#c9a227" }}>{label}</label>}
      
      <div className="flex items-center gap-3">
        {/* Native Color Picker */}
        <input
          type="color"
          value={color}
          onChange={handleColorPickerChange}
          className="w-16 h-16 rounded cursor-pointer border-2"
          style={{
            borderColor: "rgba(201,162,39,0.5)",
          }}
          title="Seleziona colore"
        />
        
        {/* HEX input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="flex-1 px-3 py-2 rounded text-sm font-mono"
          style={{
            background: "#2a2a2a",
            color: "#e8e8e8",
            border: "1px solid rgba(201,162,39,0.3)",
          }}
          placeholder="#RRGGBB"
        />
        
        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="p-2 rounded hover:bg-gray-700 transition-colors"
          title="Copia il codice colore"
        >
          {copied ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy size={16} className="text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}
