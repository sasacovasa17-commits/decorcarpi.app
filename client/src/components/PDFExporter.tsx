import { useRef } from 'react';
import { Download } from 'lucide-react';
import { Language, translations } from '@/lib/i18n-extended';

interface PDFExporterProps {
  imageUrl: string;
  projectName: string;
  language: Language;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onError?: (error: string) => void;
}

export function PDFExporter({
  imageUrl,
  projectName,
  language,
  onExportStart,
  onExportComplete,
  onError,
}: PDFExporterProps) {
  const t = translations[language];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generatePDF = async () => {
    try {
      onExportStart?.();

      // Dynamic import pentru pdfkit (lightweight alternative)
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Fetch image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = (e) => {
        const imgData = e.target?.result as string;

        // Add title
        doc.setFontSize(20);
        doc.setTextColor(201, 162, 39); // Gold color
        doc.text('DECOR CARPI', 105, 20, { align: 'center' });

        // Add project name
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text(projectName, 105, 35, { align: 'center' });

        // Add language info
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const langLabel = language === 'it' ? 'Italiano' : language === 'ro' ? 'Rumeno' : 'English';
        doc.text(`Lingua: ${langLabel}`, 105, 45, { align: 'center' });

        // Add image
        doc.addImage(imgData, 'JPEG', 10, 55, 190, 150);

        // Add footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const date = new Date().toLocaleDateString(language === 'it' ? 'it-IT' : language === 'ro' ? 'ro-RO' : 'en-US');
        doc.text(`Data: ${date}`, 105, 280, { align: 'center' });

        // Save PDF
        doc.save(`${projectName}-DecorCarpi.pdf`);
        onExportComplete?.();
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMsg);
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
      style={{
        background: '#c9a227',
        color: '#0a0a0a',
        fontFamily: "'Raleway', sans-serif",
      }}
      title={t.esportaPDF}
    >
      <Download size={18} />
      <span className="text-sm font-semibold">{t.esportaPDF}</span>
    </button>
  );
}
