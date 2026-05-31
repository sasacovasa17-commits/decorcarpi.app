import jsPDF from 'jspdf';

export interface ReportData {
  texture: string;
  dimensions?: {
    length: number;
    height: number;
    windows: number;
    doors: number;
  };
  sqm: number;
  pricePerSqm: number;
  baseMin: number;
  baseMax: number;
  discount: number;
  extraWork: number;
  totalMin: number;
  totalMax: number;
  isMobile: boolean;
}

export function generateDetailedReport(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Background: default white (no need to set)
  
  // Header cu logo text - SOLO DECOR CARPI IN GOLD
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(201, 162, 39);
  doc.text('DECOR CARPI', margin, yPosition);
  yPosition += 12;

  // Titlu raport - text negru
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('RAPPORTO CALCOLO PREVENTIVO', margin, yPosition);
  yPosition += 7;

  // Data - text negru
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, margin, yPosition);
  yPosition += 7;

  // Divider - linie gri deschis (fara negru)
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 6;

  // Sezione 1: Dettagli Texture - titlu negru (fara aur)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('TEXTURE SELEZIONATA', margin, yPosition);
  yPosition += 5;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Modello: ${data.texture}`, margin + 2, yPosition);
  yPosition += 5;

  // Sezione 2: Dimensioni e Superficie - titlu negru (fara aur)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('DIMENSIONI E SUPERFICIE', margin, yPosition);
  yPosition += 5;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  if (data.dimensions) {
    doc.text(`Lunghezza: ${data.dimensions.length} m`, margin + 2, yPosition);
    yPosition += 4;
    doc.text(`Altezza: ${data.dimensions.height} m`, margin + 2, yPosition);
    yPosition += 4;
    doc.text(`Finestre: ${data.dimensions.windows}`, margin + 2, yPosition);
    yPosition += 4;
    doc.text(`Porte: ${data.dimensions.doors}`, margin + 2, yPosition);
    yPosition += 4;
    doc.text(`Superficie netta: ${data.sqm.toFixed(2)} m²`, margin + 2, yPosition);
  } else {
    doc.text(`Superficie: ${data.sqm.toFixed(2)} m²`, margin + 2, yPosition);
  }
  yPosition += 6;

  // Sezione 3: Calcolo Prezzo - titlu negru (fara aur)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('CALCOLO PREZZO', margin, yPosition);
  yPosition += 5;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  doc.text(`Prezzo per m²: €${data.pricePerSqm.toFixed(2)}`, margin + 2, yPosition);
  yPosition += 4;
  doc.text(`Prezzo base (min): €${data.baseMin.toFixed(2)}`, margin + 2, yPosition);
  yPosition += 4;
  doc.text(`Prezzo base (max): €${data.baseMax.toFixed(2)}`, margin + 2, yPosition);
  yPosition += 4;

  if (data.isMobile) {
    doc.text(`Fattore mobile (+15%): 1.15x`, margin + 2, yPosition);
    yPosition += 4;
  }

  // Sezione 4: Sconti e Adaos - titlu negru (fara aur)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('SCONTI E ADAOS', margin, yPosition);
  yPosition += 5;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  if (data.discount > 0) {
    const discountAmount = data.baseMin * (data.discount / 100);
    doc.text(`Sconto: -${data.discount}% (€${discountAmount.toFixed(2)})`, margin + 2, yPosition);
    yPosition += 4;
  }

  if (data.extraWork > 0) {
    const extraAmount = data.baseMax * (data.extraWork / 100);
    doc.text(`Adaos: +${data.extraWork}% (€${extraAmount.toFixed(2)})`, margin + 2, yPosition);
    yPosition += 4;
  }

  yPosition += 4;

  // Sezione 5: Totale Finale - titlu negru (fara aur)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTALE FINALE', margin, yPosition);
  yPosition += 5;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Preventivo minimo: €${data.totalMin.toFixed(2)}`, margin + 2, yPosition);
  yPosition += 4;
  doc.text(`Preventivo massimo: €${data.totalMax.toFixed(2)}`, margin + 2, yPosition);
  yPosition += 6;

  // Footer - text negru deschis
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('IVA inclusa nel preventivo', margin, pageHeight - 12);
  doc.text('Questo rapporto è una stima indicativa. Il prezzo definitivo dipende da preparazione, zona e complessità.', margin, pageHeight - 8);

  // Salva PDF
  doc.save(`Rapporto_Preventivo_${new Date().toISOString().split('T')[0]}.pdf`);
}
