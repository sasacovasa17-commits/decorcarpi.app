/**
 * Utilități pentru exportare email-uri în CSV și Excel
 */

import { Email } from "../drizzle/schema";

/**
 * Formatează data în format ISO
 */
function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

/**
 * Escapează valori CSV
 */
function escapeCSV(value: string | null | undefined): string {
  if (!value) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exportă email-uri în format CSV
 */
export function exportEmailsToCSV(emails: Email[]): string {
  // Header
  const headers = [
    "ID",
    "To",
    "From",
    "Subject",
    "Type",
    "Status",
    "Client Name",
    "Client Email",
    "Preventive Type",
    "Retry Count",
    "Created At",
    "Sent At",
  ];

  const rows = emails.map((email) => [
    escapeCSV(email.id),
    escapeCSV(email.to),
    escapeCSV(email.from),
    escapeCSV(email.subject),
    escapeCSV(email.type),
    escapeCSV(email.status),
    escapeCSV(email.clientName),
    escapeCSV(email.clientEmail),
    escapeCSV(email.preventiveType),
    String(email.retryCount || 0),
    formatDate(email.createdAt),
    formatDate(email.sentAt),
  ]);

  // Combina headers și rows
  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  return csv;
}

/**
 * Exportă email-uri în format Excel (XLSX)
 * Returnează buffer-ul fișierului Excel
 */
export async function exportEmailsToExcel(emails: Email[]): Promise<Buffer> {
  // Importă ExcelJS dinamic
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Emails");

  // Definește coloane
  worksheet.columns = [
    { header: "ID", key: "id", width: 15 },
    { header: "To", key: "to", width: 25 },
    { header: "From", key: "from", width: 25 },
    { header: "Subject", key: "subject", width: 30 },
    { header: "Type", key: "type", width: 15 },
    { header: "Status", key: "status", width: 12 },
    { header: "Client Name", key: "clientName", width: 20 },
    { header: "Client Email", key: "clientEmail", width: 25 },
    { header: "Preventive Type", key: "preventiveType", width: 20 },
    { header: "Retry Count", key: "retryCount", width: 12 },
    { header: "Created At", key: "createdAt", width: 15 },
    { header: "Sent At", key: "sentAt", width: 15 },
  ];

  // Formatează header row
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };

  // Adaugă date
  emails.forEach((email) => {
    worksheet.addRow({
      id: email.id,
      to: email.to,
      from: email.from,
      subject: email.subject,
      type: email.type,
      status: email.status,
      clientName: email.clientName,
      clientEmail: email.clientEmail,
      preventiveType: email.preventiveType,
      retryCount: email.retryCount || 0,
      createdAt: formatDate(email.createdAt),
      sentAt: formatDate(email.sentAt),
    });
  });

  // Generează buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
}

/**
 * Genera statistiche email-uri
 */
export function generateEmailStats(emails: Email[]): {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  retry: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
} {
  const stats = {
    total: emails.length,
    sent: 0,
    failed: 0,
    pending: 0,
    retry: 0,
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  };

  emails.forEach((email) => {
    // Conta per stato
    if (email.status === "sent") stats.sent++;
    if (email.status === "failed") stats.failed++;
    if (email.status === "pending") stats.pending++;
    if (email.status === "retry") stats.retry++;

    // Conta per tipo
    stats.byType[email.type] = (stats.byType[email.type] || 0) + 1;

    // Conta per stato
    stats.byStatus[email.status] = (stats.byStatus[email.status] || 0) + 1;
  });

  return stats;
}

/**
 * Genera rapporto email-uri
 */
export function generateEmailReport(emails: Email[]): string {
  const stats = generateEmailStats(emails);

  const report = `
═══════════════════════════════════════════════════════════════
                    EMAIL REPORT
═══════════════════════════════════════════════════════════════

Generated: ${new Date().toISOString()}

SUMMARY
───────────────────────────────────────────────────────────────
Totale Emails:       ${stats.total}
Sent:               ${stats.sent}
Failed:             ${stats.failed}
Pending:            ${stats.pending}
Retry:              ${stats.retry}

BY TYPE
───────────────────────────────────────────────────────────────
${Object.entries(stats.byType)
  .map(([type, count]) => `${type.padEnd(20)}: ${count}`)
  .join("\n")}

BY STATUS
───────────────────────────────────────────────────────────────
${Object.entries(stats.byStatus)
  .map(([status, count]) => `${status.padEnd(20)}: ${count}`)
  .join("\n")}

═══════════════════════════════════════════════════════════════
  `;

  return report;
}
