/**
 * tRPC Router pentru Audit Logs
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { auditLogs } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const auditLogsRouter = router({
  /**
   * Ottieni audit log con filtro
   */
  list: protectedProcedure
    .input(
      z.object({
        action: z.string().optional(),
        entityType: z.string().optional(),
        status: z.enum(["success", "failed", "pending"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Costruisci condizioni di filtro
        const conditions: any[] = [];
        if (input.action) conditions.push(eq(auditLogs.action, input.action));
        if (input.entityType) conditions.push(eq(auditLogs.entityType, input.entityType));
        if (input.status) conditions.push(eq(auditLogs.status, input.status));

        // Ottieni audit log con filtro
        let logs: any[] = [];
        if (conditions.length > 0) {
          logs = await (db.select().from(auditLogs).where(and(...conditions)) as any)
            .orderBy(desc(auditLogs.createdAt))
            .limit(input.limit)
            .offset(input.offset);
        } else {
          logs = await db.select().from(auditLogs)
            .orderBy(desc(auditLogs.createdAt))
            .limit(input.limit)
            .offset(input.offset);
        }

        return {
          success: true,
          logs,
          total: logs.length,
        };
      } catch (error) {
        console.error("[Audit] List error:", error);
        return {
          success: false,
          message: "Errore di connessione audit logs",
          logs: [],
        };
      }
    }),

  /**
   * Obține statistici audit logs
   */
  getStats: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const logs = await db.select().from(auditLogs);

      // Calcola statistiche
      const stats = {
        total: logs.length,
        byAction: {} as Record<string, number>,
        byEntityType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        lastActivity: logs.length > 0 ? logs[0].createdAt : null,
      };

      logs.forEach((log) => {
        if (log.action) stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
        if (log.entityType) stats.byEntityType[log.entityType] = (stats.byEntityType[log.entityType] || 0) + 1;
        if (log.status) stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
      });

      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error("[Audit] Stats error:", error);
      return {
        success: false,
        message: "Failed to get stats",
      };
    }
  }),

  /**
   * Obține audit logs pentru o entitate specifică
   */
  getByEntity: protectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string(),
      })
    )
    .query(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const logs = await db
          .select()
          .from(auditLogs)
          .where(eq(auditLogs.entityId, input.entityId))
          .orderBy(desc(auditLogs.createdAt));

        return {
          success: true,
          logs,
        };
      } catch (error) {
        console.error("[Audit] Get by entity error:", error);
        return {
          success: false,
          message: "Errore di connessione entity logs",
          logs: [],
        };
      }
    }),

  /**
   * Obține audit logs pentru un utilizator
   */
  getByUser: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const logs = await db
          .select()
          .from(auditLogs)
          .where(eq(auditLogs.userId, input.userId))
          .orderBy(desc(auditLogs.createdAt));

        return {
          success: true,
          logs,
        };
      } catch (error) {
        console.error("[Audit] Get by user error:", error);
        return {
          success: false,
          message: "Errore di connessione user logs",
          logs: [],
        };
      }
    }),

  /**
   * Obține audit logs recente
   */
  getRecent: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const logs = await db
          .select()
          .from(auditLogs)
          .orderBy(desc(auditLogs.createdAt))
          .limit(input.limit);

        return {
          success: true,
          logs,
        };
      } catch (error) {
        console.error("[Audit] Get recent error:", error);
        return {
          success: false,
          message: "Errore di connessione recent logs",
          logs: [],
        };
      }
    }),
});
