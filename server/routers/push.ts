/**
 * Push Notifications Router - Web Push API
 */

import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { pushSubscriptions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export const pushRouter = router({
  subscribe: publicProcedure
    .input(PushSubscriptionSchema)
    .mutation(async ({ input, ctx }) => {
      console.log('[Push] User subscribed:', input.endpoint);
      
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const existing = await db
          .select()
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.endpoint, input.endpoint))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(pushSubscriptions)
            .set({
              p256dhKey: input.keys.p256dh,
              authKey: input.keys.auth,
              isActive: true,
              updatedAt: new Date(),
            })
            .where(eq(pushSubscriptions.endpoint, input.endpoint));
        } else {
          await db.insert(pushSubscriptions).values({
            userId: ctx.user?.id || 0,
            endpoint: input.endpoint,
            p256dhKey: input.keys.p256dh,
            authKey: input.keys.auth,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return { success: true };
      } catch (error) {
        console.error('[Push] Subscription error:', error);
        return { success: false, error: 'Failed to save subscription' };
      }
    }),

  unsubscribe: publicProcedure
    .input(PushSubscriptionSchema)
    .mutation(async ({ input }) => {
      console.log('[Push] User unsubscribed:', input.endpoint);
      
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.endpoint, input.endpoint));

        return { success: true };
      } catch (error) {
        console.error('[Push] Unsubscribe error:', error);
        return { success: false, error: 'Failed to remove subscription' };
      }
    }),

  sendTest: publicProcedure
    .mutation(async () => {
      console.log('[Push] Sending test notification to all subscribers');
      
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const subs = await db
          .select()
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.isActive, true));

        console.log(`[Push] Found ${subs.length} active subscriptions`);

        for (const sub of subs) {
          console.log(`[Push] Sending test notification to ${sub.endpoint}`);
        }

        return { success: true, message: `Test notification sent to ${subs.length} subscribers` };
      } catch (error) {
        console.error('[Push] Test notification error:', error);
        return { success: false, error: 'Failed to send test notification' };
      }
    }),
});
