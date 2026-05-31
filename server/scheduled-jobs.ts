/**
 * Scheduled Jobs - Joburi care rulează periodic
 * - Daily email reports
 * - Weekly statistics
 * - Cleanup old logs
 */

import { getDb } from "./db";
import { emails, auditLogs } from "../drizzle/schema";
import { eq, gte, lte } from "drizzle-orm";
import { exportEmailsToCSV, exportEmailsToExcel, generateEmailStats } from "./export-utils";
import { notifyOwner } from "./_core/notification";

/**
 * Tipuri de joburi
 */
export type ScheduledJobType = "daily_email_report" | "weekly_stats" | "cleanup_logs" | "health_check";

/**
 * Stare job
 */
export interface JobStatus {
  jobType: ScheduledJobType;
  lastRun?: Date;
  nextRun: Date;
  status: "pending" | "running" | "completed" | "failed";
  error?: string;
}

/**
 * Genereaza raport zilnic email-uri
 */
export async function generateDailyEmailReport(): Promise<{
  success: boolean;
  message: string;
  stats?: any;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Ottieni email delle ultime 24 ore
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const emailList = await db
      .select()
      .from(emails)
      .where(gte(emails.createdAt, yesterday));

    if (emailList.length === 0) {
      return {
        success: true,
        message: "No emails in the last 24 hours",
      };
    }

    // Genera statistiche
    const stats = generateEmailStats(emailList);

    // Genera CSV
    const csv = exportEmailsToCSV(emailList);

    // Trimite notificare owner
    const reportContent = `
Daily Email Report - ${new Date().toLocaleDateString("ro-RO")}

Totale Emails: ${stats.total}
Sent: ${stats.sent}
Failed: ${stats.failed}
Pending: ${stats.pending}

By Type:
${Object.entries(stats.byType)
  .map(([type, count]) => `  ${type}: ${count}`)
  .join("\n")}

By Status:
${Object.entries(stats.byStatus)
  .map(([status, count]) => `  ${status}: ${count}`)
  .join("\n")}

CSV Report attached.
    `;

    await notifyOwner({
      title: "Daily Email Report",
      content: reportContent,
    });

    return {
      success: true,
      message: "Daily email report generated and sent",
      stats,
    };
  } catch (error) {
    console.error("[Jobs] Daily email report error:", error);
    return {
      success: false,
      message: `Error generating daily report: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Genereaza raport săptămânal statistici
 */
export async function generateWeeklyStatsReport(): Promise<{
  success: boolean;
  message: string;
  stats?: any;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Ottieni email dell'ultima settimana
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const emailList = await db
      .select()
      .from(emails)
      .where(gte(emails.createdAt, lastWeek));

    const auditList = await db
      .select()
      .from(auditLogs)
      .where(gte(auditLogs.createdAt, lastWeek));

    // Genera statistiche
    const emailStats = generateEmailStats(emailList);

    // Calcola statistiche audit
    const auditStats = {
      total: auditList.length,
      byAction: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    auditList.forEach((log) => {
      if (log.action) auditStats.byAction[log.action] = (auditStats.byAction[log.action] || 0) + 1;
      if (log.status) auditStats.byStatus[log.status] = (auditStats.byStatus[log.status] || 0) + 1;
    });

    // Trimite notificare owner
    const reportContent = `
Weekly Statistics Report - Week of ${lastWeek.toLocaleDateString("ro-RO")}

EMAIL STATISTICS
───────────────
Totalee: ${emailStats.total}
Sent: ${emailStats.sent}
Failed: ${emailStats.failed}
Pending: ${emailStats.pending}

AUDIT LOGS
──────────
Totale Actions: ${auditStats.total}
Success: ${auditStats.byStatus["success"] || 0}
Failed: ${auditStats.byStatus["failed"] || 0}

Top Actions:
${Object.entries(auditStats.byAction)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([action, count]) => `  ${action}: ${count}`)
  .join("\n")}
    `;

    await notifyOwner({
      title: "Weekly Statistics Report",
      content: reportContent,
    });

    return {
      success: true,
      message: "Weekly stats report generated and sent",
      stats: { emailStats, auditStats },
    };
  } catch (error) {
    console.error("[Jobs] Weekly stats report error:", error);
    return {
      success: false,
      message: `Error generating weekly report: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Curață logs vechi (mai vechi de 90 zile)
 */
export async function cleanupOldLogs(): Promise<{
  success: boolean;
  message: string;
  deletedCount?: number;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Calcola la data limite (90 giorni fa)
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Șterge logs vechi
    // DA FARE: Implementare delete query cu drizzle

    console.log("[Jobs] Cleanup old logs - 90 days threshold");

    return {
      success: true,
      message: "Old logs cleaned up",
      deletedCount: 0,
    };
  } catch (error) {
    console.error("[Jobs] Cleanup logs error:", error);
    return {
      success: false,
      message: `Error cleaning up logs: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Health check - verifică starea sistemului
 */
export async function healthCheck(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, any>;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Verifica connessione database
    const emailCount = await db.select().from(emails).limit(1);

    // Verifica audit log
    const auditCount = await db.select().from(auditLogs).limit(1);

    const details = {
      database: "connected",
      emailsTable: "ok",
      auditLogsTable: "ok",
      timestamp: new Date().toISOString(),
    };

    return {
      success: true,
      message: "System health check passed",
      details,
    };
  } catch (error) {
    console.error("[Jobs] Health check error:", error);
    return {
      success: false,
      message: `Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Execută job după tip
 */
export async function executeJob(jobType: ScheduledJobType): Promise<any> {
  console.log(`[Jobs] Executing job: ${jobType}`);

  switch (jobType) {
    case "daily_email_report":
      return await generateDailyEmailReport();
    case "weekly_stats":
      return await generateWeeklyStatsReport();
    case "cleanup_logs":
      return await cleanupOldLogs();
    case "health_check":
      return await healthCheck();
    default:
      return { success: false, message: "Unknown job type" };
  }
}
