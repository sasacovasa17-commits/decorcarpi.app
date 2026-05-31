import { useState } from 'react';
import { Preventivi } from '@/lib/preventiveStorage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Download } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface PDFViewerProps {
  Preventivi: Preventivi;
  onClose: () => void;
}

export default function PDFViewer({ Preventivi, onClose }: PDFViewerProps) {
  const [editedData, setEditedData] = useState({
    nome: Preventivi.clientData.nome,
    email: Preventivi.clientData.email || '',
    telefono: Preventivi.clientData.telefono || '',
    indirizzo: Preventivi.clientData.indirizzo || '',
    codiceFiscale: Preventivi.clientData.codiceFiscale || '',
  });

  const handleFieldChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const generatePDF = async () => {
    try {
      toast.loading('Generazione PDF in corso...');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(201, 162, 39); // Gold color
      doc.text(`PREVENTIVO ${Preventivi.preventiveNumber}`, pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 15;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      // Client Data
      doc.text('DATI CLIENTE:', 20, yPosition);
      yPosition += 7;

      const clientFields = [
        { label: 'Nome:', value: editedData.nome },
        { label: 'Email:', value: editedData.email },
        { label: 'Telefono:', value: editedData.telefono },
        { label: 'Indirizzo:', value: editedData.indirizzo },
        { label: 'Codice Fiscale:', value: editedData.codiceFiscale },
      ];

      clientFields.forEach(field => {
        if (field.value) {
          doc.text(`${field.label} ${field.value}`, 25, yPosition);
          yPosition += 6;
        }
      });

      yPosition += 5;

      // Service Details
      doc.text('DETTAGLI SERVIZIO:', 20, yPosition);
      yPosition += 7;
      doc.text(`Tipo: ${Preventivi.calculator}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Descrizione: ${Preventivi.description}`, 25, yPosition);
      yPosition += 10;

      // Pricing
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PREVENTIVO:', 20, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Subtotale: €${Preventivi.subtotal.toFixed(2)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Altro: €${Preventivi.others.toFixed(2)}`, 25, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(201, 162, 39);
      doc.text(`TOTALE: €${Preventivi.Totale.toFixed(2)}`, 25, yPosition);

      // Footer
      yPosition = pageHeight - 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 20, yPosition);

      // Save PDF
      doc.save(`Preventivo_${Preventivi.preventiveNumber}.pdf`);
      toast.success('PDF generato con successo!');
    } catch (error) {
      console.error('Errore durante la generazione del PDF:', error);
      toast.error('Errore durante la generazione del PDF');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>PREVENTIVO {Preventivi.preventiveNumber}</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Data Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dati Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={editedData.nome}
                  onChange={(e) => handleFieldChange('nome', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  value={editedData.telefono || ''}
                  onChange={(e) => handleFieldChange('telefono', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="indirizzo">Indirizzo</Label>
                <Input
                  id="indirizzo"
                  value={editedData.indirizzo || ''}
                  onChange={(e) => handleFieldChange('indirizzo', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="codiceFiscale">Codice Fiscale</Label>
                <Input
                  id="codiceFiscale"
                  value={editedData.codiceFiscale || ''}
                  onChange={(e) => handleFieldChange('codiceFiscale', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Service Details Section */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-lg">Dettagli Servizio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <p className="text-sm text-muted-foreground mt-1">{Preventivi.calculator}</p>
              </div>
              <div>
                <Label>Descrizione</Label>
                <p className="text-sm text-muted-foreground mt-1">{Preventivi.description}</p>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-3 border-t pt-4 bg-muted/50 p-4 rounded">
            <h3 className="font-semibold text-lg">Preventivo</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotale:</span>
                <span>€{Preventivi.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Altro:</span>
                <span>€{Preventivi.others.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 text-amber-600">
                <span>TOTALE:</span>
                <span>€{Preventivi.Totale.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              Chiudi
            </Button>
            <Button onClick={generatePDF} className="bg-amber-600 hover:bg-amber-700">
              <Download className="w-4 h-4 mr-2" />
              Scarica PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
