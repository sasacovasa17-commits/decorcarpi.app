import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  pdfUrl: string;
  fileName: string;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  onDownload,
  pdfUrl,
  fileName,
}: PDFPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, pdfUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-black">{fileName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* PDF Preview */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
          {isLoading && (
            <div className="text-gray-500 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Caricamento PDF...
            </div>
          )}
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            onLoad={() => setIsLoading(false)}
            title="PDF Preview"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Chiudi
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: '#c9a227',
              color: '#0a0a0a',
            }}
          >
            <Download size={18} />
            Scarica PDF
          </button>
        </div>
      </div>
    </div>
  );
}
