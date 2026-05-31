import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { RotateCw, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageCropEditorProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export function ImageCropEditor({ imageSrc, onCropComplete, onCancel }: ImageCropEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropAreaChange = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCropImage = useCallback(async () => {
    try {
      if (!croppedAreaPixels) {
        toast.error('Seleziona un\'area per il ritaglio', {
          style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
        });
        return;
      }

      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          toast.error('Errore canvas', {
            style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
          });
          return;
        }

        // Imposta le dimensioni del canvas
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // Rotazione e ritaglio
        const pixelData = croppedAreaPixels as any;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(
          image,
          pixelData.x - image.width / 2,
          pixelData.y - image.height / 2
        );

        const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
        onCropComplete(croppedImage);

        toast.success('Immagine ritagliata con successo!', {
          style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
        });
      };
    } catch (err) {
      console.error('Errore nel ritaglio:', err);
      toast.error('Errore nell\'elaborazione dell\'immagine', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
    }
  }, [croppedAreaPixels, imageSrc, rotation, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col z-50">
      <div className="flex-1 relative overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9}
          onCropChange={setCrop}
          onCropAreaChange={onCropAreaChange}
          onZoomChange={setZoom}
          rotation={rotation}
        />
      </div>

      {/* Controls */}
      <div className="bg-[#1a0a0a] p-4 border-t" style={{ borderColor: 'rgba(201,162,39,0.3)' }}>
        {/* Zoom Slider */}
        <div className="mb-4">
          <label className="text-xs font-bold mb-2 block" style={{ color: '#c9a227' }}>
            Zoom: {Math.round(zoom * 100)}%
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full"
            style={{
              accentColor: '#c9a227',
            }}
          />
        </div>

        {/* Rotation */}
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={handleRotate}
            className="flex-1 py-2 rounded-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{ background: 'rgba(201,162,39,0.2)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.4)' }}
          >
            <RotateCw size={16} /> Rotire 90°
          </button>
          <span className="text-xs" style={{ color: '#888' }}>
            {rotation}°
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{ background: 'rgba(255,107,107,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.4)' }}
          >
            <X size={16} /> Annulla
          </button>
          <button
            onClick={handleCropImage}
            className="flex-1 py-2 rounded-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{ background: 'rgba(76,175,80,0.2)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.4)' }}
          >
            <Check size={16} /> Conferma
          </button>
        </div>
      </div>
    </div>
  );
}
