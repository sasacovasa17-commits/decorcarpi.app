/**
 * preventiveStorage.ts
 * Core logic pentru "I Miei Preventivi" - localStorage + prompt() nativ
 * EMPLIFIED: Doar nome + Preventivi number auto-generat
 */

export interface ClientData {
  nome: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
  codiceFiscale?: string;
}

export interface Preventivi {
  id: string;
  preventiveNumber: string; // PREV-001, PREV-002, etc.
  createdAt: number;
  clientData: ClientData;
  calculator: string;
  description: string;
  subtotal: number;
  others: number;
  Totale: number;
  priceMin?: number; // Preț minim (pentru range €900-€1300)
  priceMax?: number; // Preț maxim
  password?: string; // Parolă pentru editare preț
}

const STORAGE_KEY = 'decorcarpi_preventivi';

/**
 * Chiedi SOLO il nome cliente
 * Email, telefono, codice fiscale sono opzionali e possono essere aggiunti dopo in "Miei"
 * Nota: Questa funzione ritorna null - il dialog custom è gestito nel componente
 */
export async function askClientData(): Promise<ClientData | null> {
  const showPrompt = (window as any).showPromptDialog;
  if (!showPrompt) return null;

  const nome = await showPrompt('Decor Carpi', 'Nome completo');
  if (!nome) return null;
  
  const telefono = (await showPrompt('Decor Carpi', 'Telefono (opzionale)')) || undefined;
  const email = (await showPrompt('Decor Carpi', 'Email (opzionale)')) || undefined;
  const indirizzo = (await showPrompt('Decor Carpi', 'Indirizzo (opzionale)')) || undefined;
  const codiceFiscale = (await showPrompt('Decor Carpi', 'Codice Fiscale (opzionale)')) || undefined;
  
  return {
    nome,
    telefono,
    email,
    indirizzo,
    codiceFiscale,
  };
}

/**
 * Genereaza un ID unic pentru Preventivo
 */
