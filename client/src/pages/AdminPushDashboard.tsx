/**
 * Admin Push Notifications Dashboard
 * Vizualizare notificări Inviati, statistici, și resend manual
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
import { Bell, Send, RefreshCw, Download, TrendingUp } from "lucide-react";
import { useToastNotifications } from "@/hooks/useToastNotifications";

interface PushNotification {
  id: string;
  userId: number;
  title: string;
  body: string;
  type: string;
  status: "sent" | "failed" | "pending";
  createdAt: Date;
  sentAt?: Date;
  error?: string;
}

export default function AdminPushDashboard() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<PushNotification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "sent" | "failed" | "pending">("all");
  const [loading, setLoading] = useState(false);
  const { successTranslated, errorTranslated } = useToastNotifications();

  // Mock data - în producție ar veni din tRPC
  const mockNotifications: PushNotification[] = [
    {
      id: "push-1",
      userId: 1,
      title: "Risposta al contatto",
      body: "Ho ricevuto il tuo messaggio. Ti contatterò con i dettagli presto.",
      type: "contact_response",
      status: "sent",
      createdAt: new Date(Date.now() - 3600000),
      sentAt: new Date(Date.now() - 3600000),
    },
    {
      id: "push-2",
      userId: 2,
      title: "Preventivo acceptat",
      body: "Il tuo preventivo è stato approvato. Possiamo procedere con il progetto.",
      type: "preventivo_accepted",
      status: "sent",
      createdAt: new Date(Date.now() - 7200000),
      sentAt: new Date(Date.now() - 7200000),
    },
    {
      id: "push-3",
      userId: 3,
      title: "Notifica sistem",
      body: "Errore nell'invio dell'email. Riprovo...",
      type: "system",
      status: "failed",
      createdAt: new Date(Date.now() - 10800000),
      error: "Subscription endpoint invalid",
    },
    {
      id: "push-4",
      userId: 4,
      title: "Actualizare proiect",
      body: "Il tuo progetto è entrato in fase di esecuzione.",
      type: "project_update",
      status: "pending",
      createdAt: new Date(Date.now() - 14400000),
    },
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    let filtered = notifications;

    // Filtro per stato
    if (statusFilter !== "all") {
      filtered = filtered.filter((n) => n.status === statusFilter);
    }

    // Filtro per termine di ricerca
    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.userId.toString().includes(searchTerm)
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, statusFilter, searchTerm]);

  const handleResend = async (notificationId: string) => {
    setLoading(true);
    try {
      // Mock resend - in produzione chiamerebbe la procedura tRPC
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, status: "sent" as const, sentAt: new Date() }
            : n
        )
      );

      successTranslated("notification_resent");
    } catch (error) {
      errorTranslated("notification_resend_failed");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    Totale: notifications.length,
    sent: notifications.filter((n) => n.status === "sent").length,
    failed: notifications.filter((n) => n.status === "failed").length,
    pending: notifications.filter((n) => n.status === "pending").length,
    deliveryRate: Math.round(
      (notifications.filter((n) => n.status === "sent").length / notifications.length) * 100
    ),
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      sent: "default",
      failed: "destructive",
      pending: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ro-RO");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-600" />
          <h1 className="text-3xl font-bold">Push Notifications</h1>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Totale</div>
          <div className="text-2xl font-bold">{stats.Totale}</div>
        </Card>
        <Card className="p-4 border-green-200">
          <div className="text-sm text-green-600">Inviati</div>
          <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
        </Card>
        <Card className="p-4 border-red-200">
          <div className="text-sm text-red-600">Falliti</div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </Card>
        <Card className="p-4 border-yellow-200">
          <div className="text-sm text-yellow-600">In sospeso</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-4 border-blue-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-sm text-blue-600">Delivery Rate</div>
              <div className="text-2xl font-bold text-blue-600">{stats.deliveryRate}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="Cerca per titolo, messaggio o ID utente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-64"
          />
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrare status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="sent">Inviati</SelectItem>
              <SelectItem value="failed">Falliti</SelectItem>
              <SelectItem value="pending">In sospeso</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Notifications Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Titlu</TableHead>
              <TableHead>Messaggio</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="text-xs">{notification.id.substring(0, 8)}...</TableCell>
                  <TableCell>{notification.userId}</TableCell>
                  <TableCell className="font-medium">{notification.title}</TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                    {notification.body}
                  </TableCell>
                  <TableCell className="text-xs">{notification.type}</TableCell>
                  <TableCell>{getStatusBadge(notification.status)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(notification.createdAt)}
                  </TableCell>
                  <TableCell>
                    {notification.status === "failed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResend(notification.id)}
                        disabled={loading}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Riprova
                      </Button>
                    )}
                    {notification.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResend(notification.id)}
                        disabled={loading}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Trimite
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Nessuna notifica trovata
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Error Details */}
      {filteredNotifications.some((n) => n.error) && (
        <Card className="p-4 border-red-200 bg-red-50">
          <h3 className="font-semibold text-red-900 mb-2">Detalii Erori</h3>
          <div className="space-y-2">
            {filteredNotifications
              .filter((n) => n.error)
              .map((n) => (
                <div key={n.id} className="text-sm text-red-800">
                  <strong>{n.title}:</strong> {n.error}
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
