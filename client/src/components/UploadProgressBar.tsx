import { useEffect, useState } from "react";

interface UploadProgressBarProps {
  progress: number; // 0-100
  isVisible: boolean;
  fileName?: string;
  status?: "uploading" | "compressing" | "optimizing" | "complete" | "error";
}

export function UploadProgressBar({
  progress,
  isVisible,
  fileName,
  status = "uploading",
}: UploadProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const diff = progress - prev;
        if (diff > 0) {
          return Math.min(prev + Math.ceil(diff / 5), progress);
        }
        return progress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [progress]);

  if (!isVisible) return null;

  const statusMessages = {
    uploading: "Se încarcă...",
    compressing: "Si sta comprimendo...",
    optimizing: "Se optimizează...",
    complete: "Finalizat!",
    error: "Errore la încărcare",
  };

  const statusColors = {
    uploading: "bg-blue-500",
    compressing: "bg-yellow-500",
    optimizing: "bg-purple-500",
    complete: "bg-green-500",
    error: "bg-red-500",
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">
            {statusMessages[status]}
          </p>
          {fileName && (
            <p className="text-xs text-gray-600 truncate mt-1">{fileName}</p>
          )}
        </div>
        <span className="text-sm font-bold text-gray-700 ml-2">
          {displayProgress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${statusColors[status]} transition-all duration-300 ease-out`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      {/* Stato indicator */}
      <div className="flex items-center gap-2 mt-2">
        {status === "uploading" || status === "compressing" || status === "optimizing" ? (
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
          </div>
        ) : status === "complete" ? (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : status === "error" ? (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        ) : null}
        <span className="text-xs text-gray-600">
          {status === "complete" && "Caricamento completo"}
          {status === "error" && "Riprova"}
        </span>
      </div>
    </div>
  );
}
