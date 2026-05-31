import sgMail from "@sendgrid/mail";

/**
 * Inițializează SendGrid cu API key din env
 */
function initSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn("[Email] SENDGRID_API_KEY nu e configurat. Email notifications dezactivate.");
    return null;
  }
  sgMail.setApiKey(apiKey);
  return sgMail;
}

/**
 * Trimite email prin SendGrid
 * @param to - Adresa destinatarului
 * @param subject - Subiectul emailului
 * @param html - Conținut HTML
 * @param text - Conținut text (fallback)
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  try {
    const sg = initSendGrid();
    if (!sg) {
      console.warn("[Email] SendGrid non è inizializzato. L'email non è stata inviata.");
      return false;
    }

    const from = process.env.SENDGRID_FROM_EMAIL || "noreply@decorcarpi.it";

    await sg.send({
      to,
      from,
      subject,
      html,
      text: text || "Mesaj de la Decor Carpi",
    });

    console.log(`[Email] Email trimis cu succes la ${to}`);
    return true;
  } catch (error) {
    console.error("[Email] Eroare la trimitere email:", error);
    return false;
  }
}

/**
 * Trimite notificare contact la admin
 */
export async function sendContactNotification({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<boolean> {
  const adminEmail = "decorcarpi@gmail.com";
  const subject = `📧 Mesaj nou de contact - ${name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
      <h2 style="color: #c9a227; border-bottom: 2px solid #c9a227; padding-bottom: 10px;">Mesaj nou de contact</h2>
      
      <p><strong>Nume:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      ${phone ? `<p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>` : ""}
      
      <div style="background: white; padding: 15px; border-left: 4px solid #c9a227; margin: 20px 0;">
        <strong>Mesaj:</strong>
        <p style="white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(message)}</p>
      </div>
      
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Inviato dall'app Decor Carpi PWA
      </p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject,
    html,
    text: `Mesaj de contact de la ${name} (${email}): ${message}`,
  });
}

/**
 * Trimite notificare preventivo (quote) la admin
 */
export async function sendQuoteNotification({
  name,
  email,
  phone,
  serviceType,
  squareMeters,
  totalPrice,
  details,
}: {
  name: string;
  email: string;
  phone?: string;
  serviceType: string;
  squareMeters: number;
  totalPrice: number;
  details: string;
}): Promise<boolean> {
  const adminEmail = "decorcarpi@gmail.com";
  const subject = `💰 Preventivo richiesto - ${serviceType} (${squareMeters}m²)`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
      <h2 style="color: #c9a227; border-bottom: 2px solid #c9a227; padding-bottom: 10px;">Richiesta di preventivo</h2>
      
      <p><strong>Servizio:</strong> ${escapeHtml(serviceType)}</p>
      <p><strong>Cliente:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      ${phone ? `<p><strong>Telefono:</strong> ${escapeHtml(phone)}</p>` : ""}
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Superficie:</strong> ${squareMeters.toFixed(2)} m²</p>
        <p style="font-size: 18px; color: #c9a227;"><strong>Prezzo stimato:</strong> €${totalPrice.toFixed(2)}</p>
      </div>
      
      <div style="background: white; padding: 15px; border-left: 4px solid #c9a227; margin: 20px 0;">
        <strong>Dettagli:</strong>
        <p style="white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(details)}</p>
      </div>
      
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Richiesta ricevuta tramite app PWA Decor Carpi
      </p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject,
    html,
    text: `Preventivo richiesto: ${serviceType} - ${squareMeters}m² - €${totalPrice.toFixed(2)}`,
  });
}

/**
 * Escapa caratteri HTML pericolosi
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
