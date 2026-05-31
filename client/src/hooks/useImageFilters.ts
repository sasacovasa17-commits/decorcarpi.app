import { useState, useCallback } from "react";

export interface ImageFilters {
  brightness: number; // 0-200 (100 = normal)
  contrast: number; // 0-200 (100 = normal)
  saturation: number; // 0-200 (100 = normal)
  hue: number; // 0-360
  blur: number; // 0-20
  opacity: number; // 0-100
}

export const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  opacity: 100,
};

export const useImageFilters = () => {
  const [filters, setFilters] = useState<ImageFilters>(DEFAULT_FILTERS);

  const updateFilter = useCallback((key: keyof ImageFilters, value: number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const getFilterCSS = useCallback((): string => {
    const filterParts: string[] = [];

    if (filters.brightness !== 100) {
      filterParts.push(`brightness(${filters.brightness}%)`);
    }

    if (filters.contrast !== 100) {
      filterParts.push(`contrast(${filters.contrast}%)`);
    }

    if (filters.saturation !== 100) {
      filterParts.push(`saturate(${filters.saturation}%)`);
    }

    if (filters.hue !== 0) {
      filterParts.push(`hue-rotate(${filters.hue}deg)`);
    }

    if (filters.blur > 0) {
      filterParts.push(`blur(${filters.blur}px)`);
    }

    return filterParts.join(" ");
  }, [filters]);

  const getOpacityCSS = useCallback((): number => {
    return filters.opacity / 100;
  }, [filters]);

  const applyFiltersToCanvas = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      ctx.filter = getFilterCSS();
    },
    [getFilterCSS]
  );

  const exportFilteredImage = useCallback(
    async (imageUrl: string, format: "jpeg" | "png" | "webp" = "jpeg"): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          ctx.filter = getFilterCSS();
          ctx.globalAlpha = getOpacityCSS();
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to convert canvas to blob"));
              }
            },
            `image/${format}`,
            0.95
          );
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        img.src = imageUrl;
      });
    },
    [getFilterCSS, getOpacityCSS]
  );

  return {
    filters,
    updateFilter,
    resetFilters,
    getFilterCSS,
    getOpacityCSS,
    applyFiltersToCanvas,
    exportFilteredImage,
  };
};
