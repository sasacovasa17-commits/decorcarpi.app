import { eq, desc, and, gte, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, aiUsage, InsertAiUsage, promoCodes, sessionPromoCodes, InsertPromoCode, InsertSessionPromoCode, sessionUsage } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ── AI Usage Logging ────────────────────────────────────────────────────────
export async function logAiUsage(data: InsertAiUsage): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log AI usage: database not available");
    return;
  }

  try {
    await db.insert(aiUsage).values(data);
  } catch (error) {
    console.error("[Database] Failed to log AI usage:", error);
  }
}

// Get AI usage statistics for admin dashboard
export async function getAiUsageStats(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get AI usage stats: database not available");
    return { total: 0, byModel: {}, daily: [] };
  }

  try {
    // Get all usage in date range
    const usage = await db
      .select()
      .from(aiUsage)
      .where(
        and(
          gte(aiUsage.createdAt, startDate),
          lt(aiUsage.createdAt, endDate)
        )
      )
      .orderBy(desc(aiUsage.createdAt));

    // Calculate totals
    const totalCost = usage.reduce((sum, u) => sum + (u.costEstimated || 0), 0);
    const byModel: Record<string, { count: number; cost: number }> = {};
    const dailyMap: Record<string, number> = {};

    usage.forEach((u) => {
      // By model
      if (!byModel[u.modelUsed]) {
        byModel[u.modelUsed] = { count: 0, cost: 0 };
      }
      byModel[u.modelUsed].count += 1;
      byModel[u.modelUsed].cost += u.costEstimated || 0;

      // Daily
      const day = u.createdAt.toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + (u.costEstimated || 0);
    });

    const daily = Object.entries(dailyMap)
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total: totalCost,
      count: usage.length,
      byModel,
      daily,
    };
  } catch (error) {
    console.error("[Database] Failed to get AI usage stats:", error);
    return { total: 0, count: 0, byModel: {}, daily: [] };
  }
}

// Get recent AI usage logs
export async function getRecentAiUsage(limit: number = 20) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get recent AI usage: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(aiUsage)
      .orderBy(desc(aiUsage.createdAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get recent AI usage:", error);
    return [];
  }
}

// DA FARE: add feature queries here as your schema grows.

// ─── Promo Code Functions ───────────────────────────────────────────────────────

// Validare și aplicare cod promo pe sesiune
export async function applyPromoCode(sessionId: string, code: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot apply promo code: database not available");
    return { success: false, error: "Database not available" };
  }

  try {
    // Cauta codul
    const promoCodeRecord = await db
      .select()
      .from(promoCodes)
      .where(and(eq(promoCodes.code, code), eq(promoCodes.isActive, true)))
      .limit(1);

    if (promoCodeRecord.length === 0) {
      return { success: false, error: "Cod invalid sau inactiv" };
    }

    const promo = promoCodeRecord[0];

    // Verifica expirare
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return { success: false, error: "Cod expirat" };
    }

    // Verifica daca codul a fost deja aplicat pe aceasta sesiune
    const existingSession = await db
      .select()
      .from(sessionPromoCodes)
      .where(and(
        eq(sessionPromoCodes.sessionId, sessionId),
        eq(sessionPromoCodes.promoCodeId, promo.id)
      ))
      .limit(1);

    if (existingSession.length > 0) {
      return { success: false, error: "Cod deja aplicat pe aceasta sesiune" };
    }

    // Aplica codul pe sesiune
    await db.insert(sessionPromoCodes).values({
      sessionId,
      promoCodeId: promo.id,
      generationsRemaining: promo.generationsLimit,
    });

    console.log('[PROMO DEBUG] Cod aplicat cu succes:', {
      code: promo.code,
      generationsLimit: promo.generationsLimit,
      sessionId,
      isUnlimited: promo.generationsLimit === -1,
    });
    
    return {
      success: true,
      generationsRemaining: promo.generationsLimit,
      isUnlimited: promo.generationsLimit === -1,
    };
  } catch (error) {
    console.error("[Database] Failed to apply promo code:", error);
    return { success: false, error: "Eroare la aplicare cod" };
  }
}

// Obtin generări rămase pentru o sesiune
export async function getSessionGenerationsRemaining(sessionId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get session generations: database not available");
    return { freeGenerations: 999, promoGenerations: 0, isUnlimited: true };
  }

  try {
    // UNLIMITED GENERATIONS FOR ALL USERS - NO LIMITS
    // Returnez unlimited pentru toți utilizatorii
    return {
      freeGenerations: 999,
      promoGenerations: 0,
      isUnlimited: true,
      totalRemaining: 999,
    };
  } catch (error) {
    console.error("[Database] Failed to get session generations:", error);
    return { freeGenerations: 999, promoGenerations: 0, isUnlimited: true };
  }
}

// Decrement generări rămase după o generare
export async function decrementSessionGenerations(sessionId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot decrement generations: database not available");
    return;
  }

  try {
    // Incrementez utilizarea sesiunii
    const existing = await db
      .select()
      .from(sessionUsage)
      .where(eq(sessionUsage.sessionId, sessionId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(sessionUsage)
        .set({ generationsUsed: existing[0].generationsUsed + 1 })
        .where(eq(sessionUsage.sessionId, sessionId));
    } else {
      await db.insert(sessionUsage).values({
        sessionId,
        generationsUsed: 1,
      });
    }

    // Decrement generări din codurile promo
    const promoCodesApplied = await db
      .select()
      .from(sessionPromoCodes)
      .where(eq(sessionPromoCodes.sessionId, sessionId));

    for (const sessionPromo of promoCodesApplied) {
      if (sessionPromo.generationsRemaining > 0) {
        await db
          .update(sessionPromoCodes)
          .set({ generationsRemaining: sessionPromo.generationsRemaining - 1 })
          .where(eq(sessionPromoCodes.id, sessionPromo.id));
        break; // Decrement doar din primul cod cu generări disponibile
      }
    }
  } catch (error) {
    console.error("[Database] Failed to decrement generations:", error);
  }
}

// Creez cod promo (admin)
export async function createPromoCode(data: InsertPromoCode) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create promo code: database not available");
    return null;
  }

  try {
    const result = await db.insert(promoCodes).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create promo code:", error);
    return null;
  }
}

// Obtin toate codurile promo (admin)
export async function getAllPromoCodes() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get promo codes: database not available");
    return [];
  }

  try {
    const codes = await db
      .select()
      .from(promoCodes)
      .orderBy(desc(promoCodes.createdAt));
    return codes;
  } catch (error) {
    console.error("[Database] Failed to get promo codes:", error);
    return [];
  }
}

// Dezactiveaza cod promo (admin)
export async function deactivatePromoCode(codeId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot deactivate promo code: database not available");
    return false;
  }

  try {
    await db
      .update(promoCodes)
      .set({ isActive: false })
      .where(eq(promoCodes.id, codeId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to deactivate promo code:", error);
    return false;
  }
}
