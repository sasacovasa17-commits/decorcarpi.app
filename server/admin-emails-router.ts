/**
 * Admin Emails Router
 * tRPC procedures pentru gestionare email-uri
 */

import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "./_core/trpc";
import {
  getEmails,
  getEmailById,
  updateEmailStatus,
  retryFailedEmail,
  getEmailStats,
} from "./email-db";

export const adminEmailsRouter = router({
  /**
   * Obținere lista email-uri cu filtrare
   */
  list: adminProcedure
    .input(
      z.object({
        type: z.enum(["contact", "preventivo", "confirmation", "admin_notification"]).optional(),
        status: z.enum(["sent", "failed", "pending", "retry"]).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }: any) => {
      return getEmails({
        type: input.type,
        status: input.status,
        search: input.search,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  /**
   * Obținere email după ID
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }: any) => {
      const email = await getEmailById(input.id);
      if (!email) throw new Error("Email not found");
      return email;
    }),

  /**
   * Actualizare status email
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["sent", "failed", "pending", "retry"]),
        error: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      await updateEmailStatus(input.id, input.status, input.error);
      return { success: true };
    }),

  /**
   * Retry email eșuat
   */
  retry: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }: any) => {
      await retryFailedEmail(input.id);
      return { success: true };
    }),

  /**
   * Obținere statistici email-uri
   */
  stats: adminProcedure.query(async () => {
    return getEmailStats();
  }),

  /**
   * Filtrare email-uri după dată
   */
  listByDate: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        type: z.enum(["contact", "preventivo", "confirmation", "admin_notification"]).optional(),
      })
    )
    .query(async ({ input }: any) => {
      // Recupera email e filtra per data
      const allEmails = await getEmails({ type: input.type, limit: 1000 });

      return allEmails.filter((email) => {
        const createdAt = new Date(email.createdAt);
        return createdAt >= input.startDate && createdAt <= input.endDate;
      });
    }),
});
