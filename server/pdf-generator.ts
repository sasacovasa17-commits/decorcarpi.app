/**
 * pdf-generator.ts
 * Generare PDF editabil cu câmpuri de text folosind pdf-lib
 */

import { PDFDocument, rgb } from 'pdf-lib';

export interface PreventiveData {
  id: string;
  preventiveNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientCodiceFiscale?: string;
  workType: string;
  description: string;
  subtotal: number;
  iva: number;
  altri: number;
  total: number;
  createdAt: Date;
}

/**
 * Generează PDF editabil cu câmpuri de text
 */
export async function generateEditablePDFWithFields(preventive: PreventiveData): Promise<Buffer> {
  try {
    // Creează un document PDF nou
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size in points
    
    const { width, height } = page.getSize();
    const margin = 40;
    const contentWidth = width - 2 * margin;
    
    // Creează formular
    const form = pdfDoc.getForm();
    
    // ─── HEADER ───
    page.drawText(`PREVENTIVO ${preventive.preventiveNumber}`, {
      x: margin,
      y: height - margin - 30,
      size: 24,
      color: rgb(0.82, 0.68, 0.22),
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    
    page.drawText(`Data: ${new Date(preventive.createdAt).toLocaleDateString('it-IT')}`, {
      x: margin,
      y: height - margin - 60,
      size: 11,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    // Linie orizontală
    page.drawLine({
      start: { x: margin, y: height - margin - 75 },
      end: { x: width - margin, y: height - margin - 75 },
      thickness: 2,
      color: rgb(0.82, 0.68, 0.22),
    });
    
    // ─── SECȚIUNE CLIENTE ───
    let yPosition = height - margin - 100;
    
    page.drawText('CLIENTE', {
      x: margin,
      y: yPosition,
      size: 12,
      color: rgb(0.82, 0.68, 0.22),
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    
    yPosition -= 25;
    page.drawText('Nome:', {
      x: margin,
      y: yPosition,
      size: 11,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    
    // Câmp editabil pentru nume
    const nameField = form.createTextField('clientName');
    nameField.setText(preventive.clientName);
    nameField.addToPage(page, { x: margin + 150, y: yPosition - 15, width: 200, height: 20 });
    
    yPosition -= 35;
    page.drawText('Email:', {
      x: margin,
      y: yPosition,
      size: 11,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    
    const emailField = form.createTextField('clientEmail');
    emailField.setText(preventive.clientEmail || '');
    emailField.addToPage(page, { x: margin + 150, y: yPosition - 15, width: 200, height: 20 });
    
    yPosition -= 35;
    page.drawText('Telefono:', {
      x: margin,
      y: yPosition,
      size: 11,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    
    const phoneField = form.createTextField('clientPhone');
    phoneField.setText(preventive.clientPhone || '');
    phoneField.addToPage(page, { x: margin + 150, y: yPosition - 15, width: 200, height: 20 });
    
    // ─── SECȚIUNE PREVENTIVO ───
    yPosition -= 50;
    page.drawText('PREVENTIVO', {
      x: margin,
      y: yPosition,
      size: 12,
      color: rgb(0.82, 0.68, 0.22),
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    
    yPosition -= 25;
    page.drawText('Tipo:', {
      x: margin,
      y: yPosition,
      size: 11,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    page.drawText(preventive.workType, {
      x: margin + 150,
      y: yPosition,
      size: 11,
    });
    
    yPosition -= 25;
    page.drawText('Descrizione:', {
      x: margin,
      y: yPosition,
      size: 11,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    
    const descField = form.createTextField('description');
    descField.setText(preventive.description);
    descField.addToPage(page, { x: margin + 150, y: yPosition - 35, width: 250, height: 50 });
    
    // ─── SECȚIUNE PREȚURI ───
    yPosition -= 80;
    page.drawText('IMPORTI', {
      x: margin,
      y: yPosition,
      size: 12,
      color: rgb(0.82, 0.68, 0.22),
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    
    yPosition -= 25;
    page.drawText('Subtotale:', {
      x: margin,
      y: yPosition,
      size: 11,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    page.drawText(`€ ${preventive.subtotal.toFixed(2)}`, {
      x: width - margin - 100,
      y: yPosition,
      size: 11,
    });
    
    yPosition -= 25;
    page.drawText('IVA:', {
      x: margin,
      y: yPosition,
      size: 11,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    page.drawText(`€ ${preventive.iva.toFixed(2)}`, {
      x: width - margin - 100,
      y: yPosition,
      size: 11,
    });
    
    yPosition -= 25;
    page.drawText('Altri Costi:', {
      x: margin,
      y: yPosition,
      size: 11,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    page.drawText(`€ ${preventive.altri.toFixed(2)}`, {
      x: width - margin - 100,
      y: yPosition,
      size: 11,
    });
    
    yPosition -= 30;
    page.drawText('TOTALE:', {
      x: margin,
      y: yPosition,
      size: 13,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    page.drawText(`€ ${preventive.total.toFixed(2)}`, {
      x: width - margin - 100,
      y: yPosition,
      size: 13,
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    
    // Converteste PDF la buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Eroare la generarea PDF editabil:', error);
    throw error;
  }
}
