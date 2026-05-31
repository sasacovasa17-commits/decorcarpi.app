/**
 * BeforeAfterSlider Component - Compare texture appearance under different lighting
 */

import { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  textureName: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Natural Light',
  afterLabel = 'Warm Light',
  textureName,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div className="w-full bg-white rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {textureName} - Lighting Comparison
      </h3>

      {/* Slider Container */}
      <div
        ref={containerRef}
        className="relative w-full h-96 rounded-lg overflow-hidden cursor-col-resize bg-gray-100 border border-border"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Right) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Before Image (Left) - Clipped */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-screen h-full object-cover"
            style={{ width: `${(100 / sliderPosition) * 100}%` }}
          />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* Handle Icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-gray-400 rounded-full" />
              <div className="w-1 h-4 bg-gray-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 text-white px-3 py-2 rounded">
          <Sun className="w-4 h-4" />
          <span className="text-sm font-semibold">{beforeLabel}</span>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 text-white px-3 py-2 rounded">
          <span className="text-sm font-semibold">{afterLabel}</span>
          <Moon className="w-4 h-4" />
        </div>
      </div>

      {/* Info */}
      <p className="text-sm text-muted-foreground mt-4">
        Drag the slider to compare how this texture appears under different lighting conditions.
      </p>
    </div>
  );
}
