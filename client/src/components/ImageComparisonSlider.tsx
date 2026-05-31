import { useState, useRef, useEffect } from "react";

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  isDark?: boolean;
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Original",
  afterLabel = "Filtered",
  isDark = true,
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    setSliderPosition(percentage);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

      setSliderPosition(percentage);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    setSliderPosition(percentage);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 rounded-lg overflow-hidden cursor-col-resize select-none border"
      style={{
        borderColor: "rgba(201,162,39,0.2)",
        background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)",
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {/* Before Image */}
      <div className="absolute inset-0 w-full h-full">
        <img src={beforeImage} alt={beforeLabel} className="w-full h-full object-cover" />
      </div>

      {/* After Image (Clipped) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          width: `${sliderPosition}%`,
        }}
      >
        <img src={afterImage} alt={afterLabel} className="w-full h-full object-cover" />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-[#c9a227] cursor-col-resize transition-shadow hover:shadow-lg"
        style={{
          left: `${sliderPosition}%`,
          transform: "translateX(-50%)",
          boxShadow: isDragging ? "0 0 20px rgba(201,162,39,0.6)" : "none",
        }}
      >
        {/* Handle Icon */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#c9a227] rounded-full p-2"
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left Arrow */}
            <path d="M8 4L4 10L8 16" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Right Arrow */}
            <path d="M12 4L16 10L12 16" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-10">
        <span
          className="text-xs font-semibold px-2 py-1 rounded"
          style={{
            background: "rgba(0,0,0,0.5)",
            color: "#c9a227",
          }}
        >
          {beforeLabel}
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <span
          className="text-xs font-semibold px-2 py-1 rounded"
          style={{
            background: "rgba(0,0,0,0.5)",
            color: "#c9a227",
          }}
        >
          {afterLabel}
        </span>
      </div>
    </div>
  );
}
