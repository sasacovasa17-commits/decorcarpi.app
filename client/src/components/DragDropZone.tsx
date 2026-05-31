import { Upload, AlertCircle } from "lucide-react";
import { useDragDrop } from "@/hooks/useDragDrop";

interface DragDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFormats?: string[];
  maxFiles?: number;
  isDark?: boolean;
}

export function DragDropZone({
  onFilesSelected,
  acceptedFormats,
  maxFiles = 10,
  isDark = true,
}: DragDropZoneProps) {
  const { isDragging, dragError, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, setDragError } =
    useDragDrop({
      onFilesSelected,
      acceptedFormats,
      maxFiles,
    });

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative w-full p-8 rounded-lg border-2 border-dashed transition-all ${
        isDragging
          ? isDark
            ? "border-[#c9a227] bg-[rgba(201,162,39,0.1)]"
            : "border-[#c9a227] bg-[rgba(201,162,39,0.05)]"
          : isDark
          ? "border-[rgba(201,162,39,0.3)] bg-[rgba(201,162,39,0.05)]"
          : "border-[rgba(201,162,39,0.2)] bg-[rgba(201,162,39,0.02)]"
      }`}
    >
      <div className="flex flex-col items-center gap-3 py-6">
        <Upload size={40} style={{ color: "#c9a227" }} />
        <div className="text-center">
          <p className="font-semibold text-base" style={{ color: isDark ? "#e8e8e8" : "#333" }}>
            Drag & Drop Your Images Here
          </p>
          <p className="text-sm mt-1" style={{ color: isDark ? "#888" : "#666" }}>
            o clicca per selezionare file (max {maxFiles} files)
          </p>
        </div>
      </div>

      {dragError && (
        <div
          className="mt-4 p-3 rounded flex items-center gap-2"
          style={{
            background: "rgba(231,76,60,0.1)",
            border: "1px solid rgba(231,76,60,0.3)",
          }}
        >
          <AlertCircle size={18} style={{ color: "#e74c3c" }} />
          <p className="text-sm" style={{ color: "#e74c3c" }}>
            {dragError}
          </p>
        </div>
      )}
    </div>
  );
}
