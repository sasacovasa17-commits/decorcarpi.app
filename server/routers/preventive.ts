import { router, publicProcedure } from "../_core/trpc";
import { preventives, preventiveItems } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, desc } from "drizzle-orm";
import { sendPreventuvoEmail } from "../email-notifications";
import { generateEditablePDFWithFields } from "../pdf-generator";
import { z } from "zod";

export const preventiveRouter = router({
  // Generare PDF editabil
  generateEditablePDF: publicProcedure
    .input(z.object({
      preventiveNumber: z.string(),
      clientName: z.string(),
      clientEmail: z.string().optional(),
      clientPhone: z.string().optional(),
      clientAddress: z.string().optional(),
      clientCodiceFiscale: z.string().optional(),
      workType: z.string(),
      description: z.string(),
      subtotal: z.number(),
      iva: z.number(),
      altri: z.number(),
      total: z.number(),
      createdAt: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        console.log('[Server] generateEditablePDF inceput pentru:', input.preventiveNumber);
        const pdfBuffer = await generateEditablePDFWithFields({
          id: input.preventiveNumber,
          preventiveNumber: input.preventiveNumber,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          clientAddress: input.clientAddress,
          clientCodiceFiscale: input.clientCodiceFiscale,
          workType: input.workType,
          description: input.description,
          subtotal: input.subtotal,
          iva: input.iva,
          altri: input.altri,
          total: input.total,
          createdAt: new Date(input.createdAt),
        });

        // Converteste buffer la base64 pentru transmisie
        const base64Pdf = pdfBuffer.toString('base64');
        console.log('[Server] PDF generat cu succes, size:', base64Pdf.length, 'bytes');
        return {
          data: {
            pdf: base64Pdf,
            filename: `Preventivo_${input.preventiveNumber}_Editabile.pdf`,
          },
        };
      } catch (error) {
        console.error('[Server] Eroare la generarea PDF editabil:', error);
        console.error('[Server] Stack trace:', error instanceof Error ? error.stack : 'N/A');
        throw new Error('Eroare la generarea PDF editabil: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }),

  // Salvare preventiv nou
  create: publicProcedure
    .input((val: unknown) => {
      console.log("[Preventive.create] Input validator called with:", val, "Type:", typeof val);
      if (typeof val !== "object" || val === null) throw new Error(`Invalid input: got ${typeof val}`);
      const obj = val as Record<string, unknown>;
      console.log("[Preventive.create] Input validator parsed:", { projectName: obj.projectName, clientName: obj.clientName });
      return {
        projectName: String(obj.projectName || ""),
        clientName: String(obj.clientName || ""),
        clientCF: String(obj.clientCF || ""),
        clientAddress: String(obj.clientAddress || ""),
        clientEmail: String(obj.clientEmail || ""),
        description: String(obj.description || ""),
        iva: Number(obj.iva || 0),
        altri: Number(obj.altri || 0),
        items: Array.isArray(obj.items) ? obj.items : [],
      };
    })
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Ottieni il numero di preventivo successivo
      const lastPreventive = await db
        .select({ preventiveNumber: preventives.preventiveNumber })
        .from(preventives)
        .orderBy(desc(preventives.preventiveNumber))
        .limit(1);

      const nextNumber = (parseInt(lastPreventive[0]?.preventiveNumber as string) || 0) + 1;

      // Salva il preventivo
      const result = await db.insert(preventives).values({
        userId: 1, // Public user
        projectName: input.projectName,
        preventiveNumber: String(nextNumber),
        clientName: input.clientName,
        clientCF: input.clientCF,
        clientAddress: input.clientAddress,
        clientEmail: input.clientEmail,
        description: input.description,
        iva: input.iva,
        altri: input.altri,
        status: "draft",
      });

      const preventiveId = (result as any)[0].insertId;

      // Salva gli articoli
      if (input.items.length > 0) {
        await db.insert(preventiveItems).values(
          input.items.map((item: any) => ({
            preventiveId: preventiveId,
            type: item.type || "stucco",
            model: item.model || "",
            color: item.color || "",
            room: item.room || "",
            sqm: item.sqm || 0,
            pricePerSqm: item.pricePerSqm || 0,
          }))
        );
      }

      // Trimite email de notificare la client
      if (input.clientEmail) {
        await sendPreventuvoEmail(input.clientEmail, input.clientName, {
          type: "Preventivo Stucchi Decorativi",
          details: {
            "Progetto": input.projectName,
            "Descrizione": input.description,
            "Articoli": `${input.items.length} articoli`,
          },
          estimatedPrice: input.items.reduce((sum: number, item: any) => sum + (item.sqm * item.pricePerSqm), 0) + input.iva + input.altri,
        });
      }

      return { id: preventiveId, preventiveNumber: nextNumber };
    }),

  // Obține toate preventivele
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db
      .select()
      .from(preventives)
      .orderBy(desc(preventives.createdAt));
    return result;
  }),

  // Obține un preventiv cu articolele sale
  get: publicProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return { id: Number(obj.id) };
    })
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const preventive = await db
        .select()
        .from(preventives)
        .where(eq(preventives.id, input.id))
        .limit(1);

      if (!preventive[0]) throw new Error("Preventivo non trovato");

      const items = await db
        .select()
        .from(preventiveItems)
        .where(eq(preventiveItems.preventiveId, input.id));

      return { ...preventive[0], items };
    }),

  // Actualizare preventiv
  update: publicProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return {
        id: Number(obj.id),
        projectName: String(obj.projectName || ""),
        clientName: String(obj.clientName || ""),
        clientCF: String(obj.clientCF || ""),
        clientAddress: String(obj.clientAddress || ""),
        clientEmail: String(obj.clientEmail || ""),
        description: String(obj.description || ""),
        iva: Number(obj.iva || 0),
        altri: Number(obj.altri || 0),
        status: String(obj.status || "draft"),
      };
    })
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(preventives)
        .set({
          projectName: input.projectName,
          clientName: input.clientName,
          clientCF: input.clientCF,
          clientAddress: input.clientAddress,
          clientEmail: input.clientEmail,
          description: input.description,
          iva: input.iva,
          altri: input.altri,
          status: input.status as any,
        })
        .where(eq(preventives.id, input.id));

      return { success: true };
    }),

  // Șterge preventiv
  delete: publicProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return { id: Number(obj.id) };
    })
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Șterge articolele
      await db.delete(preventiveItems).where(eq(preventiveItems.preventiveId, input.id));

      // Șterge preventivul
      await db.delete(preventives).where(eq(preventives.id, input.id));

      return { success: true };
    }),

  // Trimite preventiv prin email
  sendEmail: publicProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return {
        id: Number(obj.id),
        clientEmail: String(obj.clientEmail || ""),
      };
    })
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Ottieni il preventivo
      const preventive = await db
        .select()
        .from(preventives)
        .where(eq(preventives.id, input.id))
        .limit(1);

      if (!preventive[0]) throw new Error("Preventivo non trovato");

      // Ottieni gli articoli
      const items = await db
        .select()
        .from(preventiveItems)
        .where(eq(preventiveItems.preventiveId, input.id));

      // Calcola il totale
      const subtotal = items.reduce((sum, item) => sum + (item.sqm * item.pricePerSqm), 0);
      const total = subtotal + preventive[0].iva + preventive[0].altri;

      // Trimite email la client
      const { sendEmail: sendEmailFn } = await import("../_core/email");
      const clientEmailSent = await sendEmailFn({
        to: input.clientEmail,
        subject: `Preventivo #${String(preventive[0].preventiveNumber).padStart(3, "0")} - Decor Carpi`,
        html: generatePreventiveEmailHTML({
          preventiveNumber: String(preventive[0].preventiveNumber),
          clientName: preventive[0].clientName || "Cliente",
          projectName: preventive[0].projectName,
          totalAmount: total,
          itemsCount: items.length,
        }),
      });

      // Trimite notificare la proprietar
      const { sendEmail: sendEmailFn2 } = await import("../_core/email");
      try {
        await sendEmailFn2({
          to: "decorcarpi@gmail.com",
          subject: `📊 Preventivo #${String(preventive[0].preventiveNumber).padStart(3, "0")} trimis`,
          html: generateOwnerNotificationHTML({
            preventiveNumber: String(preventive[0].preventiveNumber),
            clientName: preventive[0].clientName || "Cliente",
            clientEmail: input.clientEmail,
            projectName: preventive[0].projectName,
            totalAmount: total,
            itemsCount: items.length,
          }),
        });
      } catch (error) {
        console.error("[Email] Failed to send owner notification:", error);
      }

      // Aggiorna lo stato
      await db
        .update(preventives)
        .set({ status: "sent", sentAt: new Date() })
        .where(eq(preventives.id, input.id));

      return { success: clientEmailSent };
    }),
});

