/**
 * TextureComparison Component - Side-by-side texture comparison
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Texture {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface TextureComparisonProps {
  textures: Texture[];
  onClose?: () => void;
}

export function TextureComparison({ textures, onClose }: TextureComparisonProps) {
  const [selectedTextures, setSelectedTextures] = useState<Texture[]>([]);
  const [sliderPosition, setSliderPosition] = useState(50);

  const toggleTextureSelection = (texture: Texture) => {
    if (selectedTextures.find((t) => t.id === texture.id)) {
      setSelectedTextures(selectedTextures.filter((t) => t.id !== texture.id));
    } else if (selectedTextures.length < 3) {
      setSelectedTextures([...selectedTextures, texture]);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Compara Texture</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Texture Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Seleziona pana la 3 texture</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {textures.map((texture) => (
            <button
              key={texture.id}
              onClick={() => toggleTextureSelection(texture)}
              className={`p-3 rounded-lg border-2 transition ${
                selectedTextures.find((t) => t.id === texture.id)
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <img
                src={texture.imageUrl}
                alt={texture.name}
                className="w-full h-20 object-cover rounded mb-2"
              />
              <p className="text-xs font-semibold text-gray-900 truncate">
                {texture.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison View */}
      {selectedTextures.length > 0 && (
        <div className="space-y-6">
          {selectedTextures.length === 2 && (
            <div className="relative h-96 overflow-hidden rounded-lg">
              <div className="absolute inset-0 flex">
                {/* First Texture */}
                <div className="flex-1 overflow-hidden">
                  <img
                    src={selectedTextures[0].imageUrl}
                    alt={selectedTextures[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Slider */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize hover:w-2 transition"
                  style={{ left: `${sliderPosition}%` }}
                  onMouseDown={(e) => {
                    const startX = e.clientX;
                    const startPos = sliderPosition;
                    const container = e.currentTarget.parentElement;
                    const containerWidth = container?.offsetWidth || 0;

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const deltaX = moveEvent.clientX - startX;
                      const newPos = Math.max(
                        0,
                        Math.min(100, startPos + (deltaX / containerWidth) * 100)
                      );
                      setSliderPosition(newPos);
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                    <div className="w-4 h-4 bg-amber-600 rounded-full" />
                  </div>
                </div>

                {/* Second Texture */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${100 - sliderPosition}%`, right: 0 }}
                >
                  <img
                    src={selectedTextures[1].imageUrl}
                    alt={selectedTextures[1].name}
                    className="w-full h-full object-cover"
                    style={{ marginLeft: `-${sliderPosition}%` }}
                  />
                </div>
              </div>

              {/* Labels */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm font-semibold">
                {selectedTextures[0].name}
              </div>
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm font-semibold">
                {selectedTextures[1].name}
              </div>
            </div>
          )}

          {selectedTextures.length === 3 && (
            <div className="grid grid-cols-3 gap-4">
              {selectedTextures.map((texture) => (
                <div key={texture.id} className="rounded-lg overflow-hidden">
                  <img
                    src={texture.imageUrl}
                    alt={texture.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="bg-gray-100 p-3">
                    <h4 className="font-semibold text-gray-900">
                      {texture.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {texture.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comparison Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Detalii Comparatie</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedTextures.map((texture) => (
                <div key={texture.id} className="border-l-4 border-amber-600 pl-3">
                  <p className="font-semibold text-gray-900">{texture.name}</p>
                  <p className="text-sm text-gray-600">{texture.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTextures.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Seleziona cel putin 2 texture pentru a compara
        </div>
      )}
    </div>
  );
}
