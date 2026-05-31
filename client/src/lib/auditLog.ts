/**
 * Audit Log - Logging Operații Sensibile
 * Înregistrează: Export, Import, Delete, Login, Logout, etc.
 */

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT_BACKUP'
  | 'IMPORT_BACKUP'
  | 'DELETE_DATA'
  | 'CREATE_USER'
  | 'DELETE_USER'
  | 'UPDATE_USER'
  | 'VIEW_AUDIT_LOG'
  | 'CHANGE_PASSWORD'
  | 'ACCESS_DENIED';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: AuditAction;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  details: string;
  ipAddress?: string;
  status: 'success' | 'failure';
}

const AUDIT_LOG_KEY = 'audit_log';
const MAX_LOG_ENTRIES = 1000; // Maxim 1000 înregistrări

// Aggiungi intrare în audit log
export function addAuditLog(
  action: AuditAction,
  userId: string,
  userName: string,
  userEmail: string,
  userRole: string,
  details: string,
  status: 'success' | 'failure' = 'success'
) {
  const logJson = localStorage.getItem(AUDIT_LOG_KEY);
  const logs: AuditLogEntry[] = logJson ? JSON.parse(logJson) : [];

  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    action,
    userId,
    userName,
    userEmail,
    userRole,
    details,
    status,
  };

  logs.push(entry);

  // Păstrează doar ultimele MAX_LOG_ENTRIES
  if (logs.length > MAX_LOG_ENTRIES) {
    logs.shift();
  }

  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
}

// Obține audit log
export function getAuditLog(): AuditLogEntry[] {
  const logJson = localStorage.getItem(AUDIT_LOG_KEY);
  return logJson ? JSON.parse(logJson) : [];
}

// Obține audit log filtrat după acțiune
export function getAuditLogByAction(action: AuditAction): AuditLogEntry[] {
  const logs = getAuditLog();
  return logs.filter((log) => log.action === action);
}

// Obține audit log filtrat după utilizator
export function getAuditLogByUser(userId: string): AuditLogEntry[] {
  const logs = getAuditLog();
  return logs.filter((log) => log.userId === userId);
}

// Obține audit log din ultimele N ore
export function getAuditLogLastHours(hours: number): AuditLogEntry[] {
  const logs = getAuditLog();
  const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
  return logs.filter((log) => log.timestamp >= cutoffTime);
}

// Rimuovi audit log (admin only)
export function clearAuditLog() {
  localStorage.removeItem(AUDIT_LOG_KEY);
}

// Esporta audit log ca CSV
export function exportAuditLogAsCSV(): string {
  const logs = getAuditLog();
  const headers = ['ID', 'Data/Ora', 'Acțiune', 'Utilizator', 'Email', 'Rol', 'Detalii', 'Status'];
  const rows = logs.map((log) => [
    log.id,
    new Date(log.timestamp).toLocaleString('it-IT'),
    log.action,
    log.userName,
    log.userEmail,
    log.userRole,
    log.details,
    log.status,
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  return csv;
}

// Descarcă audit log ca file CSV
export function downloadAuditLogAsCSV() {
  const csv = exportAuditLogAsCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `AuditLog-${new Date().getTime()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Obține statistici audit log
export function getAuditLogStats() {
  const logs = getAuditLog();
  const stats = {
    totalEntries: logs.length,
    successCount: logs.filter((l) => l.status === 'success').length,
    failureCount: logs.filter((l) => l.status === 'failure').length,
    actionCounts: {} as Record<AuditAction, number>,
    userCounts: {} as Record<string, number>,
  };

  logs.forEach((log) => {
    stats.actionCounts[log.action] = (stats.actionCounts[log.action] || 0) + 1;
    stats.userCounts[log.userName] = (stats.userCounts[log.userName] || 0) + 1;
  });

  return stats;
}
