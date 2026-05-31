import { describe, it, expect } from 'vitest';
import { generatePDFHTML, PDFEditableData } from './pdfGenerator';
import { Preventivi } from './preventiveStorage';

const mockPreventive: Preventivi = {
  id: 'test-1',
  preventiveNumber: 'PREV-TEST-001',
  createdAt: '2026-05-09T00:00:00Z',
  clientData: {
    nome: 'Mario Rossi',
    email: 'mario@example.com',
    telefono: '+39 333 123 4567',
    indirizzo: 'Via Test 123',
    codiceFiscale: 'RSSMRA85A01H501Z',
  },
  calculator: 'Vernice',
  description: '15 m² - €120-€150/m²',
  subtotal: 150,
  others: 20,
  Totale: 170,
};

describe('pdfGenerator', () => {
  it('should generate PDF HTML with Preventivi data', () => {
    const html = generatePDFHTML(mockPreventive);

    expect(html).toContain('decor carpi');
    expect(html).toContain('PREVENTIVO');
    expect(html).toContain(mockPreventive.preventiveNumber);
    expect(html).toContain(mockPreventive.clientData.nome);
  });

  it('should include golden cursive logo styling', () => {
    const html = generatePDFHTML(mockPreventive);

    expect(html).toContain('decor carpi');
    expect(html).toContain('italic');
    expect(html).toContain('#c9a227'); // Golden color
  });

  it('should show IVA as 0%', () => {
    const html = generatePDFHTML(mockPreventive);

    expect(html).toContain('IVA (0%)');
    expect(html).toContain('€ 0.00');
  });

  it('should include fixed 2€ altri costi', () => {
    const html = generatePDFHTML(mockPreventive);

    expect(html).toContain('Altri Costi');
    expect(html).toContain('€ 2.00');
  });

  it('should calculate correct totale', () => {
    const html = generatePDFHTML(mockPreventive);

    // Subtotal (150) + IVA (0) + Altri (2) = 152
    const expected = (150 + 0 + 2).toFixed(2);
    expect(html).toContain(`€ ${expected}`);
  });

  it('should include 30 giorni validity', () => {
    const html = generatePDFHTML(mockPreventive);

    expect(html).toContain('30 giorni');
  });

  it('should use editable data when provided', () => {
    const editableData: PDFEditableData = {
      nome: 'Giovanni Bianchi',
      email: 'giovanni@example.com',
      indirizzo: 'Via Roma 456',
      tipo: 'Stucchi Decorativi',
      descrizione: 'Lavoro speciale',
      signature: '',
    };

    const html = generatePDFHTML(mockPreventive, editableData);

    expect(html).toContain(editableData.nome);
    expect(html).toContain(editableData.email);
    expect(html).toContain(editableData.indirizzo);
    expect(html).toContain(editableData.tipo);
    expect(html).toContain(editableData.descrizione);
  });

  it('should include company info in header', () => {
    const html = generatePDFHTML(mockPreventive);

    expect(html).toContain('Stucchi Decorativi');
    expect(html).toContain('Vernici Specializzate');
    expect(html).toContain('Tel: +39 334 360 0932');
    expect(html).toContain('Email: info@decorcarpi.it');
  });

  it('should include signature boxes', () => {
    const html = generatePDFHTML(mockPreventive);

    expect(html).toContain('Firma Cliente');
    expect(html).toContain('Firma Decor Carpi');
  });

  it('should include footer with generation date', () => {
    const html = generatePDFHTML(mockPreventive);

    expect(html).toContain('Generato il');
    expect(html).toContain('Decor Carpi');
    expect(html).toContain('valido per 30 giorni');
  });

  it('should handle missing editable data gracefully', () => {
    const html = generatePDFHTML(mockPreventive, undefined);

    expect(html).toContain(mockPreventive.clientData.nome);
    expect(html).toContain(mockPreventive.calculator);
    expect(html).toContain(mockPreventive.description);
  });
});
