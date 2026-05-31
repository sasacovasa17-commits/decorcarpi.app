/**
 * Admin Audit Dashboard
 * Real-time feed al tuturor acțiunilor cu filtrare și export
 */

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Download, RefreshCw, Activity } from "lucide-react";
import { useToastNotifications } from "@/hooks/useToastNotifications";

interface AuditLog {
  id: number;
  userId?: number;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  status: "success" | "failed" | "pending";
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export default function AdminAuditDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed" | "pending">("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(false);
  const { successTranslated, errorTranslated } = useToastNotifications();

  // Mock data - în producție ar veni din tRPC
  const mockLogs: AuditLog[] = [
    {
      id: 1,
      userId: 1,
      action: "contact_submitted",
      entityType: "contact",
      details: { name: "John Doe", email: "john@example.com" },
      status: "success",
      createdAt: new Date(Date.now() - 300000),
      ipAddress: "192.168.1.1",
    },
    {
      id: 2,
      userId: 1,
      action: "email_sent",
      entityType: "email",
      entityId: "email-123",
      details: { to: "admin@decorcarpi.it", type: "contact" },
      status: "success",
      createdAt: new Date(Date.now() - 250000),
    },
    {
      id: 3,
      userId: 1,
      action: "admin_action",
      entityType: "email",
      entityId: "email-123",
      details: { action: "mark_as_sent" },
      status: "success",
      createdAt: new Date(Date.now() - 200000),
    },
    {
      id: 4,
      userId: 2,
      action: "email_failed",
      entityType: "email",
      entityId: "email-124",
      details: { to: "user@example.com", type: "confirmation" },
      status: "failed",
      errorMessage: "SMTP connection timeout",
      createdAt: new Date(Date.now() - 150000),
    },
    {
      id: 5,
      action: "system_error",
      entityType: "system",
      details: { error: "Database connection lost" },
      status: "failed",
      errorMessage: "Timeout della connessione",
      createdAt: new Date(Date.now() - 100000),
    },
    {
      id: 6,
      userId: 1,
      action: "push_sent",
      entityType: "push_notification",
      details: { type: "contact_response", title: "Risposta al contatto" },
      status: "success",
      createdAt: new Date(Date.now() - 50000),
    },
  ];

  useEffect(() => {
    setLogs(mockLogs);
  }, []);

  // Auto-refresh logs
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In produzione chiamerebbe la procedura tRPC
      console.log("[Audit] Auto-refreshing logs");
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    let filtered = logs;

    // Filtro per stato
    if (statusFilter !== "all") {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }

    // Filtro per azione
    if (actionFilter !== "all") {
      filtered = filtered.filter((l) => l.action === actionFilter);
    }

    // Filtro per termine di ricerca
    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.userId?.toString().includes(searchTerm) ||
          l.entityId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, statusFilter, actionFilter, searchTerm]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Mock refresh
      await new Promise((resolve) => setTimeout(resolve, 1000));
      successTranslated("data_refreshed");
    } catch (error) {
      errorTranslated("refresh_failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const csv = filteredLogs
        .map(
          (log) =>
            `${log.id},${log.userId || ""},${log.action},${log.entityType},${log.status},${new Date(log.createdAt).toISOString()}`
        )
        .join("\n");

      const header = "ID,User ID,Action,Entity Type,Status,Created At\n";
      const fullCsv = header + csv;

      const blob = new Blob([fullCsv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();

      successTranslated("export_successful");
    } catch (error) {
      errorTranslated("export_failed");
    }
  };

  const stats = {
    Totale: logs.length,
    success: logs.filter((l) => l.status === "success").length,
    failed: logs.filter((l) => l.status === "failed").length,
    pending: logs.filter((l) => l.status === "pending").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default",
      failed: "destructive",
      pending: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ro-RO");
  };

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Audit Trail</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Live" : "Manual"}
          </Button>
          <Button size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Totale Actions</div>
          <div className="text-2xl font-bold">{stats.Totale}</div>
        </Card>
        <Card className="p-4 border-green-200">
          <div className="text-sm text-green-600">Succese</div>
          <div className="text-2xl font-bold text-green-600">{stats.success}</div>
        </Card>
        <Card className="p-4 border-red-200">
          <div className="text-sm text-red-600">Falliti</div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </Card>
        <Card className="p-4 border-yellow-200">
          <div className="text-sm text-yellow-600">In sospeso</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="Cerca per azione, entità o ID utente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-64"
          />
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrare action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le azioni</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrare status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="success">Succese</SelectItem>
              <SelectItem value="failed">Falliti</SelectItem>
              <SelectItem value="pending">In sospeso</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Detalii</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.id}</TableCell>
                  <TableCell>{log.userId || "-"}</TableCell>
                  <TableCell className="font-medium text-sm">{log.action}</TableCell>
                  <TableCell className="text-sm">
                    {log.entityType}
                    {log.entityId && <div className="text-xs text-gray-500">{log.entityId}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      {getStatusBadge(log.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(log.createdAt)}</TableCell>
                  <TableCell className="text-xs">
                    {log.errorMessage && (
                      <div className="text-red-600 font-mono">{log.errorMessage}</div>
                    )}
                    {log.details && (
                      <details className="cursor-pointer">
                        <summary className="text-blue-600">View</summary>
                        <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto max-w-xs">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nessun audit log trovato
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
