/**
 * TextureGallery Component - Showcase all textures with details
 */

import { useState } from 'react';
import { Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Texture {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  promptKeyword: string;
}

interface TextureGalleryProps {
  textures: Texture[];
  onTextureSelect?: (texture: Texture) => void;
}

export function TextureGallery({ textures, onTextureSelect }: TextureGalleryProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedTexture, setSelectedTexture] = useState<Texture | null>(null);

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const handleVisualize = (texture: Texture) => {
    setSelectedTexture(texture);
    onTextureSelect?.(texture);
  };

  return (
    <div className="w-full">
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {textures.map((texture) => (
          <div
            key={texture.id}
            className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Texture Image */}
            <div className="relative h-48 overflow-hidden bg-gray-200">
              <img
                src={texture.imageUrl}
                alt={texture.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={() => toggleFavorite(texture.id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.has(texture.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            </div>

            {/* Texture Info */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {texture.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{texture.description}</p>

              {/* Category Badge */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                  {texture.category}
                </span>
              </div>

              {/* Visualize Button */}
              <Button
                onClick={() => handleVisualize(texture)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Visualizza su Muro
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Texture Detail Modal */}
      {selectedTexture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedTexture.name}</h2>
              <img
                src={selectedTexture.imageUrl}
                alt={selectedTexture.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <p className="text-gray-700 mb-4">{selectedTexture.description}</p>
              <button
                onClick={() => setSelectedTexture(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
