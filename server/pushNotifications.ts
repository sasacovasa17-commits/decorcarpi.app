/**
 * Sistema notificări push per Decor Carpi
 * Notifiche in tempo reale quando preventivo è visualizzato o accettato
 */

import { notifyOwner } from "./_core/notification";

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, string>;
}

/**
 * Invia notifica push al proprietario quando preventivo è visualizzato
 */
export const notifyPreventiveViewed = async (
  preventiveId: string,
  clientName: string,
  projectName: string,
  preventiveNumber: string
): Promise<boolean> => {
  try {
    const title = "📌 Preventivo Visualizzato";
    const content = `${clientName} ha visualizzato il preventivo #${preventiveNumber} per "${projectName}"`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Preventivo visualizzato notificato: ${preventiveId}`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyPreventiveViewed:", error);
    return false;
  }
};

/**
 * Invia notifica push al proprietario quando preventivo è accettato
 */
export const notifyPreventiveAccepted = async (
  preventiveId: string,
  clientName: string,
  projectName: string,
  preventiveNumber: string,
  amount: number
): Promise<boolean> => {
  try {
    const title = "🎉 Preventivo Accettato!";
    const content = `${clientName} ha accettato il preventivo #${preventiveNumber} per "${projectName}" (€${amount.toFixed(2)})`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Preventivo accettato notificato: ${preventiveId}`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyPreventiveAccepted:", error);
    return false;
  }
};

/**
 * Invia notifica push al proprietario quando preventivo è rifiutato
 */
export const notifyPreventiveRejected = async (
  preventiveId: string,
  clientName: string,
  projectName: string,
  preventiveNumber: string,
  reason?: string
): Promise<boolean> => {
  try {
    const title = "⚠️ Preventivo Rifiutato";
    const reasonText = reason ? ` - Motivo: ${reason}` : "";
    const content = `${clientName} ha rifiutato il preventivo #${preventiveNumber} per "${projectName}"${reasonText}`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Preventivo rifiutato notificato: ${preventiveId}`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyPreventiveRejected:", error);
    return false;
  }
};

/**
 * Invia notifica push al proprietario quando nuovo preventivo è creato
 */
export const notifyNewPreventive = async (
  preventiveId: string,
  clientName: string,
  projectName: string,
  preventiveNumber: string,
  amount: number
): Promise<boolean> => {
  try {
    const title = "📋 Nuovo Preventivo Creato";
    const content = `Preventivo #${preventiveNumber} per ${clientName} - "${projectName}" (€${amount.toFixed(2)})`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Nuovo preventivo notificato: ${preventiveId}`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyNewPreventive:", error);
    return false;
  }
};

/**
 * Invia notifica push al proprietario quando preventivo è modificato
 */
export const notifyPreventiveModified = async (
  preventiveId: string,
  projectName: string,
  preventiveNumber: string
): Promise<boolean> => {
  try {
    const title = "✏️ Preventivo Modificato";
    const content = `Il preventivo #${preventiveNumber} per "${projectName}" è stato aggiornato`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Preventivo modificato notificato: ${preventiveId}`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyPreventiveModified:", error);
    return false;
  }
};

/**
 * Invia notifica push al proprietario quando preventivo scade
 */
export const notifyPreventiveExpiring = async (
  preventiveId: string,
  clientName: string,
  projectName: string,
  preventiveNumber: string,
  daysUntilExpiry: number
): Promise<boolean> => {
  try {
    const title = "⏰ Preventivo in Scadenza";
    const content = `Il preventivo #${preventiveNumber} per ${clientName} scade tra ${daysUntilExpiry} giorni`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Preventivo in scadenza notificato: ${preventiveId}`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyPreventiveExpiring:", error);
    return false;
  }
};

/**
 * Invia notifica push al proprietario quando preventivo è scaduto
 */
export const notifyPreventiveExpired = async (
  preventiveId: string,
  clientName: string,
  projectName: string,
  preventiveNumber: string
): Promise<boolean> => {
  try {
    const title = "❌ Preventivo Scaduto";
    const content = `Il preventivo #${preventiveNumber} per ${clientName} è scaduto`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Preventivo scaduto notificato: ${preventiveId}`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyPreventiveExpired:", error);
    return false;
  }
};

/**
 * Invia notifica push al proprietario quando progetto è completato
 */
export const notifyProjectCompleted = async (
  projectId: string,
  clientName: string,
  projectName: string,
  totalAmount: number
): Promise<boolean> => {
  try {
    const title = "✅ Progetto Completato";
    const content = `Il progetto "${projectName}" per ${clientName} è stato completato (€${totalAmount.toFixed(2)})`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Progetto completato notificato: ${projectId}`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyProjectCompleted:", error);
    return false;
  }
};

/**
 * Invia notifica push al proprietario quando pagamento è ricevuto
 */
export const notifyPaymentReceived = async (
  projectId: string,
  clientName: string,
  projectName: string,
  amount: number,
  paymentMethod: string
): Promise<boolean> => {
  try {
    const title = "💰 Pagamento Ricevuto";
    const content = `Pagamento di €${amount.toFixed(2)} ricevuto da ${clientName} per "${projectName}" (${paymentMethod})`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Pagamento ricevuto notificato: ${projectId}`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyPaymentReceived:", error);
    return false;
  }
};

/**
 * Invia notifica push al proprietario quando cliente invia messaggio
 */
export const notifyNewMessage = async (
  clientName: string,
  projectName: string,
  messagePreview: string
): Promise<boolean> => {
  try {
    const title = "💬 Nuovo Messaggio";
    const content = `${clientName} ha inviato un messaggio per "${projectName}": "${messagePreview.substring(0, 50)}..."`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Nuovo messaggio notificato`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyNewMessage:", error);
    return false;
  }
};

/**
 * Invia notifica push al proprietario quando cliente richiede supporto
 */
export const notifySupportRequest = async (
  clientName: string,
  projectName: string,
  issueType: string,
  description: string
): Promise<boolean> => {
  try {
    const title = "🆘 Richiesta di Supporto";
    const content = `${clientName} ha richiesto supporto per "${projectName}" - ${issueType}`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Richiesta di supporto notificata`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifySupportRequest:", error);
    return false;
  }
};

/**
 * Invia notifica push al proprietario quando cliente lascia una recensione
 */
export const notifyNewReview = async (
  clientName: string,
  projectName: string,
  rating: number,
  reviewPreview: string
): Promise<boolean> => {
  try {
    const stars = "⭐".repeat(rating);
    const title = `${stars} Nuova Recensione`;
    const content = `${clientName} ha lasciato una recensione per "${projectName}": "${reviewPreview.substring(0, 50)}..."`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Nuova recensione notificata`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyNewReview:", error);
    return false;
  }
};

/**
 * Invia notifica push di promemoria attività
 */
export const notifyTaskReminder = async (
  taskName: string,
  dueDate: string,
  projectName: string
): Promise<boolean> => {
  try {
    const title = "📌 Promemoria Attività";
    const content = `Attività "${taskName}" per "${projectName}" scade il ${dueDate}`;

    const result = await notifyOwner({
      title,
      content,
    });

    if (result) {
      console.log(`[Push Notification] Promemoria attività notificato`);
    }

    return result;
  } catch (error) {
    console.error("[Push Notification Error] notifyTaskReminder:", error);
    return false;
  }
};
