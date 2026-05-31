/**
 * Template email personalizate per Decor Carpi
 * Tutte le email sono in italiano con branding aziendale
 */

export interface EmailTemplateData {
  clientName: string;
  projectName: string;
  preventiveNumber: string;
  amount: number;
  iva: number;
  surcharge: number;
  discount: number;
  description?: string;
  address?: string;
  city?: string;
  date: string;
  viewUrl?: string;
  acceptUrl?: string;
}

/**
 * Template email di conferma preventivo
 */
export const generatePreventiveConfirmationEmail = (data: EmailTemplateData): string => {
  const totalAmount = data.amount + data.iva + data.surcharge - data.discount;

  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preventivo Decor Carpi</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #c9a227 0%, #d4b537 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .details-section {
            background-color: #f9f9f9;
            border-left: 4px solid #c9a227;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .details-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .details-row:last-child {
            border-bottom: none;
        }
        .details-label {
            font-weight: 600;
            color: #666;
        }
        .details-value {
            color: #333;
        }
        .summary-section {
            background-color: #f0f0f0;
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 14px;
        }
        .summary-total {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-top: 2px solid #c9a227;
            font-size: 18px;
            font-weight: bold;
            color: #c9a227;
            margin-top: 10px;
        }
        .cta-button {
            display: inline-block;
            background-color: #c9a227;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #b89220;
        }
        .footer {
            background-color: #0a0a0a;
            color: #999;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        .footer-link {
            color: #c9a227;
            text-decoration: none;
        }
        .note {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DECOR CARPI</h1>
            <p>Stucchi Decorativi - Preventivo</p>
        </div>

        <div class="content">
            <div class="greeting">
                <p>Caro <strong>${data.clientName}</strong>,</p>
                <p>Ti ringraziamo per aver scelto Decor Carpi! Allego il preventivo per il tuo progetto.</p>
            </div>

            <div class="details-section">
                <div class="details-row">
                    <span class="details-label">Numero Preventivo:</span>
                    <span class="details-value">#${data.preventiveNumber}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Progetto:</span>
                    <span class="details-value">${data.projectName}</span>
                </div>
                ${data.address ? `
                <div class="details-row">
                    <span class="details-label">Indirizzo:</span>
                    <span class="details-value">${data.address}${data.city ? `, ${data.city}` : ""}</span>
                </div>
                ` : ""}
                <div class="details-row">
                    <span class="details-label">Data:</span>
                    <span class="details-value">${data.date}</span>
                </div>
                ${data.description ? `
                <div class="details-row">
                    <span class="details-label">Descrizione:</span>
                    <span class="details-value">${data.description}</span>
                </div>
                ` : ""}
            </div>

            <div class="summary-section">
                <div class="summary-row">
                    <span>Importo Base:</span>
                    <span>€ ${data.amount.toFixed(2)}</span>
                </div>
                ${data.iva > 0 ? `
                <div class="summary-row">
                    <span>IVA (22%):</span>
                    <span>€ ${data.iva.toFixed(2)}</span>
                </div>
                ` : ""}
                ${data.surcharge > 0 ? `
                <div class="summary-row">
                    <span>Lavori Supplementari:</span>
                    <span>€ ${data.surcharge.toFixed(2)}</span>
                </div>
                ` : ""}
                ${data.discount > 0 ? `
                <div class="summary-row">
                    <span>Sconto:</span>
                    <span>- € ${data.discount.toFixed(2)}</span>
                </div>
                ` : ""}
                <div class="summary-total">
                    <span>TOTALE:</span>
                    <span>€ ${totalAmount.toFixed(2)}</span>
                </div>
            </div>

            ${data.viewUrl ? `
            <div style="text-align: center;">
                <a href="${data.viewUrl}" class="cta-button">Visualizza Preventivo Completo</a>
            </div>
            ` : ""}

            <div class="note">
                <strong>⚠️ Nota Importante:</strong> Questo è un preventivo indicativo. Il prezzo finale potrebbe variare in base a fattori quali preparazione della superficie, zona geografica e complessità del lavoro. Ti contatteremo per una quotazione precisa dopo un'ispezione in situ.
            </div>

            <p>Se hai domande o desideri apportare modifiche, non esitare a contattarci.</p>

            <p>Cordiali saluti,<br>
            <strong>Il Team di Decor Carpi</strong></p>
        </div>

        <div class="footer">
            <p>Decor Carpi - Stucchi Decorativi</p>
            <p>📞 Contattaci per una consulenza gratuita</p>
            <p style="margin-top: 10px; border-top: 1px solid #333; padding-top: 10px;">
                © 2026 Decor Carpi. Tutti i diritti riservati.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Template email di notifica preventivo visualizzato
 */
export const generatePreventiveViewedNotificationEmail = (
  adminEmail: string,
  data: EmailTemplateData
): string => {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Preventivo Visualizzato</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 20px auto; background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .header { background: #c9a227; color: white; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border-radius: 4px; }
        .alert { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .details { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">🔔 Notifica: Preventivo Visualizzato</h2>
        </div>
        <div class="content">
            <div class="alert">
                <strong>✅ Il cliente ha visualizzato il preventivo!</strong>
            </div>
            <div class="details">
                <p><strong>Cliente:</strong> ${data.clientName}</p>
                <p><strong>Preventivo:</strong> #${data.preventiveNumber}</p>
                <p><strong>Progetto:</strong> ${data.projectName}</p>
                <p><strong>Importo:</strong> € ${(data.amount + data.iva + data.surcharge - data.discount).toFixed(2)}</p>
                <p><strong>Data Visualizzazione:</strong> ${new Date().toLocaleString("it-IT")}</p>
            </div>
            <p>Il cliente sembra interessato. Considera di contattarlo per discutere i dettagli del progetto.</p>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Template email di notifica preventivo accettato
 */
export const generatePreventiveAcceptedNotificationEmail = (
  adminEmail: string,
  data: EmailTemplateData
): string => {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Preventivo Accettato</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 20px auto; background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .header { background: #28a745; color: white; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border-radius: 4px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .details { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .cta-button { display: inline-block; background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">🎉 Preventivo Accettato!</h2>
        </div>
        <div class="content">
            <div class="success">
                <strong>✅ Il cliente ha accettato il preventivo!</strong>
            </div>
            <div class="details">
                <p><strong>Cliente:</strong> ${data.clientName}</p>
                <p><strong>Preventivo:</strong> #${data.preventiveNumber}</p>
                <p><strong>Progetto:</strong> ${data.projectName}</p>
                <p><strong>Importo Totale:</strong> € ${(data.amount + data.iva + data.surcharge - data.discount).toFixed(2)}</p>
                <p><strong>Data Accettazione:</strong> ${new Date().toLocaleString("it-IT")}</p>
            </div>
            <p>🚀 È ora di iniziare il progetto! Contatta il cliente per concordare i dettagli di inizio lavori.</p>
            <a href="#" class="cta-button">Visualizza Dettagli Progetto</a>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Template email di notifica preventivo rifiutato
 */
export const generatePreventiveRejectedNotificationEmail = (
  adminEmail: string,
  data: EmailTemplateData,
  reason?: string
): string => {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Preventivo Rifiutato</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 20px auto; background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .header { background: #dc3545; color: white; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border-radius: 4px; }
        .warning { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .details { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">⚠️ Preventivo Rifiutato</h2>
        </div>
        <div class="content">
            <div class="warning">
                <strong>Il cliente ha rifiutato il preventivo.</strong>
            </div>
            <div class="details">
                <p><strong>Cliente:</strong> ${data.clientName}</p>
                <p><strong>Preventivo:</strong> #${data.preventiveNumber}</p>
                <p><strong>Progetto:</strong> ${data.projectName}</p>
                ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ""}
            </div>
            <p>Considera di contattare il cliente per capire i motivi del rifiuto e offrire alternative.</p>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Template email di reminder preventivo non visualizzato
 */
export const generatePreventiveReminderEmail = (data: EmailTemplateData): string => {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Reminder Preventivo</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 20px auto; background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .header { background: #c9a227; color: white; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border-radius: 4px; }
        .cta-button { display: inline-block; background: #c9a227; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">📋 Reminder: Il Tuo Preventivo</h2>
        </div>
        <div class="content">
            <p>Caro ${data.clientName},</p>
            <p>Ti ricordiamo che hai ricevuto un preventivo per il tuo progetto <strong>${data.projectName}</strong>.</p>
            <p>Se hai domande o desideri discutere i dettagli, non esitare a contattarci.</p>
            <a href="${data.viewUrl || "#"}" class="cta-button">Visualizza Preventivo</a>
            <p>Cordiali saluti,<br>Il Team di Decor Carpi</p>
        </div>
    </div>
</body>
</html>
  `;
};
