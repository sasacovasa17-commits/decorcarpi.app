import * as XLSX from 'xlsx';
import { Preventivi } from './preventiveStorage';

export const exportPreventiveToExcel = (Preventivi: Preventivi) => {
  // Crea un workbook nou
  const workbook = XLSX.utils.book_new();

  // Crea sheet-ul cu date
  const data = [
    ['PREVENTIVO', ''],
    ['', ''],
    ['Numero Preventivo:', Preventivi.id],
    ['Data:', new Date(Preventivi.createdAt).toLocaleDateString('it-IT')],
    ['', ''],
    ['DATI CLIENTE', ''],
    ['Nome:', Preventivi.clientData.nome],
    ['Email:', Preventivi.clientData.email || ''],
    ['Telefono:', Preventivi.clientData.telefono || ''],
    ['Indirizzo:', Preventivi.clientData.indirizzo || ''],
    ['Codice Fiscale:', Preventivi.clientData.codiceFiscale || ''],
    ['', ''],
    ['DETTAGLI LUCRARE', ''],
    ['Tipo Lucrare:', Preventivi.calculator],
    ['Descrizione:', Preventivi.description],
    ['', ''],
    ['PREZZI', ''],
    ['Subtotale:', Preventivi.subtotal],
    ['IVA (20%):', Preventivi.subtotal * 0.2],
    ['Altri Costi:', Preventivi.others],
    ['TOTALE:', Preventivi.Totale],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Setta coloane
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Preventivo');

  // Descarcă fișierul
  const fileName = `Preventivo_${Preventivi.id}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
