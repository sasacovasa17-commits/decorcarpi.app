import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Mail, Trash2, Eye, Search } from "lucide-react";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedPreventive, setSelectedPreventive] = useState<any | null>(null);

  // Obține lista Preventivi
  const { data: preventives = [], isLoading } = trpc.preventive.list.useQuery();
  const sendEmailMutation = trpc.preventive.sendEmail.useMutation();
  const deleteMutation = trpc.preventive.delete.useMutation();

  // Filtrare și căutare
  const filteredPreventives = useMemo(() => {
    return preventives.filter((p: any) => {
      const matchesSearch =
        p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.preventiveNumber).includes(searchTerm);

      const matchesStatus = !statusFilter || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [preventives, searchTerm, statusFilter]);

  // Statistici
  const stats = useMemo(() => {
    return {
      Totale: preventives.length,
      draft: preventives.filter((p: any) => p.status === "draft").length,
      sent: preventives.filter((p: any) => p.status === "sent").length,
      accepted: preventives.filter((p: any) => p.status === "accepted").length,
      rejected: preventives.filter((p: any) => p.status === "rejected").length,
    };
  }, [preventives]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-800";
      case "sent":
        return "bg-blue-200 text-blue-800";
      case "accepted":
        return "bg-green-200 text-green-800";
      case "rejected":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Bozza";
      case "sent":
        return "Inviato";
      case "accepted":
        return "Accettato";
      case "rejected":
        return "Rifiutato";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">📊 Admin Dashboard</h1>
          <p className="text-muted-foreground">Gestione preventivi e statistiche</p>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-c9a227">{stats.Totale}</div>
                <div className="text-sm text-muted-foreground">Totalee</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{stats.draft}</div>
                <div className="text-sm text-muted-foreground">Bozze</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.sent}</div>
                <div className="text-sm text-muted-foreground">Inviati</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
                <div className="text-sm text-muted-foreground">Accettati</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-muted-foreground">Rifiutati</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtri */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca per cliente, progetto o numero..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === null ? "default" : "outline"}
                  onClick={() => setStatusFilter(null)}
                >
                  Tutti
                </Button>
                <Button
                  variant={statusFilter === "draft" ? "default" : "outline"}
                  onClick={() => setStatusFilter("draft")}
                >
                  Bozze
                </Button>
                <Button
                  variant={statusFilter === "sent" ? "default" : "outline"}
                  onClick={() => setStatusFilter("sent")}
                >
                  Inviati
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabella preventivi */}
        <Card>
          <CardHeader>
            <CardTitle>Preventivi ({filteredPreventives.length})</CardTitle>
            <CardDescription>Lista di tutti i preventivi generati</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Caricamento...</p>
              </div>
            ) : filteredPreventives.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nessun preventivo trovato</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Numero</th>
                      <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                      <th className="text-left py-3 px-4 font-semibold">Progetto</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Data</th>
                      <th className="text-left py-3 px-4 font-semibold">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPreventives.map((p: any) => (
                      <tr key={p.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-mono font-bold text-c9a227">
                          #{String(p.preventiveNumber).padStart(3, "0")}
                        </td>
                        <td className="py-3 px-4">{p.clientName || "—"}</td>
                        <td className="py-3 px-4">{p.projectName}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(p.status)}>
                            {getStatusLabel(p.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("it-IT")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedPreventive(p);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {p.clientEmail && p.status === "draft" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  sendEmailMutation.mutate({
                                    id: p.id,
                                    clientEmail: p.clientEmail!,
                                  });
                                }}
                                disabled={sendEmailMutation.isPending}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                deleteMutation.mutate({ id: p.id });
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
