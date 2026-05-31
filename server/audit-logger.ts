/**
 * Audit Logger - Logging pentru toate acțiunile admin și sistem
 */

import { getDb } from "./db";
import { auditLogs } from "../drizzle/schema";

export type AuditAction =
  | "contact_submitted"
  | "email_sent"
  | "email_failed"
  | "email_retry"
  | "push_sent"
  | "push_failed"
  | "admin_login"
  | "admin_action"
  | "preventivo_created"
  | "preventivo_updated"
  | "preventivo_deleted"
  | "subscription_created"
  | "subscription_deleted"
  | "system_error";

export type AuditEntityType =
  | "contact"
  | "email"
  | "push_notification"
  | "preventivo"
  | "user"
  | "admin"
  | "system";

export type AuditStatus = "success" | "failed" | "pending";

export interface AuditLogData {
  userId?: number;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  details?: Record<string, any>;
  status: AuditStatus;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Loghează o acțiune în audit trail
 */
export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Audit] Database not available");
      return;
    }

    await db.insert(auditLogs).values({
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      details: data.details ? JSON.stringify(data.details) : null,
      status: data.status,
      errorMessage: data.errorMessage,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      createdAt: new Date(),
    });

    console.log(`[Audit] ${data.action} - ${data.entityType} - ${data.status}`);
  } catch (error) {
    console.error("[Audit] Error logging action:", error);
  }
}

/**
 * Loghează contact form submission
 */
export async function logContactSubmission(
  data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  },
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    action: "contact_submitted",
    entityType: "contact",
    details: data,
    status: "success",
    ipAddress,
    userAgent,
  });
}

/**
 * Loghează trimitere email
 */
export async function logEmailSent(
  emailId: string,
  to: string,
  type: string,
  userId?: number
): Promise<void> {
  await logAudit({
    userId,
    action: "email_sent",
    entityType: "email",
    entityId: emailId,
    details: { to, type },
    status: "success",
  });
}

/**
 * Loghează email eșuat
 */
export async function logEmailFailed(
  emailId: string,
  to: string,
  error: string,
  userId?: number
): Promise<void> {
  await logAudit({
    userId,
    action: "email_failed",
    entityType: "email",
    entityId: emailId,
    details: { to },
    status: "failed",
    errorMessage: error,
  });
}

/**
 * Loghează retry email
 */
export async function logEmailRetry(
  emailId: string,
  to: string,
  retryCount: number,
  userId?: number
): Promise<void> {
  await logAudit({
    userId,
    action: "email_retry",
    entityType: "email",
    entityId: emailId,
    details: { to, retryCount },
    status: "pending",
  });
}

/**
 * Loghează push notification
 */
export async function logPushNotification(
  userId: number,
  type: string,
  title: string,
  success: boolean,
  error?: string
): Promise<void> {
  await logAudit({
    userId,
    action: success ? "push_sent" : "push_failed",
    entityType: "push_notification",
    details: { type, title },
    status: success ? "success" : "failed",
    errorMessage: error,
  });
}

/**
 * Loghează admin login
 */
export async function logAdminLogin(
  userId: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: "admin_login",
    entityType: "admin",
    status: "success",
    ipAddress,
    userAgent,
  });
}

/**
 * Loghează admin action
 */
export async function logAdminAction(
  userId: number,
  action: string,
  entityType: AuditEntityType,
  entityId?: string,
  details?: Record<string, any>
): Promise<void> {
  await logAudit({
    userId,
    action: "admin_action",
    entityType,
    entityId,
    details: { ...details, action },
    status: "success",
  });
}

/**
 * Loghează system error
 */
export async function logSystemError(
  error: Error,
  context?: Record<string, any>
): Promise<void> {
  await logAudit({
    action: "system_error",
    entityType: "system",
    details: { ...context, error: error.message, stack: error.stack },
    status: "failed",
    errorMessage: error.message,
  });
}

/**
 * Ottieni audit log con filtro
 */
export async function getAuditLogs(filters?: {
  userId?: number;
  action?: AuditAction;
  entityType?: AuditEntityType;
  status?: AuditStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Audit] Database not available");
      return [];
    }

    let query = db.select().from(auditLogs);

    // DA FARE: Aggiungi filtro se fornito

    const limit = filters?.limit || 100;
    const logs = await query.limit(limit);

    return logs;
  } catch (error) {
    console.error("[Audit] Error fetching logs:", error);
    return [];
  }
}
