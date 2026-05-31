import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PreventiveData {
  id: number;
  preventiveNumber: number;
  projectName: string;
  clientName?: string;
  clientEmail?: string;
  createdAt: Date;
  status: string;
  iva?: number;
  altri?: number;
}

export const generatePreventivePDF = async (Preventivi: PreventiveData, statusLabel: string) => {
  try {
    // Crea elemento HTML temporaneo
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.left = '-9999px';
    element.style.width = '210mm';
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.backgroundColor = 'white';
    element.style.color = '#000';

    const totalAmount = ((Preventivi.iva || 0) + (Preventivi.altri || 0)).toFixed(2);
    const preventiveDate = new Date(Preventivi.createdAt).toLocaleDateString('it-IT');
    const currentDate = new Date().toLocaleDateString('it-IT');
    const currentTime = new Date().toLocaleTimeString('it-IT');

    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #c9a227; padding-bottom: 20px;">
        <div style="font-size: 28px; font-weight: bold; color: #c9a227; margin-bottom: 10px;">DECOR CARPI</div>
        <div style="font-size: 24px; font-weight: bold;">PREVENTIVO</div>
        <div>N° ${String(Preventivi.preventiveNumber).padStart(3, '0')}</div>
      </div>
      
      <div style="margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
          <span style="font-weight: bold;">Progetto:</span>
          <span>${Preventivi.projectName}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
          <span style="font-weight: bold;">Cliente:</span>
          <span>${Preventivi.clientName || 'N/A'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
          <span style="font-weight: bold;">Email:</span>
          <span>${Preventivi.clientEmail || 'N/A'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
          <span style="font-weight: bold;">Data:</span>
          <span>${preventiveDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
          <span style="font-weight: bold;">Status:</span>
          <span>${statusLabel}</span>
        </div>
      </div>
      
      <div style="margin: 30px 0; border-top: 1px solid #ddd; padding-top: 20px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px;">
          <span>Importo Totalee:</span>
          <span>€ ${totalAmount}</span>
        </div>
        <div style="margin-top: 10px; font-size: 12px; color: #666;">
          <p>IVA inclusa</p>
        </div>
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center;">
        <p>Generato il ${currentDate} alle ${currentTime}</p>
        <p>Decor Carpi - Stucchi Decorativi | www.decorcarpi.it</p>
      </div>
    `;

    document.body.appendChild(element);

    // Converti HTML a canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    // Crea PDF da canvas
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

    // Scarica PDF
    pdf.save(`Preventivo_${String(Preventivi.preventiveNumber).padStart(3, '0')}.pdf`);

    document.body.removeChild(element);
  } catch (error) {
    console.error('Errore durante la generazione del PDF:', error);
    throw error;
  }
};
