import { useState, useCallback } from "react";

export interface DragDropOptions {
  onFilesSelected: (files: File[]) => void;
  acceptedFormats?: string[];
  maxFiles?: number;
}

export const useDragDrop = (options: DragDropOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState("");

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragError("");
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; error: string } => {
      const { acceptedFormats = ["image/jpeg", "image/png", "image/webp"], maxFiles = 10 } = options;

      if (files.length > maxFiles) {
        return {
          valid: [],
          error: `Maximum ${maxFiles} files allowed`,
        };
      }

      const validFiles = files.filter((file) => {
        const isValidFormat = acceptedFormats.some((format) => file.type.includes(format));
        return isValidFormat;
      });

      if (validFiles.length === 0) {
        return {
          valid: [],
          error: "Only image files (JPEG, PNG, WebP) are allowed",
        };
      }

      if (validFiles.length < files.length) {
        return {
          valid: validFiles,
          error: `${files.length - validFiles.length} file(s) were skipped (invalid format)`,
        };
      }

      return { valid: validFiles, error: "" };
    },
    [options]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const { valid, error } = validateFiles(droppedFiles);

      if (error) {
        setDragError(error);
      }

      if (valid.length > 0) {
        options.onFilesSelected(valid);
      }
    },
    [options, validateFiles]
  );

  return {
    isDragging,
    dragError,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    setDragError,
  };
};
