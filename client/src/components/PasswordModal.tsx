import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title?: string;
  message?: string;
}

export function PasswordModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Protetto da Parolà",
  message = "Inserisci la parolà per modificare",
}: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    setError("");
    setIsLoading(true);

    // Emulate validation delay
    setTimeout(() => {
      if (password === "Alexandru.07") {
        onConfirm(password);
        setPassword("");
        setShowPassword(false);
        setIsLoading(false);
      } else {
        setError("Parolà non corretta");
        setPassword("");
        setIsLoading(false);
      }
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-sm p-6 w-full max-w-sm"
        style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(201,162,39,0.3)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: "#c9a227" }}>
            🔒 {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <X size={18} style={{ color: "#c9a227" }} />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs mb-4" style={{ color: "#aaa" }}>
          {message}
        </p>

        {/* Password Input with Toggle */}
        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Inserisci parolà"
            className="w-full px-3 py-2 pr-10 rounded-sm text-xs"
            style={{
              background: "rgba(10,10,10,0.8)",
              color: "#c9a227",
              border: "1px solid rgba(201,162,39,0.3)",
            }}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-800 rounded"
            style={{ color: "#c9a227" }}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs mb-3 px-2 py-1 rounded" style={{ background: "rgba(255,107,107,0.15)", color: "#ff6b6b" }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-sm text-xs font-bold"
            style={{ background: "rgba(201,162,39,0.2)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)" }}
            disabled={isLoading}
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-sm text-xs font-bold"
            style={{ background: "rgba(76,175,80,0.2)", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" }}
            disabled={isLoading || !password}
          >
            {isLoading ? "..." : "Conferma"}
          </button>
        </div>
      </div>
    </div>
  );
}
