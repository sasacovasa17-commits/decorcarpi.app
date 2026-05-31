import { RotateCcw } from "lucide-react";
import { useImageFilters, DEFAULT_FILTERS } from "@/hooks/useImageFilters";

interface ImageFilterPreviewProps {
  imageUrl: string;
  onFiltersChange?: (filters: ReturnType<typeof useImageFilters>["filters"]) => void;
  isDark?: boolean;
}

export function ImageFilterPreview({ imageUrl, onFiltersChange, isDark = true }: ImageFilterPreviewProps) {
  const { filters, updateFilter, resetFilters, getFilterCSS, getOpacityCSS } = useImageFilters();

  const handleFilterChange = (key: keyof typeof filters, value: number) => {
    updateFilter(key, value);
    onFiltersChange?.(filters);
  };

  const handleReset = () => {
    resetFilters();
    onFiltersChange?.(DEFAULT_FILTERS);
  };

  const filterSliders = [
    { key: "brightness" as const, label: "Brightness", min: 0, max: 200, step: 5 },
    { key: "contrast" as const, label: "Contrast", min: 0, max: 200, step: 5 },
    { key: "saturation" as const, label: "Saturation", min: 0, max: 200, step: 5 },
    { key: "hue" as const, label: "Hue", min: 0, max: 360, step: 5 },
    { key: "blur" as const, label: "Blur", min: 0, max: 20, step: 1 },
    { key: "opacity" as const, label: "Opacity", min: 0, max: 100, step: 5 },
  ];

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div
        className="w-full rounded-lg overflow-hidden border"
        style={{
          borderColor: "rgba(201,162,39,0.2)",
          background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)",
        }}
      >
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-64 object-cover"
          style={{
            filter: getFilterCSS(),
            opacity: getOpacityCSS(),
          }}
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {filterSliders.map(({ key, label, min, max, step }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: isDark ? "#e8e8e8" : "#333" }}>
                {label}
              </label>
              <span className="text-xs font-mono" style={{ color: isDark ? "#888" : "#666" }}>
                {filters[key]}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={filters[key]}
              onChange={(e) => handleFilterChange(key, parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgba(201,162,39,0.2), rgba(201,162,39,0.5))`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-80"
        style={{
          background: "rgba(201,162,39,0.1)",
          border: "1px solid rgba(201,162,39,0.2)",
          color: "#c9a227",
        }}
      >
        <RotateCcw size={16} />
        <span className="text-sm font-medium">Reset Filters</span>
      </button>
    </div>
  );
}