// Template functions
function generatePreventiveEmailHTML(data: {
  preventiveNumber: string;
  clientName: string;
  projectName: string;
  totalAmount: number;
  itemsCount: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); color: #c9a227; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .total-row { display: flex; justify-content: space-between; padding: 15px; background: #0a0a0a; color: #c9a227; font-size: 18px; font-weight: bold; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎨 DECOR CARPI</h1>
          </div>
          <div class="content">
            <p>Caro ${data.clientName},</p>
            <p>Grazie per aver richiesto un preventivo! Allego il tuo preventivo personalizzato.</p>
            <div class="detail-row">
              <span>Numero Preventivo:</span>
              <span>#${String(data.preventiveNumber).padStart(3, "0")}</span>
            </div>
            <div class="detail-row">
              <span>Progetto:</span>
              <span>${data.projectName}</span>
            </div>
            <div class="detail-row">
              <span>Articoli:</span>
              <span>${data.itemsCount}</span>
            </div>
            <div class="total-row">
              <span>Importo Totalee:</span>
              <span>€${data.totalAmount.toFixed(2)}</span>
            </div>
            <p style="margin-top: 20px;">Per informazioni: <a href="tel:+393343600932">+39 334 360 0932</a> | <a href="mailto:decorcarpi@gmail.com">decorcarpi@gmail.com</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateOwnerNotificationHTML(data: {
  preventiveNumber: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  totalAmount: number;
  itemsCount: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #c9a227; color: #0a0a0a; padding: 20px; text-align: center; border-radius: 4px; }
          .content { background: #f9f9f9; padding: 20px; margin-top: 20px; }
          .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📊 Preventivo #${String(data.preventiveNumber).padStart(3, "0")} Trimis</h2>
          </div>
          <div class="content">
            <div class="detail-row">
              <strong>Cliente:</strong> ${data.clientName}
            </div>
            <div class="detail-row">
              <strong>Email:</strong> ${data.clientEmail}
            </div>
            <div class="detail-row">
              <strong>Progetto:</strong> ${data.projectName}
            </div>
            <div class="detail-row">
              <strong>Importo:</strong> €${data.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
