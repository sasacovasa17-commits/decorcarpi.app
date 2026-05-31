import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

/**
 * Contact router - proceduri pentru trimitere mesaje și preventivo
 */

export const contactRouter = router({
  /**
   * Trimite mesaj de contact
   */
  sendContactMessage: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nume prea scurt").max(100),
        email: z.string().email("Email invalid"),
        phone: z.string().min(5, "Telefon invalid").max(20),
        message: z.string().min(10, "Mesaj prea scurt").max(1000),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Validare email
        if (!input.email.includes("@")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email invalid",
          });
        }

        // Trimite email via Manus API
        const apiUrl = process.env.BUILT_IN_FORGE_API_URL;
        const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

        if (!apiUrl || !apiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Email service not configured",
          });
        }

        const emailHtml = `
          <h2>Mesaj de contact de pe Decor Carpi App</h2>
          <p><strong>Nume:</strong> ${escapeHtml(input.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
          <p><strong>Telefon:</strong> ${escapeHtml(input.phone)}</p>
          <p><strong>Mesaj:</strong></p>
          <p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>
          <hr>
          <p><em>Mesaj trimis de la Decor Carpi App - ${new Date().toLocaleString("it-IT")}</em></p>
        `;

        // Trimite email la admin
        const adminResponse = await fetch(`${apiUrl}/email/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            to: "contact@decorcarpi.it",
            subject: `Mesaj de contact: ${input.name}`,
            html: emailHtml,
            text: stripHtml(emailHtml),
          }),
        });

        if (!adminResponse.ok) {
          console.error("[Email] Admin email failed:", await adminResponse.text());
        }

        // Trimite email de confirmare la utilizator
        const confirmationHtml = `
          <h2>Grazie per il tuo messaggio!</h2>
          <p>Ciao ${escapeHtml(input.name)},</p>
          <p>Ho ricevuto il tuo messaggio e ti risponderò al più presto.</p>
          <p>Echipa Decor Carpi</p>
        `;

        const userResponse = await fetch(`${apiUrl}/email/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            to: input.email,
            subject: "Conferma: Il tuo messaggio è stato ricevuto",
            html: confirmationHtml,
            text: stripHtml(confirmationHtml),
          }),
        });

        if (!userResponse.ok) {
          console.error("[Email] User confirmation email failed:", await userResponse.text());
        }

        return {
          success: true,
          message: "Mesaj trimis cu succes!",
        };
      } catch (error) {
        console.error("[Contact] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Eroare la trimiterea mesajului. Riprova.",
        });
      }
    }),

  /**
   * Trimite preventivo email
   */
  sendPreventuvo: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email invalid"),
        name: z.string().min(2, "Nume prea scurt"),
        type: z.string(),
        details: z.record(z.string(), z.any()),
        estimatedPrice: z.number().positive(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const apiUrl = process.env.BUILT_IN_FORGE_API_URL;
        const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

        if (!apiUrl || !apiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Email service not configured",
          });
        }

        const detailsHtml = Object.entries(input.details)
          .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
          .join("");

        const emailHtml = `
          <h2>Preventivo Decor Carpi</h2>
          <p>Ciao ${escapeHtml(input.name)},</p>
          <p>Ecco i dettagli del tuo preventivo:</p>
          <p><strong>Tip:</strong> ${input.type}</p>
          ${detailsHtml}
          <p><strong>Prezzo stimato:</strong> €${input.estimatedPrice.toFixed(2)}</p>
          <hr>
          <p>Per ulteriori informazioni, contattaci su WhatsApp o telefono.</p>
          <p>Echipa Decor Carpi</p>
        `;

        // Trimite la utilizator
        await fetch(`${apiUrl}/email/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            to: input.email,
            subject: "Preventivo Decor Carpi",
            html: emailHtml,
            text: stripHtml(emailHtml),
          }),
        });

        // Invia anche all'admin
        await fetch(`${apiUrl}/email/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            to: "contact@decorcarpi.it",
            subject: `Preventivo generat: ${input.type}`,
            html: `${emailHtml}<hr><p>Email client: ${input.email}</p>`,
            text: stripHtml(emailHtml),
          }),
        });

        return {
          success: true,
          message: "Preventivo trimis cu succes!",
        };
      } catch (error) {
        console.error("[Preventivo] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Errore nell'invio del preventivo. Riprova.",
        });
      }
    }),
});

/**
 * Utility functions
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

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
}