function generateId(): string {
  return `prev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Genereaza numarul preventivului (PREV-001, PREV-002, etc.)
 */
function generatePreventiveNumber(): string {
  const preventives = getPreventives();
  const maxNum = preventives.reduce((max, p) => {
    const num = parseInt(p.preventiveNumber.split('-')[1] || '0');
    return Math.max(max, num);
  }, 0);
  
  return `PREV-${String(maxNum + 1).padStart(3, '0')}`;
}

/**
 * Aggiungi un nou Preventivo in localStorage
 */
export function addPreventive(
  clientData: ClientData,
  calculator: string,
  description: string,
  subtotal: number,
  others: number,
  Totale: number,
  priceMin?: number,
  priceMax?: number
): Preventivi {
  const preventives = getPreventives();
  
  console.log('[addPreventive] ===== INCEPUT SALVARE =====');
  console.log('[addPreventive] clientData COMPLET:', JSON.stringify(clientData, null, 2));
  console.log('[addPreventive] calculator:', calculator);
  console.log('[addPreventive] description:', description);
  console.log('[addPreventive] subtotal:', subtotal);
  console.log('[addPreventive] others:', others);
  console.log('[addPreventive] Totale:', Totale);
  
  const newPreventive: Preventivi = {
    id: generateId(),
    preventiveNumber: generatePreventiveNumber(),
    createdAt: Date.now(),
    clientData,
    calculator,
    description,
    subtotal,
    others,
    Totale,
    priceMin,
    priceMax,
  };
  
  preventives.push(newPreventive);
  console.log('[addPreventive] newPreventive COMPLET:', JSON.stringify(newPreventive, null, 2));
  const jsonString = JSON.stringify(preventives);
  console.log('[addPreventive] JSON Salvato în localStorage:', jsonString.substring(0, 500));
  localStorage.setItem(STORAGE_KEY, jsonString);
  console.log('[addPreventive] ===== SFARSIT SALVARE =====');
  
  // Verifica imediat ce s-a Salvato
  const verificare = getPreventives();
  console.log('[addPreventive] VERIF: Preventivi în localStorage după salvare:', verificare.length);
  if (verificare.length > 0) {
    console.log('[addPreventive] VERIF: Ultimul Preventivo Salvato:', JSON.stringify(verificare[verificare.length - 1], null, 2));
  }
  return newPreventive;
}

/**
 * Obtine toate preventivele din localStorage
 */
export function getPreventives(): Preventivi[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const result = stored ? JSON.parse(stored) : [];
    console.log('[getPreventives] Citit din localStorage:', result.length, 'Preventivi');
    if (result.length > 0) {
      console.log('[getPreventives] Primul Preventivo:', result[0]);
    }
    return result;
  } catch (e) {
    console.error('[getPreventives] Errore:', e);
    return [];
  }
}

/**
 * Rimuovi un Preventivo din localStorage
 */
export function deletePreventive(preventiveId: string): boolean {
  const preventives = getPreventives();
  const filtered = preventives.filter(p => p.id !== preventiveId);
  
  if (filtered.length === preventives.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Actualizeaza datele clientului unui Preventivo
 */
export function updatePreventiveClientData(
  preventiveId: string,
  clientData: Partial<ClientData>
): boolean {
  const preventives = getPreventives();
  const Preventivi = preventives.find(p => p.id === preventiveId);
  
  if (!Preventivi) return false;
  
  Preventivi.clientData = {
    ...Preventivi.clientData,
    ...clientData,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preventives));
  return true;
}

/**
 * Genereaza HTML-ul preventivului cu layout 2 coloane (float-based pentru html2canvas)
 */
export function generatePreventiveHTML(Preventivi: Preventivi): string {
  const formatter = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  });

  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preventivo ${Preventivi.preventiveNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; }
        body { font-family: Arial, sans-serif; background: #ffffff; }
        
        .container { 
          width: 210mm; 
          height: 297mm; 
          margin: 0 auto; 
          background: white; 
          padding: 20mm; 
          position: relative;
        }
        
        /* HEADER */
        .header { 
          text-align: center; 
          margin-bottom: 15mm; 
          border-bottom: 3mm solid #d4af37; 
          padding-bottom: 10mm;
          width: 100%;
          position: relative;
        }
        .header h1 { color: #d4af37; margin: 0; font-size: 24px; font-weight: bold; }
        .header p { color: #333; margin: 3px 0; font-size: 12px; }
        
        /* LOGO CURSIV DREAPTA SUS */
        .logo-cursive {
          position: absolute;
          top: 0;
          right: 0;
          font-style: italic;
          font-family: 'Brush Script MT', cursive;
          font-size: 10px;
          color: #d4af37;
          text-align: right;
          line-height: 1.2;
        }
        
        /* 2 COLOANE - FLOAT LAYOUT (html2canvas compatible) */
        .content { width: 100%; overflow: hidden; margin-bottom: 20mm; }
        
        .left-column { 
          float: left; 
          width: 55%; 
          padding-right: 10mm;
        }
        
        .right-column { 
          float: left; 
          width: 40%;
          padding-left: 10mm;
        }
        
        /* SECTION TITLES */
        .section-title { 
          color: #d4af37; 
          font-weight: bold; 
          font-size: 12px; 
          margin-bottom: 8mm; 
          margin-top: 10mm; 
        }
        .section-title:first-child { margin-top: 0; }
        
        /* ROWS */
        .row { 
          display: flex; 
          justify-content: space-between; 
          padding: 3mm 0; 
          color: #000; 
          font-size: 11px;
          border-bottom: 1px solid #eee;
        }
        .label { font-weight: bold; }
        .value { text-align: right; }
        
        /* PRICES SECTION */
        .prices { 
          background: #f9f9f9; 
          padding: 8mm; 
          border-radius: 2mm;
        }
        .price-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 4mm 0; 
          color: #000; 
          font-size: 11px;
        }
        .price-label { font-weight: bold; }
        .price-value { text-align: right; }
        .price-Totale { 
          font-weight: bold; 
          font-size: 13px; 
          padding-top: 5mm; 
          border-top: 2mm solid #d4af37; 
          margin-top: 5mm;
        }
        
        /* FOOTER */
        .footer { 
          clear: both;
          margin-top: 30mm;
          padding-top: 15mm; 
          border-top: 2mm solid #d4af37; 
          display: flex; 
          justify-content: space-between; 
          font-size: 10px; 
          color: #000;
          width: 100%;
        }
        .footer-left { flex: 1; }
        .footer-right { flex: 1; text-align: right; }
        .footer-text { margin-bottom: 3mm; line-height: 1.4; }
        .signature-line { 
          border-top: 1px solid #000; 
          margin-top: 8mm; 
          padding-top: 2mm; 
          min-height: 15mm; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- HEADER -->
      <div class="header">
        <div class="logo-cursive">
          <div>decor carpi</div>
          <div>decorcarpi.it</div>
        </div>
        <h1>PREVENTIVO ${Preventivi.preventiveNumber}</h1>
        <p>Data: ${new Date(Preventivi.createdAt).toLocaleDateString('it-IT')}</p>
      </div>

        <!-- 2 COLOANE CONTENT (FLOAT LAYOUT) -->
        <div class="content">
          <!-- STÂNGA: CLIENTE + PREVENTIVO -->
          <div class="left-column">
            <div class="section-title">CLIENTE</div>
            <div class="row">
              <span class="label">Nome:</span>
              <span class="value">${Preventivi.clientData.nome}</span>
            </div>
            ${Preventivi.clientData.telefono ? `<div class="row"><span class="label">Telefono:</span><span class="value">${Preventivi.clientData.telefono}</span></div>` : ''}
            ${Preventivi.clientData.email ? `<div class="row"><span class="label">Email:</span><span class="value">${Preventivi.clientData.email}</span></div>` : ''}
            ${Preventivi.clientData.indirizzo ? `<div class="row"><span class="label">Indirizzo:</span><span class="value">${Preventivi.clientData.indirizzo}</span></div>` : ''}
            ${Preventivi.clientData.codiceFiscale ? `<div class="row"><span class="label">Codice Fiscale:</span><span class="value">${Preventivi.clientData.codiceFiscale}</span></div>` : ''}
            
            <div class="section-title">PREVENTIVO</div>
            <div class="row">
              <span class="label">Tipo:</span>
              <span class="value">${Preventivi.calculator}</span>
            </div>
            <div class="row">
              <span class="label">Descrizione:</span>
              <span class="value">${Preventivi.description}</span>
            </div>
          </div>

          <!-- DREAPTA: PREȚURI -->
          <div class="right-column">
            <div class="prices">
              <div class="price-row">
                <span class="price-label">SUBTOTALE:</span>
                <span class="price-value">${formatter.format(Preventivi.subtotal)}</span>
              </div>
              <div class="price-row">
                <span class="price-label">IVA:</span>
                <span class="price-value">0€</span>
              </div>
              <div class="price-row">
                <span class="price-label">ALTRI:</span>
                <span class="price-value">${formatter.format(Preventivi.others + 2)}</span>
              </div>
              <div class="price-row price-Totale">
                <span class="price-label">TOTALE:</span>
                <span class="price-value">${formatter.format(Preventivi.subtotal + (Preventivi.others + 2))}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <div class="footer-left">
            <div class="footer-text">Per domande relative a questo preventivo</div>
            <div class="footer-text">contattare Nina all'indirizzo decorcarpi@gmail.com</div>
            <div class="footer-text">Cell 334 360 0932</div>
            <div class="footer-text" style="margin-top: 5mm; font-weight: bold;">Grazie per averci scelto!</div>
          </div>
          <div class="footer-right">
            <div class="signature-line">
              <div style="font-size: 10px; margin-bottom: 2mm;">Firma</div>
            </div>
            <div style="margin-top: 8mm;">
              <div style="font-size: 10px; margin-bottom: 2mm;">Data della firma</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}


/**
 * Descarcă preventivul ca PDF folosind jsPDF și html2canvas
 */
export async function downloadPreventivePDF(Preventivi: Preventivi): Promise<void> {
  try {
    console.log('[downloadPreventivePDF] Preventivo primit:', Preventivi);
    console.log('[downloadPreventivePDF] Preventivo number:', Preventivi.preventiveNumber);
    console.log('[downloadPreventivePDF] Client data:', Preventivi.clientData);
    console.log('[downloadPreventivePDF] Subtotal:', Preventivi.subtotal);
    
    // Importa dinamic pentru a evita probleme de SSR
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    // Creeaza un container temporar cu HTML-ul preventivului
    const container = document.createElement('div');
    const html = generatePreventiveHTML(Preventivi);
    console.log('[downloadPreventivePDF] HTML generat cu lungime:', html.length);
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm';
    document.body.appendChild(container);

    // Converti HTML la canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Creeaza PDF din canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Calcola numarul Totale de pagini
    let totalPages = 1;
    let tempHeightLeft = imgHeight - 297;
    while (tempHeightLeft > 0) {
      totalPages++;
      tempHeightLeft -= 297;
    }

    // Aggiungi Immagini la PDF (handle multiple pages) cu numerotare
    let currentPage = 1;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    pdf.setFontSize(10);
    pdf.text(`Pagina ${currentPage} din ${totalPages}`, 105, 290, { align: 'center' });
    heightLeft -= 297; // A4 height in mm

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      currentPage++;
      pdf.setFontSize(10);
      pdf.text(`Pagina ${currentPage} din ${totalPages}`, 105, 290, { align: 'center' });
      heightLeft -= 297;
    }

    // Descarca PDF
    pdf.save(`Preventivo_${Preventivi.preventiveNumber}.pdf`);

    // Curata container-ul temporar
    document.body.removeChild(container);
  } catch (error) {
    console.error('Errore la descărcarea PDF:', error);
    throw error;
  }
}


/**
 * Editează Dimensioni și preț ale unui Preventivo
 */
export function editPreventivePricing(
  preventiveId: string,
  subtotal: number,
  others: number,
  description: string
): boolean {
  const preventives = getPreventives();
  const Preventivi = preventives.find(p => p.id === preventiveId);
  
  if (!Preventivi) return false;
  
  Preventivi.subtotal = subtotal;
  Preventivi.others = others;
  Preventivi.Totale = subtotal + others;
  Preventivi.description = description;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preventives));
  return true;
}
