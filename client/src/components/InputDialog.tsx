import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface InputDialogProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  defaultValue?: string;
  type?: 'text' | 'password' | 'email' | 'tel';
}

export const InputDialog: React.FC<InputDialogProps> = ({
  isOpen,
  title,
  placeholder,
  onConfirm,
  onCancel,
  defaultValue = '',
  type = 'text',
}) => {
  const [value, setValue] = useState(defaultValue);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      setValue('');
    }
  };

  const handleCancel = () => {
    setValue('');
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              ref={inputRef}
              type={type === 'password' && !showPassword ? 'password' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {type === 'password' && (
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
              >
                {showPassword ? 'Nascondi' : 'Mostra'}
              </button>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            disabled={!value.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
