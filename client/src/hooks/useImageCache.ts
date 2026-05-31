import { useState, useCallback, useEffect } from "react";

const CACHE_PREFIX = "decor_carpi_image_cache_";
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedImage {
  url: string;
  timestamp: number;
  size: number;
}

export function useImageCache() {
  const [cacheSize, setCacheSize] = useState(0);

  // Calculate Totale cache size
  useEffect(() => {
    let Totale = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) Totale += item.length;
      }
    }
    setCacheSize(Totale);
  }, []);

  const getCacheKey = useCallback((fileHash: string) => {
    return `${CACHE_PREFIX}${fileHash}`;
  }, []);

  const cacheImage = useCallback(
    (fileHash: string, imageUrl: string, size: number) => {
      try {
        const cacheKey = getCacheKey(fileHash);
        const cacheData: CachedImage = {
          url: imageUrl,
          timestamp: Date.now(),
          size,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        setCacheSize((prev) => prev + size);
      } catch (error) {
        console.warn("Failed to cache image:", error);
      }
    },
    [getCacheKey]
  );

  const getCachedImage = useCallback(
    (fileHash: string): CachedImage | null => {
      try {
        const cacheKey = getCacheKey(fileHash);
        const cached = localStorage.getItem(cacheKey);

        if (!cached) return null;

        const cacheData: CachedImage = JSON.parse(cached);

        // Check if cache expired
        if (Date.now() - cacheData.timestamp > CACHE_EXPIRY_MS) {
          localStorage.removeItem(cacheKey);
          return null;
        }

        return cacheData;
      } catch (error) {
        console.warn("Failed to retrieve cached image:", error);
        return null;
      }
    },
    [getCacheKey]
  );

  const clearCache = useCallback(() => {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => localStorage.removeItem(key));
    setCacheSize(0);
  }, []);

  const clearExpiredCache = useCallback(() => {
    let deletedSize = 0;
    const keysToDelete: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const cacheData: CachedImage = JSON.parse(item);
            if (Date.now() - cacheData.timestamp > CACHE_EXPIRY_MS) {
              keysToDelete.push(key);
              deletedSize += cacheData.size;
            }
          } catch (error) {
            console.warn("Failed to parse cache item:", error);
          }
        }
      }
    }

    keysToDelete.forEach((key) => localStorage.removeItem(key));
    setCacheSize((prev) => Math.max(0, prev - deletedSize));
  }, []);

  const hashFile = useCallback(async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }, []);

  return {
    cacheImage,
    getCachedImage,
    clearCache,
    clearExpiredCache,
    hashFile,
    cacheSize,
  };
}
