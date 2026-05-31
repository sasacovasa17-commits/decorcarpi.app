/**
 * TextureVariants Component - Display color variants for each texture
 */

import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextureVariant {
  id: string;
  name: string;
  color: string;
  hexCode: string;
  imageUrl: string;
}

interface TextureVariantsProps {
  textureName: string;
  variants: TextureVariant[];
  onSelectVariant: (variant: TextureVariant) => void;
}

export function TextureVariants({ textureName, variants, onSelectVariant }: TextureVariantsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);

  const handleSelectVariant = (variant: TextureVariant) => {
    setSelectedVariantId(variant.id);
    onSelectVariant(variant);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="w-5 h-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-foreground">
          {textureName} - Color Variants
        </h3>
      </div>

      {/* Variant Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => handleSelectVariant(variant)}
            className={`p-3 rounded-lg border-2 transition ${
              selectedVariantId === variant.id
                ? 'border-amber-600 bg-amber-50'
                : 'border-border hover:border-amber-400'
            }`}
          >
            {/* Color Preview */}
            <div
              className="w-full h-24 rounded-md mb-3 border border-border"
              style={{ backgroundColor: variant.hexCode }}
            />

            {/* Variant Info */}
            <p className="font-semibold text-sm text-foreground">{variant.name}</p>
            <p className="text-xs text-muted-foreground">{variant.hexCode}</p>
          </button>
        ))}
      </div>

      {/* Selected Variant Preview */}
      {selectedVariantId && (
        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="font-semibold text-foreground mb-4">Preview</h4>
          <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
            <img
              src={variants.find((v) => v.id === selectedVariantId)?.imageUrl}
              alt="texture variant preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Pulsanti Azione */}
      <div className="flex gap-3 mt-6">
        <Button className="flex-1 bg-amber-600 hover:bg-amber-700">
          Add to Project
        </Button>
        <Button variant="outline" className="flex-1">
          Compare All Variants
        </Button>
      </div>
    </div>
  );
}
