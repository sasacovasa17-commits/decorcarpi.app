/**
 * tRPC Router pentru Exportare Email-uri
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { emails } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { exportEmailsToCSV, exportEmailsToExcel, generateEmailStats, generateEmailReport } from "./export-utils";

export const exportRouter = router({
  /**
   * Exportă email-uri în format CSV
   */
  toCSV: protectedProcedure
    .input(
      z.object({
        type: z.enum(["contact", "preventivo", "confirmation", "admin_notification"]).optional(),
        status: z.enum(["sent", "failed", "pending", "retry"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Costruisci query con filtro
        const conditions = [];
        if (input.type) {
          conditions.push(eq(emails.type, input.type));
        }
        if (input.status) {
          conditions.push(eq(emails.status, input.status));
        }
        if (input.startDate) {
          conditions.push(gte(emails.createdAt, input.startDate));
        }
        if (input.endDate) {
          conditions.push(lte(emails.createdAt, input.endDate));
        }

        let emailList;
        if (conditions.length > 0) {
          emailList = await db.select().from(emails).where(and(...conditions));
        } else {
          emailList = await db.select().from(emails);
        }

        // Esporta in CSV
        const csv = exportEmailsToCSV(emailList);

        // Genera nome file
        const now = new Date().toISOString().split("T")[0];
        const filename = `emails_${now}.csv`;

        return {
          success: true,
          filename,
          content: csv,
          mimeType: "text/csv",
          size: csv.length,
        };
      } catch (error) {
        console.error("[Export] CSV error:", error);
        return {
          success: false,
          message: "Failed to export to CSV",
        };
      }
    }),

  /**
   * Exportă email-uri în format Excel
   */
  toExcel: protectedProcedure
    .input(
      z.object({
        type: z.enum(["contact", "preventivo", "confirmation", "admin_notification"]).optional(),
        status: z.enum(["sent", "failed", "pending", "retry"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Costruisci query con filtro
        const conditions = [];
        if (input.type) {
          conditions.push(eq(emails.type, input.type));
        }
        if (input.status) {
          conditions.push(eq(emails.status, input.status));
        }
        if (input.startDate) {
          conditions.push(gte(emails.createdAt, input.startDate));
        }
        if (input.endDate) {
          conditions.push(lte(emails.createdAt, input.endDate));
        }

        let emailList;
        if (conditions.length > 0) {
          emailList = await db.select().from(emails).where(and(...conditions));
        } else {
          emailList = await db.select().from(emails);
        }

        // Esporta in Excel
        const buffer = await exportEmailsToExcel(emailList);

        // Genera nome file
        const now = new Date().toISOString().split("T")[0];
        const filename = `emails_${now}.xlsx`;

        return {
          success: true,
          filename,
          content: buffer.toString("base64"),
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          size: buffer.length,
        };
      } catch (error) {
        console.error("[Export] Excel error:", error);
        return {
          success: false,
          message: "Failed to export to Excel",
        };
      }
    }),

  /**
   * Obține statistici email-uri
   */
  getStats: protectedProcedure
    .input(
      z.object({
        type: z.enum(["contact", "preventivo", "confirmation", "admin_notification"]).optional(),
        status: z.enum(["sent", "failed", "pending", "retry"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Costruisci query con filtro
        const conditions = [];
        if (input.type) {
          conditions.push(eq(emails.type, input.type));
        }
        if (input.status) {
          conditions.push(eq(emails.status, input.status));
        }
        if (input.startDate) {
          conditions.push(gte(emails.createdAt, input.startDate));
        }
        if (input.endDate) {
          conditions.push(lte(emails.createdAt, input.endDate));
        }

        let emailList;
        if (conditions.length > 0) {
          emailList = await db.select().from(emails).where(and(...conditions));
        } else {
          emailList = await db.select().from(emails);
        }

        // Genera statistiche
        const stats = generateEmailStats(emailList);

        return {
          success: true,
          stats,
        };
      } catch (error) {
        console.error("[Export] Stats error:", error);
        return {
          success: false,
          message: "Failed to get stats",
        };
      }
    }),

  /**
   * Genera rapporto email-uri
   */
  getReport: protectedProcedure
    .input(
      z.object({
        type: z.enum(["contact", "preventivo", "confirmation", "admin_notification"]).optional(),
        status: z.enum(["sent", "failed", "pending", "retry"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Costruisci query con filtro
        const conditions = [];
        if (input.type) {
          conditions.push(eq(emails.type, input.type));
        }
        if (input.status) {
          conditions.push(eq(emails.status, input.status));
        }
        if (input.startDate) {
          conditions.push(gte(emails.createdAt, input.startDate));
        }
        if (input.endDate) {
          conditions.push(lte(emails.createdAt, input.endDate));
        }

        let emailList;
        if (conditions.length > 0) {
          emailList = await db.select().from(emails).where(and(...conditions));
        } else {
          emailList = await db.select().from(emails);
        }

        // Genera rapporto
        const report = generateEmailReport(emailList);

        return {
          success: true,
          report,
        };
      } catch (error) {
        console.error("[Export] Report error:", error);
        return {
          success: false,
          message: "Failed to generate report",
        };
      }
    }),
});
