import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageComparisonEnhancedProps {
  beforeImage: string;
  afterImage: string;
  orientation?: 'horizontal' | 'vertical';
  onOrientationChange?: (orientation: 'horizontal' | 'vertical') => void;
  theme?: {
    accentColor: string;
    textColor: string;
  };
}

export const ImageComparisonEnhanced: React.FC<ImageComparisonEnhancedProps> = ({
  beforeImage,
  afterImage,
  orientation = 'horizontal',
  onOrientationChange,
  theme = { accentColor: '#c9a227', textColor: '#ffffff' },
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (orientation === 'horizontal') {
      const newPos = ((clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.max(0, Math.min(100, newPos)));
    } else {
      const newPos = ((clientY - rect.top) / rect.height) * 100;
      setSliderPos(Math.max(0, Math.min(100, newPos)));
    }
  };

  const isHorizontal = orientation === 'horizontal';

  return (
    <div className="flex flex-col gap-3">
      {/* Orientation Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onOrientationChange?.('horizontal')}
          className={`px-3 py-2 rounded text-sm font-medium transition-all ${
            isHorizontal ? 'bg-opacity-100' : 'bg-opacity-50'
          }`}
          style={{
            backgroundColor: theme.accentColor,
            color: '#000',
          }}
        >
          ↔ Orizontal
        </button>
        <button
          onClick={() => onOrientationChange?.('vertical')}
          className={`px-3 py-2 rounded text-sm font-medium transition-all ${
            !isHorizontal ? 'bg-opacity-100' : 'bg-opacity-50'
          }`}
          style={{
            backgroundColor: theme.accentColor,
            color: '#000',
          }}
        >
          ↕ Vertical
        </button>
      </div>

      {/* Comparison Slider */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded bg-black"
        style={{
          aspectRatio: isHorizontal ? '16/9' : '9/16',
          cursor: isHorizontal ? 'col-resize' : 'row-resize',
        }}
        onMouseMove={handleMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        {/* After Image (Background) */}
        <img
          src={afterImage}
          alt="Dopo"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Before Image (Overlay) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            width: isHorizontal ? `${sliderPos}%` : '100%',
            height: isHorizontal ? '100%' : `${sliderPos}%`,
          }}
        >
          <img
            src={beforeImage}
            alt="Înainte"
            className="w-full h-full object-contain"
            style={{
              width: isHorizontal ? `${100 / (sliderPos / 100)}%` : '100%',
              height: isHorizontal ? '100%' : `${100 / (sliderPos / 100)}%`,
              maxWidth: 'none',
            }}
          />
        </div>

        {/* Slider Handle */}
        {isHorizontal ? (
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xl">
              <div className="flex gap-0.5">
                <ChevronLeft size={12} className="text-gray-800" />
                <ChevronRight size={12} className="text-gray-800" />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="absolute left-0 right-0 h-1 bg-white shadow-lg cursor-row-resize"
            style={{ top: `${sliderPos}%` }}
          >
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xl">
              <div className="flex flex-col gap-0.5">
                <ChevronLeft size={12} className="text-gray-800 rotate-90" />
                <ChevronRight size={12} className="text-gray-800 rotate-90" />
              </div>
            </div>
          </div>
        )}

        {/* Labels */}
        <div className="absolute top-3 left-3 text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
          Înainte
        </div>
        <div className="absolute bottom-3 right-3 text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
          Dopo
        </div>
      </div>
    </div>
  );
};
