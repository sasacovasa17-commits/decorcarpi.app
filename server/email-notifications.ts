// Email notification helpers - no LLM needed

/**
 * Email notification helpers pentru Contact form și Preventivo
 */

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Trimite email de contact la admin
 */
export async function sendContactEmail(
  name: string,
  email: string,
  phone: string,
  message: string
): Promise<boolean> {
  try {
    const htmlContent = `
      <h2>Mesaj de contact de pe Decor Carpi App</h2>
      <p><strong>Nume:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Mesaj:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      <hr>
      <p><em>Mesaj trimis de la Decor Carpi App - ${new Date().toLocaleString("it-IT")}</em></p>
    `;

    const textContent = `
Mesaj de contact de pe Decor Carpi App

Nume: ${name}
Email: ${email}
Telefon: ${phone}

Mesaj:
${message}

---
Mesaj trimis de la Decor Carpi App - ${new Date().toLocaleString("it-IT")}
    `.trim();

    // Trimite email la admin
    await sendEmailViaAPI({
      to: "contact@decorcarpi.it",
      subject: `Mesaj de contact: ${name}`,
      htmlContent,
      textContent,
    });

    // Trimite email de confirmare la utilizator
    const confirmationHtml = `
      <h2>Grazie per il tuo messaggio!</h2>
      <p>Ciao ${escapeHtml(name)},</p>
      <p>Ho ricevuto il tuo messaggio e ti risponderò al più presto.</p>
      <p>Echipa Decor Carpi</p>
    `;

    await sendEmailViaAPI({
      to: email,
      subject: "Conferma: Il tuo messaggio è stato ricevuto",
      htmlContent: confirmationHtml,
    });

    return true;
  } catch (error) {
    console.error("[Email] Eroare trimitere contact email:", error);
    return false;
  }
}

/**
 * Trimite email cu detaliile preventivo
 */
export async function sendPreventuvoEmail(
  email: string,
  name: string,
  preventuvoData: {
    type: string;
    details: Record<string, string | number>;
    estimatedPrice: number;
  }
): Promise<boolean> {
  try {
    const detailsHtml = Object.entries(preventuvoData.details)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
      .join("");

    const htmlContent = `
      <h2>Preventivo Decor Carpi</h2>
      <p>Ciao ${escapeHtml(name)},</p>
      <p>Ecco i dettagli del tuo preventivo:</p>
      <p><strong>Tip:</strong> ${preventuvoData.type}</p>
      ${detailsHtml}
      <p><strong>Prezzo stimato:</strong> €${preventuvoData.estimatedPrice.toFixed(2)}</p>
      <hr>
      <p>Per ulteriori informazioni, contattaci su WhatsApp o telefono.</p>
      <p>Echipa Decor Carpi</p>
    `;

    await sendEmailViaAPI({
      to: email,
      subject: "Preventivo Decor Carpi",
      htmlContent,
    });

    // Invia anche all'admin
    await sendEmailViaAPI({
      to: "contact@decorcarpi.it",
      subject: `Preventivo generat: ${preventuvoData.type}`,
      htmlContent: `${htmlContent}<hr><p>Email client: ${email}</p>`,
    });

    return true;
  } catch (error) {
    console.error("[Email] Eroare trimitere preventivo email:", error);
    return false;
  }
}

/**
 * Trimite email de notificare admin
 */
export async function sendAdminNotification(
  subject: string,
  message: string
): Promise<boolean> {
  try {
    const htmlContent = `
      <h2>${subject}</h2>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <hr>
      <p><em>Notifica automatica dall'app Decor Carpi - ${new Date().toLocaleString("it-IT")}</em></p>
    `;

    await sendEmailViaAPI({
      to: "contact@decorcarpi.it",
      subject: `[Notificare App] ${subject}`,
      htmlContent,
    });

    return true;
  } catch (error) {
    console.error("[Email] Eroare trimitere notificare admin:", error);
    return false;
  }
}

/**
 * Funcție internă: trimite email via Manus Built-in API
 */
async function sendEmailViaAPI(options: EmailOptions): Promise<void> {
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error("Email API credentials not configured");
  }

  const response = await fetch(`${apiUrl}/email/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      to: options.to,
      subject: options.subject,
      html: options.htmlContent,
      text: options.textContent || stripHtml(options.htmlContent),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Email API error: ${response.status} - ${error}`);
  }
}

/**
 * Utility: escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Utility: strip HTML tags
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
}
