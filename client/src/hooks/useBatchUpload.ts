import { useState, useCallback } from "react";

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "compressing" | "optimizing" | "complete" | "error";
  error?: string;
  url?: string;
  preview?: string;
}

export interface BatchUploadOptions {
  onUploadComplete?: (items: UploadItem[]) => void;
  onProgressUpdate?: (items: UploadItem[]) => void;
  maxConcurrent?: number;
}

export const useBatchUpload = (options: BatchUploadOptions = {}) => {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback((files: File[]) => {
    const newItems: UploadItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: "pending" as const,
    }));

    setUploadItems((prev) => [...prev, ...newItems]);
    return newItems;
  }, []);

  const updateItemProgress = useCallback((itemId: string, progress: number, status?: UploadItem["status"]) => {
    setUploadItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, progress: Math.min(100, progress), status: status || item.status }
          : item
      )
    );
  }, []);

  const completeItem = useCallback(
    (itemId: string, url: string, preview: string) => {
      setUploadItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, progress: 100, status: "complete", url, preview }
            : item
        )
      );
    },
    []
  );

  const failItem = useCallback((itemId: string, error: string) => {
    setUploadItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, progress: 0, status: "error", error }
          : item
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setUploadItems((prev) => prev.filter((item) => item.status !== "complete"));
  }, []);

  const clearAll = useCallback(() => {
    setUploadItems([]);
  }, []);

  const getTotaleProgress = useCallback(() => {
    if (uploadItems.length === 0) return 0;
    const totalProgress = uploadItems.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(totalProgress / uploadItems.length);
  }, [uploadItems]);

  const getStats = useCallback(() => {
    return {
      Totale: uploadItems.length,
      pending: uploadItems.filter((i) => i.status === "pending").length,
      uploading: uploadItems.filter((i) => i.status === "uploading").length,
      complete: uploadItems.filter((i) => i.status === "complete").length,
      error: uploadItems.filter((i) => i.status === "error").length,
    };
  }, [uploadItems]);

  return {
    uploadItems,
    isUploading,
    setIsUploading,
    addFiles,
    updateItemProgress,
    completeItem,
    failItem,
    clearCompleted,
    clearAll,
    getTotaleProgress,
    getStats,
  };
};
