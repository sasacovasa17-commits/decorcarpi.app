import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const whatsappRouter = router({
  /**
   * Generate WhatsApp share link for a preventive
   * Encodes preventive details in URL and opens WhatsApp
   */
  generateShareLink: protectedProcedure
    .input(
      z.object({
        preventiveId: z.string(),
        clientName: z.string(),
        clientPhone: z.string().optional(),
        projectName: z.string(),
        totalPrice: z.number(),
        sqm: z.number(),
        textureName: z.string(),
      })
    )
    .mutation(({ input }) => {
      // Format message for WhatsApp
      const message = `
Ciao ${input.clientName}! 👋

Ecco il tuo preventivo per il progetto "${input.projectName}":

📐 Superficie: ${input.sqm} m²
🎨 Texture: ${input.textureName}
💰 Prezzo totale: €${input.totalPrice.toFixed(2)} (IVA inclusa)

Preventivo ID: ${input.preventiveId}

Clicca il link per visualizzare il PDF completo:
[PDF allegato]

Contattami per domande o per procedere con l'ordine!

Decor Carpi - Stucchi Decorativi
      `.trim();

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);

      // Generate WhatsApp link
      const whatsappLink = `https://wa.me/?text=${encodedMessage}`;

      // If phone is provided, send directly to that number
      const directLink = input.clientPhone
        ? `https://wa.me/${input.clientPhone.replace(/\D/g, "")}?text=${encodedMessage}`
        : whatsappLink;

      return {
        link: directLink,
        message,
        preventiveId: input.preventiveId,
      };
    }),

  /**
   * Generate WhatsApp message template for follow-up
   */
  generateFollowUpMessage: protectedProcedure
    .input(
      z.object({
        clientName: z.string(),
        projectName: z.string(),
        daysSinceSent: z.number(),
      })
    )
    .mutation(({ input }) => {
      const message = `
Ciao ${input.clientName}! 👋

Volevo verificare se hai avuto la possibilità di rivedere il preventivo per il progetto "${input.projectName}".

Se hai domande o vorresti procedere, sono a tua disposizione!

Decor Carpi - Stucchi Decorativi
      `.trim();

      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/?text=${encodedMessage}`;

      return {
        link: whatsappLink,
        message,
      };
    }),

  /**
   * Generate WhatsApp message for project completion
   */
  generateCompletionMessage: protectedProcedure
    .input(
      z.object({
        clientName: z.string(),
        projectName: z.string(),
        completionDate: z.string(),
      })
    )
    .mutation(({ input }) => {
      const message = `
Ciao ${input.clientName}! 🎉

Il progetto "${input.projectName}" è stato completato con successo il ${input.completionDate}!

Grazie per la fiducia. Spero che il risultato ti piaccia!

Se hai bisogno di ritocchi o di altri lavori, non esitare a contattarmi.

Decor Carpi - Stucchi Decorativi
      `.trim();

      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/?text=${encodedMessage}`;

      return {
        link: whatsappLink,
        message,
      };
    }),

  /**
   * Generate WhatsApp message for special offer
   */
  generateOfferMessage: protectedProcedure
    .input(
      z.object({
        clientName: z.string(),
        offerDescription: z.string(),
        discountPercentage: z.number(),
        validUntil: z.string(),
      })
    )
    .mutation(({ input }) => {
      const message = `
Ciao ${input.clientName}! 🎁

Ho un'offerta speciale per te:

${input.offerDescription}

🔥 Sconto: ${input.discountPercentage}%
⏰ Valido fino al: ${input.validUntil}

Contattami subito per approfittare di questa opportunità!

Decor Carpi - Stucchi Decorativi
      `.trim();

      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/?text=${encodedMessage}`;

      return {
        link: whatsappLink,
        message,
      };
    }),
});
