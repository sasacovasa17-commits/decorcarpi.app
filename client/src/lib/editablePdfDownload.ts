/**
 * editablePdfDownload.ts
 * Helper pentru descărcare PDF editabil via tRPC fetch
 */

import { Preventivi } from './preventiveStorage';

export async function downloadEditablePDF(Preventivi: Preventivi): Promise<void> {
  try {
    // Apel fetch direct la tRPC endpoint
    const response = await fetch('/api/trpc/Preventivi.generateEditablePDF', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preventiveNumber: Preventivi.preventiveNumber,
        clientName: Preventivi.clientData.nome,
        clientEmail: Preventivi.clientData.email || '',
        clientPhone: Preventivi.clientData.telefono || '',
        clientAddress: Preventivi.clientData.indirizzo || '',
        clientCodiceFiscale: Preventivi.clientData.codiceFiscale || '',
        workType: Preventivi.calculator,
        description: Preventivi.description,
        subtotal: Preventivi.subtotal,
        iva: Preventivi.subtotal * 0.22, // IVA 22%
        altri: Preventivi.others,
        Totale: Preventivi.Totale,
        createdAt: new Date(Preventivi.createdAt).toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parsează response JSON
    const data = await response.json();

    if (!data.result?.data?.pdf) {
      throw new Error('PDF non disponibile nella risposta');
    }

    // Converti base64 la blob
    const binaryString = atob(data.result.data.pdf);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });

    // Descarcă PDF
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = data.result.data.filename || `Preventivo_${Preventivi.preventiveNumber}_Editabile.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Errore la descărcarea PDF editabil:', error);
    throw error;
  }
}
