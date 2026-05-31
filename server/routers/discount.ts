import { router, publicProcedure } from "../_core/trpc";
import { eq } from "drizzle-orm";
import { getDb } from "../db";

// In-memory discount codes (în producție, ar trebui în baza de date)
const DISCOUNT_CODES: Record<string, { percentage: number; maxUses: number; usedCount: number; expiresAt?: Date }> = {
  "WELCOME10": { percentage: 10, maxUses: 100, usedCount: 0 },
  "SUMMER20": { percentage: 20, maxUses: 50, usedCount: 0 },
  "VIP30": { percentage: 30, maxUses: 10, usedCount: 0 },
};

export const discountRouter = router({
  // Validează și aplică discount code
  validate: publicProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return {
        code: String(obj.code || "").toUpperCase(),
        subtotal: Number(obj.subtotal || 0),
      };
    })
    .query(({ input }) => {
      const code = input.code.trim();
      const discount = DISCOUNT_CODES[code];

      if (!discount) {
        return {
          valid: false,
          message: "Codice sconto non valido",
          discountAmount: 0,
          finalPrice: input.subtotal,
        };
      }

      if (discount.usedCount >= discount.maxUses) {
        return {
          valid: false,
          message: "Codice sconto esaurito",
          discountAmount: 0,
          finalPrice: input.subtotal,
        };
      }

      if (discount.expiresAt && new Date() > discount.expiresAt) {
        return {
          valid: false,
          message: "Codice sconto scaduto",
          discountAmount: 0,
          finalPrice: input.subtotal,
        };
      }

      const discountAmount = (input.subtotal * discount.percentage) / 100;
      const finalPrice = input.subtotal - discountAmount;

      return {
        valid: true,
        message: `Sconto ${discount.percentage}% applicato`,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        percentage: discount.percentage,
      };
    }),

  // Applica discount code (incrementa usedCount)
  applyCode: publicProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return {
        code: String(obj.code || "").toUpperCase(),
      };
    })
    .mutation(({ input }) => {
      const code = input.code.trim();
      const discount = DISCOUNT_CODES[code];

      if (!discount || discount.usedCount >= discount.maxUses) {
        throw new Error("Codice sconto non valido o esaurito");
      }

      discount.usedCount += 1;

      return {
        success: true,
        message: "Sconto applicato con successo",
      };
    }),

  // Lista codici disponibili (solo per admin)
  list: publicProcedure.query(() => {
    return Object.entries(DISCOUNT_CODES).map(([code, discount]) => ({
      code,
      percentage: discount.percentage,
      maxUses: discount.maxUses,
      usedCount: discount.usedCount,
      remaining: discount.maxUses - discount.usedCount,
      expiresAt: discount.expiresAt?.toISOString() || null,
    }));
  }),
});
