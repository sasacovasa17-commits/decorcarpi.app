import { useState, useCallback } from "react";

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: "jpeg" | "webp" | "png";
}

export interface OptimizedImage {
  blob: Blob;
  url: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

export function useImageOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);

  const optimizeImage = useCallback(
    async (
      file: File,
      options: OptimizationOptions = {}
    ): Promise<OptimizedImage> => {
      setIsOptimizing(true);
      setProgress(0);

      try {
        const {
          maxWidth = 1920,
          maxHeight = 1440,
          quality = 0.8,
          format = "webp",
        } = options;

        // Step 1: Read file
        setProgress(10);
        const reader = new FileReader();
        const imageDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Step 2: Create image element
        setProgress(20);
        const img = new Image();
        const imagePromise = new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = imageDataUrl;
        });
        await imagePromise;

        // Step 3: Calculate new dimensions
        setProgress(30);
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > maxWidth || height > maxHeight) {
          if (aspectRatio > maxWidth / maxHeight) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        // Step 4: Create canvas and draw
        setProgress(40);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Cannot get canvas context");

        ctx.drawImage(img, 0, 0, width, height);

        // Step 5: Convert to blob
        setProgress(60);
        const mimeType =
          format === "webp"
            ? "image/webp"
            : format === "jpeg"
              ? "image/jpeg"
              : "image/png";

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Canvas to blob failed"));
            },
            mimeType,
            quality
          );
        });

        setProgress(80);

        // Step 6: Create URL
        const url = URL.createObjectURL(blob);

        setProgress(100);

        const compressionRatio =
          ((file.size - blob.size) / file.size) * 100;

        return {
          blob,
          url,
          originalSize: file.size,
          compressedSize: blob.size,
          compressionRatio,
          width,
          height,
        };
      } finally {
        setIsOptimizing(false);
        setProgress(0);
      }
    },
    []
  );

  const batchOptimize = useCallback(
    async (
      files: File[],
      options?: OptimizationOptions
    ): Promise<OptimizedImage[]> => {
      const results: OptimizedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        setProgress((i / files.length) * 100);
        const optimized = await optimizeImage(files[i], options);
        results.push(optimized);
      }

      setProgress(100);
      return results;
    },
    [optimizeImage]
  );

  return {
    optimizeImage,
    batchOptimize,
    isOptimizing,
    progress,
  };
}
