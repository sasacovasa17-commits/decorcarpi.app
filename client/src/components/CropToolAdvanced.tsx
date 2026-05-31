import { useState, useRef, useCallback } from 'react';
import { Move, Copy, Lock, Unlock } from 'lucide-react';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type AspectRatio = 'free' | '1:1' | '16:9' | '4:3';

interface CropPreset {
  name: string;
  label: string;
  width: number;
  height: number;
}

interface CropToolAdvancedProps {
  imageUrl: string;
  onCropChange: (cropArea: CropArea) => void;
  onClose: () => void;
}

const CROP_PRESETS: CropPreset[] = [
  { name: 'full-wall', label: '🏠 Full Wall', width: 400, height: 300 },
  { name: 'door-area', label: '🚪 Door Area', width: 150, height: 250 },
  { name: 'window-area', label: '🪟 Window Area', width: 200, height: 200 },
];

const ASPECT_RATIOS: { ratio: AspectRatio; label: string }[] = [
  { ratio: 'free', label: 'Free' },
  { ratio: '1:1', label: '1:1 (Square)' },
  { ratio: '16:9', label: '16:9 (Landscape)' },
  { ratio: '4:3', label: '4:3 (Standard)' },
];

export function CropToolAdvanced({ imageUrl, onCropChange, onClose }: CropToolAdvancedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free');
  const [lockAspectRatio, setLockAspectRatio] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
  });

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Calcola aspect ratio din Dimensioni
  const getAspectRatioValue = (ratio: AspectRatio): number => {
    switch (ratio) {
      case '1:1':
        return 1;
      case '16:9':
        return 16 / 9;
      case '4:3':
        return 4 / 3;
      default:
        return 0;
    }
  };

  // Applica aspect ratio la Dimensioni
  const applyAspectRatio = (width: number, height: number, ratio: AspectRatio): { width: number; height: number } => {
    if (ratio === 'free') return { width, height };

    const targetRatio = getAspectRatioValue(ratio);
    const currentRatio = width / height;

    if (currentRatio > targetRatio) {
      return { width: Math.round(height * targetRatio), height };
    } else {
      return { width, height: Math.round(width / targetRatio) };
    }
  };

  // Applica preset
  const applyPreset = (preset: CropPreset) => {
    setCropArea({
      x: Math.max(0, (imageSize.width - preset.width) / 2),
      y: Math.max(0, (imageSize.height - preset.height) / 2),
      width: Math.min(preset.width, imageSize.width),
      height: Math.min(preset.height, imageSize.height),
    });
  };

  // Carica imaginea și Disegna preview
  const loadImage = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / img.width;
      const scaleY = rect.height / img.height;
      const scale = Math.min(scaleX, scaleY);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Disegna l'immagine
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Disegna l'area di ritaglio
      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        cropArea.x * scale,
        cropArea.y * scale,
        cropArea.width * scale,
        cropArea.height * scale
      );

      // Disegna handle
      const handleSize = 8;
      ctx.fillStyle = '#c9a227';
      const corners = [
        [cropArea.x, cropArea.y],
        [cropArea.x + cropArea.width, cropArea.y],
        [cropArea.x, cropArea.y + cropArea.height],
        [cropArea.x + cropArea.width, cropArea.y + cropArea.height],
      ];

      corners.forEach(([x, y]) => {
        ctx.fillRect(x * scale - handleSize / 2, y * scale - handleSize / 2, handleSize, handleSize);
      });
    };
    img.src = imageUrl;
  }, [imageUrl, cropArea]);

  useState(() => {
    loadImage();
  });

  // Mouse down - incepe drag sau resize
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / imageSize.width);
    const y = (e.clientY - rect.top) / (rect.height / imageSize.height);

    // Verifica se fare clic su handle (ridimensiona)
    const handleSize = 15;
    const corners = [
      { x: cropArea.x, y: cropArea.y, handle: 'top-left' },
      { x: cropArea.x + cropArea.width, y: cropArea.y, handle: 'top-right' },
      { x: cropArea.x, y: cropArea.y + cropArea.height, handle: 'bottom-left' },
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height, handle: 'bottom-right' },
    ];

    for (const corner of corners) {
      if (Math.abs(x - corner.x) < handleSize && Math.abs(y - corner.y) < handleSize) {
        setIsResizing(true);
        setResizeHandle(corner.handle);
        return;
      }
    }

    // Verifica se fare clic nell'area di ritaglio (trascina)
    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true);
    }
  };

  // Mouse move - drag sau resize
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / imageSize.width);
    const y = (e.clientY - rect.top) / (rect.height / imageSize.height);

    if (isDragging) {
      // Pan - sposta l'area di ritaglio
      const deltaX = x - (cropArea.x + cropArea.width / 2);
      const deltaY = y - (cropArea.y + cropArea.height / 2);

      setCropArea((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(imageSize.width - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(imageSize.height - prev.height, prev.y + deltaY)),
      }));
    } else if (isResizing && resizeHandle) {
      // Ridimensiona - ridimensiona l'area di ritaglio
      setCropArea((prev) => {
        let newCrop = { ...prev };

        if (resizeHandle.includes('top')) {
          newCrop.y = Math.max(0, y);
          newCrop.height = prev.y + prev.height - newCrop.y;
        }
        if (resizeHandle.includes('bottom')) {
          newCrop.height = Math.max(50, y - prev.y);
        }
        if (resizeHandle.includes('left')) {
          newCrop.x = Math.max(0, x);
          newCrop.width = prev.x + prev.width - newCrop.x;
        }
        if (resizeHandle.includes('right')) {
          newCrop.width = Math.max(50, x - prev.x);
        }

        // Applica proporzioni se attivato
        if (lockAspectRatio && aspectRatio !== 'free') {
          const { width, height } = applyAspectRatio(newCrop.width, newCrop.height, aspectRatio);
          newCrop.width = width;
          newCrop.height = height;
        }

        return newCrop;
      });
    }
  };

  // Mouse up - termină drag/resize
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    onCropChange(cropArea);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg p-4 w-full max-w-3xl border" style={{ borderColor: 'rgba(201,162,39,0.3)' }}>
        <h2 className="text-sm font-bold mb-3" style={{ color: '#c9a227', fontFamily: "'Raleway', sans-serif" }}>
          Seleziona l'area di ritaglio
        </h2>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full border cursor-move mb-4"
          style={{ borderColor: 'rgba(201,162,39,0.3)', maxHeight: '50vh' }}
        />

        {/* Aspect Ratio Controls */}
        <div className="mb-4 p-3 rounded-sm" style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold" style={{ color: '#c9a227', fontFamily: "'Raleway', sans-serif" }}>
              Aspect Ratio
            </label>
            <button
              onClick={() => setLockAspectRatio(!lockAspectRatio)}
              className="p-1 rounded-sm transition-colors"
              style={{ background: lockAspectRatio ? 'rgba(201,162,39,0.3)' : 'rgba(201,162,39,0.1)', color: '#c9a227' }}
              title={lockAspectRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            >
              {lockAspectRatio ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.ratio}
                onClick={() => {
                  setAspectRatio(ar.ratio);
                  if (ar.ratio !== 'free') {
                    setLockAspectRatio(true);
                  }
                }}
                className="px-2 py-1 rounded-sm text-xs font-semibold transition-colors"
                style={{
                  background: aspectRatio === ar.ratio ? 'rgba(201,162,39,0.4)' : 'rgba(201,162,39,0.1)',
                  color: '#c9a227',
                  border: aspectRatio === ar.ratio ? '1px solid #c9a227' : '1px solid rgba(201,162,39,0.2)',
                }}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ritaglio Presets */}
        <div className="mb-4 p-3 rounded-sm" style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#c9a227', fontFamily: "'Raleway', sans-serif" }}>
            Presets Rapide
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CROP_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="px-3 py-2 rounded-sm text-xs font-semibold transition-colors"
                style={{ background: 'rgba(201,162,39,0.2)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pulsanti Azione */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-sm text-xs font-semibold"
            style={{ background: 'rgba(201,162,39,0.2)', color: '#c9a227' }}
          >
            Annulla
          </button>
          <button
            onClick={() => {
              onCropChange(cropArea);
              onClose();
            }}
            className="px-4 py-2 rounded-sm text-xs font-semibold flex items-center gap-2"
            style={{ background: '#c9a227', color: '#000' }}
          >
            <Copy size={14} />
            Applica Ritaglio
          </button>
        </div>
      </div>
    </div>
  );
}
