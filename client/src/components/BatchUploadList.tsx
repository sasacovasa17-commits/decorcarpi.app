import { Check, X, Loader2, AlertCircle } from "lucide-react";
import type { UploadItem } from "@/hooks/useBatchUpload";

interface BatchUploadListProps {
  items: UploadItem[];
  onRemove?: (itemId: string) => void;
  isDark?: boolean;
}

export function BatchUploadList({ items, onRemove, isDark = true }: BatchUploadListProps) {
  if (items.length === 0) {
    return null;
  }

  const getStatusIcon = (item: UploadItem) => {
    switch (item.status) {
      case "complete":
        return <Check size={18} style={{ color: "#27ae60" }} />;
      case "error":
        return <X size={18} style={{ color: "#e74c3c" }} />;
      case "uploading":
      case "compressing":
      case "optimizing":
        return <Loader2 size={18} style={{ color: "#c9a227" }} className="animate-spin" />;
      default:
        return <AlertCircle size={18} style={{ color: "#888" }} />;
    }
  };

  const getStatusText = (item: UploadItem) => {
    switch (item.status) {
      case "complete":
        return "Uploaded";
      case "error":
        return item.error || "Failed";
      case "uploading":
        return `Uploading ${item.progress}%`;
      case "compressing":
        return "Compressing...";
      case "optimizing":
        return "Optimizing...";
      default:
        return "Pending";
    }
  };

  return (
    <div className="space-y-2 mt-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-3 rounded-lg border"
          style={{
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            borderColor: item.status === "error" ? "rgba(231,76,60,0.3)" : "rgba(201,162,39,0.2)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: isDark ? "#e8e8e8" : "#333" }}>
                {item.file.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(item)}
                <span className="text-xs" style={{ color: isDark ? "#888" : "#666" }}>
                  {getStatusText(item)}
                </span>
              </div>
            </div>

            {item.progress > 0 && item.status !== "complete" && item.status !== "error" && (
              <div className="w-24 h-1 rounded-full" style={{ background: "rgba(201,162,39,0.2)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.progress}%`,
                    background: "#c9a227",
                  }}
                />
              </div>
            )}

            {onRemove && item.status === "complete" && (
              <button
                onClick={() => onRemove(item.id)}
                className="p-1 hover:opacity-70 transition-opacity"
              >
                <X size={16} style={{ color: "#888" }} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
