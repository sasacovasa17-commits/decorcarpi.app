/**
 * Email Database Helpers
 * Funcții pentru salvare și gestionare email-uri în baza de date
 */

import { getDb } from "./db";
import { emails, type InsertEmail, type Email } from "../drizzle/schema";
import { eq, desc, and, or, sql } from "drizzle-orm";

/**
 * Salvare email trimis în baza de date
 */
const getDbInstance = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
};

export async function saveEmailLog(data: {
  to: string;
  from?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  type: "contact" | "preventivo" | "confirmation" | "admin_notification";
  clientName?: string;
  clientEmail?: string;
  preventiveType?: string;
  status?: "sent" | "failed" | "pending" | "retry";
  lastError?: string;
}): Promise<Email> {
  const id = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const db = await getDbInstance();

  const result = await db.insert(emails).values({
    id,
    to: data.to,
    from: data.from || "contact@decorcarpi.it",
    subject: data.subject,
    htmlContent: data.htmlContent,
    textContent: data.textContent,
    type: data.type,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    preventiveType: data.preventiveType,
    status: data.status || "sent",
    lastError: data.lastError,
    retryCount: 0,
    sentAt: new Date(),
  });

  return {
    id,
    to: data.to,
    from: data.from || "contact@decorcarpi.it",
    subject: data.subject,
    htmlContent: data.htmlContent,
    textContent: data.textContent,
    type: data.type,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    preventiveType: data.preventiveType,
    status: data.status || "sent",
    lastError: data.lastError,
    retryCount: 0,
    sentAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Email;
}

/**
 * Obținere email-uri cu filtrare
 */
export async function getEmails(options?: {
  type?: "contact" | "preventivo" | "confirmation" | "admin_notification";
  status?: "sent" | "failed" | "pending" | "retry";
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<Email[]> {
  const db = await getDbInstance();
  let query = db.select().from(emails);

  const conditions = [];

  if (options?.type) {
    conditions.push(eq(emails.type, options.type));
  }

  if (options?.status) {
    conditions.push(eq(emails.status, options.status));
  }

  if (options?.search) {
    const searchPattern = `%${options.search}%`;
    conditions.push(
      or(
        sql`${emails.subject} LIKE ${searchPattern}`,
        sql`${emails.to} LIKE ${searchPattern}`,
        sql`${emails.clientName} LIKE ${searchPattern}`,
        sql`${emails.clientEmail} LIKE ${searchPattern}`
      )
    );
  }

  let finalQuery: any = query;

  if (conditions.length > 0) {
    finalQuery = finalQuery.where(and(...conditions));
  }

  finalQuery = finalQuery.orderBy(desc(emails.createdAt));

  if (options?.limit) {
    finalQuery = finalQuery.limit(options.limit);
  }

  if (options?.offset) {
    finalQuery = finalQuery.offset(options.offset);
  }

  return finalQuery;
}

/**
 * Obținere email după ID
 */
export async function getEmailById(id: string): Promise<Email | null> {
  const db = await getDbInstance();
  const result = await db.select().from(emails).where(eq(emails.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Actualizare status email
 */
export async function updateEmailStatus(
  id: string,
  status: "sent" | "failed" | "pending" | "retry",
  error?: string
): Promise<void> {
  const db = await getDbInstance();
  await db
    .update(emails)
    .set({
      status,
      lastError: error,
      sentAt: status === "sent" ? new Date() : undefined,
    })
    .where(eq(emails.id, id));
}

/**
 * Retry email eșuat
 */
export async function retryFailedEmail(id: string): Promise<void> {
  const email = await getEmailById(id);
  if (!email) throw new Error("Email not found");

  const db = await getDbInstance();
  await db
    .update(emails)
    .set({
      status: "retry",
      retryCount: email.retryCount + 1,
      lastError: null,
    })
    .where(eq(emails.id, id));
}

/**
 * Obținere statistici email-uri
 */
export async function getEmailStats(): Promise<{
  total: number;
  sent: number;
  failed: number;
  pending: number;
  byType: Record<string, number>;
}> {
  const db = await getDbInstance();
  const allEmails = await db.select().from(emails);

  const stats = {
    total: allEmails.length,
    sent: allEmails.filter((e: Email) => e.status === "sent").length,
    failed: allEmails.filter((e: Email) => e.status === "failed").length,
    pending: allEmails.filter((e: Email) => e.status === "pending").length,
    byType: {
      contact: allEmails.filter((e: Email) => e.type === "contact").length,
      preventivo: allEmails.filter((e: Email) => e.type === "preventivo").length,
      confirmation: allEmails.filter((e: Email) => e.type === "confirmation").length,
      admin_notification: allEmails.filter((e: Email) => e.type === "admin_notification").length,
    },
  };

  return stats;
}

/**
 * Ștergere email-uri vechi (mai vechi de N zile)
 */
export async function deleteOldEmails(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const db = await getDbInstance();
  const result = await db
    .delete(emails)
    .where(sql`${emails.createdAt} < ${cutoffDate}`);

  return 0; // Drizzle delete doesn't return rowsAffected in all drivers
}
