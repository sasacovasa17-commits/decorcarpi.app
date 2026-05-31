import { useState, useRef, useCallback } from 'react';
import { Move, Copy } from 'lucide-react';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropToolProps {
  imageUrl: string;
  onCropChange: (cropArea: CropArea) => void;
  onClose: () => void;
}

export function CropTool({ imageUrl, onCropChange, onClose }: CropToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
  });

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

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

  // Redraw pe schimbare
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
      <div className="bg-[#1a1a1a] rounded-lg p-4 w-full max-w-2xl border" style={{ borderColor: 'rgba(201,162,39,0.3)' }}>
        <h2 className="text-sm font-bold mb-3" style={{ color: '#c9a227', fontFamily: "'Raleway', sans-serif" }}>
          Seleziona l'area di ritaglio
        </h2>

        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full border cursor-move"
          style={{ borderColor: 'rgba(201,162,39,0.3)', maxHeight: '60vh' }}
        />

        <div className="flex gap-2 mt-4 justify-end">
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
