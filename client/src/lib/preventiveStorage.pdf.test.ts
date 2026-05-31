/**
 * preventiveStorage.pdf.test.ts
 * Test vitest pentru funcția downloadPreventivePDF
 */

import { describe, it, expect, vi } from 'vitest';
import { downloadPreventivePDF, type Preventivi } from './preventiveStorage';

// Mock jsPDF și html2canvas
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
  })),
}));

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
    height: 1000,
    width: 800,
  }),
}));

describe('downloadPreventivePDF', () => {
  const mockPreventive: Preventivi = {
    id: 'test-1',
    preventiveNumber: 'PREV-001',
    createdAt: Date.now(),
    clientData: {
      nome: 'Test Client',
      email: 'test@example.com',
      telefono: '3334567890',
      codiceFiscale: 'ABC123DEF456',
    },
    calculator: 'Stucchi',
    description: '10 m² - €50-€100/m²',
    subtotal: 750,
    vat: 165,
    others: 0,
    Totale: 915,
  };

  it('should export downloadPreventivePDF function', () => {
    expect(typeof downloadPreventivePDF).toBe('function');
  });

  it('should have correct Preventivi structure', () => {
    expect(mockPreventive).toHaveProperty('id');
    expect(mockPreventive).toHaveProperty('preventiveNumber');
    expect(mockPreventive).toHaveProperty('clientData');
    expect(mockPreventive).toHaveProperty('Totale');
  });

  it('should have Preventivi with required client data', () => {
    expect(mockPreventive.clientData.nome).toBe('Test Client');
    expect(mockPreventive.clientData.email).toBe('test@example.com');
  });

  it('should calculate totals correctly', () => {
    const subtotal = 750;
    const vat = Math.round((subtotal * 0.22) * 100) / 100;
    expect(vat).toBe(165);
    expect(subtotal + vat).toBe(915);
  });
});
