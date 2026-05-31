import { useState, useCallback, useEffect } from 'react';
import { RotateCcw, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageFiltersProps {
  imageSrc: string;
  onFiltersApply: (filteredImage: string) => void;
  onCancel: () => void;
}

export function ImageFilters({ imageSrc, onFiltersApply, onCancel }: ImageFiltersProps) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(imageSrc);

  const applyFilters = useCallback(() => {
    try {
      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          toast.error('Errore canvas', {
            style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
          });
          return;
        }

        // Disegna imaginea originală
        ctx.drawImage(image, 0, 0);

        // Applica filtrele CSS
        const brightnessValue = brightness / 100 + 1;
        const contrastValue = contrast / 100 + 1;
        const saturationValue = saturation / 100 + 1;

        const filter = `brightness(${brightnessValue}) contrast(${contrastValue}) saturate(${saturationValue})`;
        ctx.filter = filter;
        ctx.drawImage(image, 0, 0);

        const filteredImage = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewUrl(filteredImage);
      };
    } catch (err) {
      console.error('Errore în aplicare filtre:', err);
    }
  }, [imageSrc, brightness, contrast, saturation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [brightness, contrast, saturation, applyFilters]);

  const handleApply = () => {
    onFiltersApply(previewUrl);
    toast.success('Filtre aplicate cu Successo!', {
      style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
    });
  };

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setPreviewUrl(imageSrc);
    toast.info('Filtre resetate', {
      style: { background: '#1a0a0a', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col z-50">
      {/* Preview */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <img
          src={previewUrl}
          alt="Preview"
          className="max-w-full max-h-full rounded-sm"
          style={{ maxWidth: '90%', maxHeight: '70vh' }}
        />
      </div>

      {/* Controls */}
      <div className="bg-[#1a0a0a] p-4 border-t" style={{ borderColor: 'rgba(201,162,39,0.3)' }}>
        {/* Brightness */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold" style={{ color: '#c9a227' }}>
              ☀️ Luminozitate
            </label>
            <span className="text-xs" style={{ color: '#888' }}>
              {brightness > 0 ? '+' : ''}{brightness}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="w-full"
            style={{ accentColor: '#c9a227' }}
          />
        </div>

        {/* Contrasto */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold" style={{ color: '#c9a227' }}>
              ◐ Contrast
            </label>
            <span className="text-xs" style={{ color: '#888' }}>
              {contrast > 0 ? '+' : ''}{contrast}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={contrast}
            onChange={(e) => setContrast(parseInt(e.target.value))}
            className="w-full"
            style={{ accentColor: '#c9a227' }}
          />
        </div>

        {/* Saturation */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold" style={{ color: '#c9a227' }}>
              🎨 Saturație
            </label>
            <span className="text-xs" style={{ color: '#888' }}>
              {saturation > 0 ? '+' : ''}{saturation}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={saturation}
            onChange={(e) => setSaturation(parseInt(e.target.value))}
            className="w-full"
            style={{ accentColor: '#c9a227' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-2 rounded-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{ background: 'rgba(201,162,39,0.2)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.4)' }}
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{ background: 'rgba(255,107,107,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.4)' }}
          >
            <X size={16} /> Annulla
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2 rounded-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{ background: 'rgba(76,175,80,0.2)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.4)' }}
          >
            <Check size={16} /> Applica
          </button>
        </div>
      </div>
    </div>
  );
}
