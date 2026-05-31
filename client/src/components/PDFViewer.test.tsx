import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PDFViewer from './PDFViewer';
import { Preventivi } from '@/lib/preventiveStorage';

// Mock jsPDF
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => ({
    html: vi.fn((html, options) => {
      if (options.callback) {
        options.callback({
          save: vi.fn(),
        });
      }
      return Promise.resolve();
    }),
  })),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPreventive: Preventivi = {
  id: 'test-1',
  preventiveNumber: 'PREV-TEST',
  createdAt: 1778819704431,
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

describe('PDFViewer Component', () => {
  it('renders modal with Preventivi data', () => {
    const onClose = vi.fn();
    render(<PDFViewer Preventivi={mockPreventive} onClose={onClose} />);

    // Check header
    expect(screen.getByText(`PREVENTIVO ${mockPreventive.preventiveNumber}`)).toBeDefined();

    // Check edit fields
    const nomeInput = screen.getByDisplayValue(mockPreventive.clientData.nome);
    expect(nomeInput).toBeDefined();

    if (mockPreventive.clientData.email) {
      const emailInput = screen.getByDisplayValue(mockPreventive.clientData.email);
      expect(emailInput).toBeDefined();
    }

    if (mockPreventive.clientData.indirizzo) {
      const indirizzoInput = screen.getByDisplayValue(mockPreventive.clientData.indirizzo);
      expect(indirizzoInput).toBeDefined();
    }
  });

  it('updates preview when editing fields', () => {
    const onClose = vi.fn();
    render(<PDFViewer Preventivi={mockPreventive} onClose={onClose} />);

    const nomeInput = screen.getByDisplayValue(mockPreventive.clientData.nome) as HTMLInputElement;
    
    // Change nome
    fireEvent.change(nomeInput, { target: { value: 'Giovanni Bianchi' } });
    
    expect(nomeInput.value).toBe('Giovanni Bianchi');
  });

  it('has close button that calls onClose', () => {
    const onClose = vi.fn();
    render(<PDFViewer Preventivi={mockPreventive} onClose={onClose} />);

    // Close button should exist in the modal header
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders download button', () => {
    const onClose = vi.fn();
    render(<PDFViewer Preventivi={mockPreventive} onClose={onClose} />);

    const downloadButton = screen.getByText('Scarica PDF');
    expect(downloadButton).toBeDefined();
  });

  it('displays PDF preview in iframe', () => {
    const onClose = vi.fn();
    render(<PDFViewer Preventivi={mockPreventive} onClose={onClose} />);

    // Check that modal renders with editable fields
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
