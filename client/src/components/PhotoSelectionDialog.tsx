import React, { useRef } from "react";
import { Camera, Upload, X } from "lucide-react";

interface PhotoSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelected: (file: File) => void;
  isLoading?: boolean;
}

export function PhotoSelectionDialog({
  isOpen,
  onClose,
  onPhotoSelected,
  isLoading = false,
}: PhotoSelectionDialogProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoSelected(file);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end z-50"
      onClick={onClose}
    >
      <div
        className="w-full bg-[#1a1a1a] rounded-t-lg p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-bold"
            style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}
          >
            📸 Fotografa la tua stanza
          </h2>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-[#c9a227] transition"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-[#888]">
          Scatta una Foto della camera che vuoi decorare, oppure carica un'immagine dalla galleria del tuo telefono.
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          {/* Camera Button */}
          <button
            onClick={() => cameraRef.current?.click()}
            disabled={isLoading}
            className="w-full py-4 flex flex-col items-center gap-3 rounded-sm border-2 transition-all active:scale-95 disabled:opacity-50"
            style={{
              borderColor: "#c9a227",
              background: "rgba(201,162,39,0.08)",
            }}
          >
            <Camera size={32} style={{ color: "#c9a227" }} />
            <span
              className="text-sm font-bold tracking-widest uppercase"
              style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}
            >
              Scatta una Foto
            </span>
          </button>

          {/* Gallery Button */}
          <button
            onClick={() => galleryRef.current?.click()}
            disabled={isLoading}
            className="w-full py-4 flex flex-col items-center gap-3 rounded-sm border transition-all active:scale-95 disabled:opacity-50"
            style={{
              borderColor: "rgba(201,162,39,0.3)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <Upload size={32} style={{ color: "#e8e8e8" }} />
            <span
              className="text-sm font-bold tracking-widest uppercase"
              style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
            >
              Carica da galleria
            </span>
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-3 rounded-sm border font-semibold transition-all active:scale-95 disabled:opacity-50"
            style={{
              borderColor: "rgba(201,162,39,0.3)",
              color: "#c9a227",
              background: "rgba(201,162,39,0.08)",
            }}
          >
            Annulla
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}
