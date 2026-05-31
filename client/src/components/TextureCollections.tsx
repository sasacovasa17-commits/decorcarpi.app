/**
 * TextureCollections Component - Themed texture collections
 */

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Texture {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  textureIds: string[];
  recommendations: string;
}

interface TextureCollectionsProps {
  textures: Texture[];
  onTextureSelect?: (texture: Texture) => void;
}

const COLLECTIONS: Collection[] = [
  {
    id: 'luxe',
    name: 'Luxe',
    description: 'Eleganta si sofisticatie pentru spatii premium',
    icon: '✨',
    color: 'from-purple-500 to-pink-500',
    textureIds: ['marmorino', 'marmorino-premium', 'stucco-venexian', 'perlato'],
    recommendations: 'Perfecta pentru living-uri elegante, dormitoare de lux, si spatii de receptie. Combina bine cu mobilier clasic si accesorii aurii.',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Linii curate si design contemporan',
    icon: '🏢',
    color: 'from-blue-500 to-cyan-500',
    textureIds: ['effetto-cimento', 'effetto-cimento-tiles', 'pietra-zen', 'stencil'],
    recommendations: 'Ideala pentru birouri, apartamente moderne, si spatii minimaliste. Combina cu mobilier geometric si accesorii metalice.',
  },
  {
    id: 'rustic',
    name: 'Rustic',
    description: 'Caldura si caracter natural',
    icon: '🌾',
    color: 'from-amber-500 to-orange-500',
    textureIds: ['pietra-spaccata', 'pelle-elefante', 'pietra-bamboo', 'mappa-mondo'],
    recommendations: 'Potrivita pentru case de tara, cabane, si spatii cu stil rustic. Combina cu lemn natural si textile calde.',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Stil urban si robust',
    icon: '⚙️',
    color: 'from-gray-600 to-slate-700',
    textureIds: ['effetto-cimento', 'effetto-cimento-tiles', 'fila-seta', 'pietra-spaccata'],
    recommendations: 'Perfecta pentru loft-uri, spatii comerciale, si design industrial. Combina cu metal, beton, si accesorii vintage.',
  },
];

export function TextureCollections({ textures, onTextureSelect }: TextureCollectionsProps) {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const getCollectionTextures = (collection: Collection): Texture[] => {
    return collection.textureIds
      .map((id) => textures.find((t) => t.id === id))
      .filter((t): t is Texture => t !== undefined);
  };

  return (
    <div className="w-full">
      {!selectedCollection ? (
        // Collections Grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {COLLECTIONS.map((collection) => (
            <button
              key={collection.id}
              onClick={() => setSelectedCollection(collection)}
              className={`bg-gradient-to-br ${collection.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow text-left group`}
            >
              <div className="text-4xl mb-3">{collection.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>
              <p className="text-white/90 mb-4">{collection.description}</p>
              <div className="flex items-center text-white/80 group-hover:text-white transition">
                <span className="text-sm font-semibold">
                  {getCollectionTextures(collection).length} texture
                </span>
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        // Collection Details
        <div className="p-6">
          <button
            onClick={() => setSelectedCollection(null)}
            className="mb-6 text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-2"
          >
            ← Inapoi la Colectii
          </button>

          <div className={`bg-gradient-to-br ${selectedCollection.color} rounded-lg p-8 text-white mb-6`}>
            <div className="text-5xl mb-4">{selectedCollection.icon}</div>
            <h2 className="text-3xl font-bold mb-2">{selectedCollection.name}</h2>
            <p className="text-white/90 mb-4">{selectedCollection.description}</p>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm">{selectedCollection.recommendations}</p>
            </div>
          </div>

          {/* Collection Textures */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Texture din Colectia {selectedCollection.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCollectionTextures(selectedCollection).map((texture) => (
                <div
                  key={texture.id}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <img
                    src={texture.imageUrl}
                    alt={texture.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      {texture.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {texture.description}
                    </p>
                    <Button
                      onClick={() => onTextureSelect?.(texture)}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Seleziona
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Combination Tips */}
          <div className="mt-8 bg-amber-50 rounded-lg p-6 border-l-4 border-amber-600">
            <h4 className="text-lg font-bold text-gray-900 mb-3">💡 Sfaturi de Combinatie</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Combina 2-3 texture din aceeasi colectie pentru armonie vizuala</li>
              <li>• Usa o textura dominanta si 1-2 accenturi</li>
              <li>• Ia in considerare iluminarea naturala a spatiului</li>
              <li>• Testeaza sample-uri pe Muro inainte de aplicare</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
