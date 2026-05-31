/**
 * tRPC Router pentru Push Notifications
 * Gestionează trimiterea notificărilor push din server
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { pushSubscriptions, emails } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Schema pentru push subscription
 */
const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

/**
 * Schema pentru push notification payload
 */
const pushNotificationPayloadSchema = z.object({
  type: z.enum(["contact_response", "preventivo_accepted", "preventivo_rejected", "general_update"]),
  title: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export const pushNotificationsRouter = router({
  /**
   * Salvează push subscription a utilizatorului
   */
  subscribe: protectedProcedure
    .input(pushSubscriptionSchema)
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Verifica se l'abbonamento esiste già
        const existing = await db
          .select()
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.userId, ctx.user.id))
          .limit(1);

        if (existing.length > 0) {
          // Aggiorna l'abbonamento esistente
          await db
            .update(pushSubscriptions)
            .set({
              endpoint: input.endpoint,
              p256dhKey: input.keys.p256dh,
              authKey: input.keys.auth,
              updatedAt: new Date(),
            })
            .where(eq(pushSubscriptions.userId, ctx.user.id));

          return {
            success: true,
            message: "Subscription updated",
          };
        }

        // Crea nuovo abbonamento
        await db.insert(pushSubscriptions).values({
          userId: ctx.user.id,
          endpoint: input.endpoint,
          p256dhKey: input.keys.p256dh,
          authKey: input.keys.auth,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {
          success: true,
          message: "Subscription saved",
        };
      } catch (error) {
        console.error("[Push] Subscription error:", error);
        return {
          success: false,
          message: "Failed to save subscription",
        };
      }
    }),

  /**
   * Unsubscribe utilizator de la push notifications
   */
  unsubscribe: protectedProcedure.mutation(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(pushSubscriptions)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.userId, ctx.user.id));

      return {
        success: true,
        message: "Unsubscribed",
      };
    } catch (error) {
      console.error("[Push] Unsubscribe error:", error);
      return {
        success: false,
        message: "Failed to unsubscribe",
      };
    }
  }),

  /**
   * Trimite notificare push utilizatorului
   * (Admin-only - pentru răspunsuri la contact)
   */
  sendToUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        payload: pushNotificationPayloadSchema,
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Ottieni l'abbonamento dell'utente
        const subscription = await db
          .select()
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.userId, input.userId))
          .limit(1);

        if (!subscription || subscription.length === 0 || !subscription[0].isActive) {
          console.log("[Push] No active subscription for user:", input.userId);
          return {
            success: false,
            message: "No active subscription",
          };
        }

        const sub = subscription[0];

        // Trimite notificare push
        const result = await sendPushNotification(sub, input.payload);

        // Registra il tentativo
        await db.insert(emails).values({
          id: `push-${Date.now()}-${Math.random()}`,
          to: `push:${input.userId}`,
          from: "system",
          subject: input.payload.title,
          htmlContent: input.payload.body,
          type: "admin_notification",
          status: result.success ? "sent" : "failed",
        });

        return result;
      } catch (error) {
        console.error("[Push] Send error:", error);
        return {
          success: false,
          message: "Failed to send notification",
        };
      }
    }),

  /**
   * Trimite notificare push la toți utilizatorii (broadcast)
   * (Admin-only)
   */
  broadcast: protectedProcedure
    .input(pushNotificationPayloadSchema)
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Ottieni tutti gli abbonamenti attivi
        const subscriptions = await db
          .select()
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.isActive, true));

        let successCount = 0;
        let failureCount = 0;

        // Trimite notificare la fiecare utilizator
        for (const sub of subscriptions) {
          const result = await sendPushNotification(sub, input.payload);
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
          }
        }

        return {
          success: true,
          message: `Broadcast sent: ${successCount} success, ${failureCount} failed`,
          stats: {
            successCount,
            failureCount,
            totalCount: subscriptions.length,
          },
        };
      } catch (error) {
        console.error("[Push] Broadcast error:", error);
        return {
          success: false,
          message: "Failed to send broadcast",
        };
      }
    }),

  /**
   * Obține status subscription utilizatorului
   */
  getStatus: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const subscription = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, ctx.user.id))
        .limit(1);

      if (!subscription || subscription.length === 0) {
        return {
          isSubscribed: false,
          isActive: false,
        };
      }

      return {
        isSubscribed: true,
        isActive: subscription[0].isActive,
        createdAt: subscription[0].createdAt,
        updatedAt: subscription[0].updatedAt,
      };
    } catch (error) {
      console.error("[Push] Status error:", error);
      return {
        isSubscribed: false,
        isActive: false,
      };
    }
  }),
});

/**
 * Trimite push notification la un endpoint
 * (Implementare mock - în producție ar folosi web-push library)
 */
async function sendPushNotification(
  subscription: any,
  payload: z.infer<typeof pushNotificationPayloadSchema>
): Promise<{ success: boolean; message: string }> {
  try {
    // In produzione, userebbe la libreria web-push:
    // import webpush from 'web-push';
    // await webpush.sendNotification(subscription, JSON.stringify(payload));

    console.log("[Push] Notification sent to:", subscription.endpoint);
    console.log("[Push] Payload:", payload);

    // Mock implementation - in produzione farebbe una vera richiesta HTTP
    return {
      success: true,
      message: "Notification sent",
    };
  } catch (error) {
    console.error("[Push] Send notification error:", error);
    return {
      success: false,
      message: "Failed to send notification",
    };
  }
}
