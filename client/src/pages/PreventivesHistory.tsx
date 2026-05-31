import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Mail, Trash2, Eye, Search, Filter, FileDown, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";

export default function PreventivesHistory() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Obține lista Preventivi
  const { data: preventives = [], isLoading, refetch } = trpc.preventive.list.useQuery();
  const sendEmailMutation = trpc.preventive.sendEmail.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const deleteMutation = trpc.preventive.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Filtrare și căutare
  const filteredPreventives = useMemo(() => {
    return preventives.filter((p: any) => {
      const matchesSearch =
        p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.preventiveNumber).includes(searchTerm);

      const matchesStatus = !statusFilter || p.status === statusFilter;

      const preventiveDate = new Date(p.createdAt);
      const matchesDateFrom = !dateRange.from || preventiveDate >= new Date(dateRange.from);
      const matchesDateTo = !dateRange.to || preventiveDate <= new Date(dateRange.to);

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [preventives, searchTerm, statusFilter, dateRange]);

  // Statistici
  const stats = useMemo(() => {
    const Totale = filteredPreventives.length;
    const totalAmount = filteredPreventives.reduce((sum: number, p: any) => {
      // Calcola Totale din articole: sqm * pricePerSqm
      // Per ora, usiamo IVA e altri come stime
      const subtotal = (p.iva || 0) + (p.altri || 0);
      return sum + subtotal;
    }, 0);

    return {
      Totale,
      totalAmount,
      draft: filteredPreventives.filter((p: any) => p.status === "draft").length,
      sent: filteredPreventives.filter((p: any) => p.status === "sent").length,
      accepted: filteredPreventives.filter((p: any) => p.status === "accepted").length,
      rejected: filteredPreventives.filter((p: any) => p.status === "rejected").length,
    };
  }, [filteredPreventives]);

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

  const handleDownloadPDF = (preventiveId: number) => {
    const Preventivi = filteredPreventives.find((p: any) => p.id === preventiveId);
    if (!Preventivi) return;

    try {
      const element = document.createElement("div");
      element.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #c9a227; padding-bottom: 20px;">
            <div style="font-size: 28px; font-weight: bold; color: #c9a227;">DECOR CARPI</div>
            <div style="font-size: 20px; font-weight: bold;">PREVENTIVO</div>
            <div>N° ${String(Preventivi.preventiveNumber).padStart(3, "0")}</div>
          </div>
          <div style="margin: 20px 0;">
            <div style="margin: 8px 0;"><strong>Progetto:</strong> ${Preventivi.projectName}</div>
            <div style="margin: 8px 0;"><strong>Cliente:</strong> ${Preventivi.clientName || "N/A"}</div>
            <div style="margin: 8px 0;"><strong>Email:</strong> ${Preventivi.clientEmail || "N/A"}</div>
            <div style="margin: 8px 0;"><strong>Data:</strong> ${new Date(Preventivi.createdAt).toLocaleDateString("it-IT")}</div>
            <div style="margin: 8px 0;"><strong>Status:</strong> ${getStatusLabel(Preventivi.status)}</div>
          </div>
          <div style="margin: 30px 0; border-top: 1px solid #ddd; padding-top: 20px;">
            <div style="font-weight: bold; font-size: 16px;">Importo Totalee: €${((Preventivi.iva || 0) + (Preventivi.altri || 0)).toFixed(2)}</div>
            <div style="font-size: 12px; color: #666; margin-top: 10px;">IVA inclusa</div>
          </div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center;">
            <p>Generato il ${new Date().toLocaleDateString("it-IT")} alle ${new Date().toLocaleTimeString("it-IT")}</p>
            <p>Decor Carpi - Stucchi Decorativi | www.decorcarpi.it</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `Preventivo_${String(Preventivi.preventiveNumber).padStart(3, "0")}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait" as const, unit: "mm" as const, format: "a4" as const },
      };

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Errore download PDF:", error);
    }
  };

  const handleExportExcel = () => {
    try {
      const data = filteredPreventives.map((p: any) => ({
        "Numero": String(p.preventiveNumber).padStart(3, "0"),
        "Cliente": p.clientName || "N/A",
        "Progetto": p.projectName,
        "Status": getStatusLabel(p.status),
        "Data": new Date(p.createdAt).toLocaleDateString("it-IT"),
        "Email": p.clientEmail || "N/A",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Preventivi");
      ws["!cols"] = [{wch: 12}, {wch: 20}, {wch: 20}, {wch: 12}, {wch: 12}, {wch: 12}, {wch: 20}];

      const fileName = `Preventivi_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Errore export Excel:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </button>
          <h1 className="text-3xl font-bold text-foreground mb-2">📋 Storico Preventivi</h1>
          <p className="text-muted-foreground">Visualizza e gestisci tutti i preventivi generati</p>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{stats.Totale}</div>
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
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtri
            </CardTitle>
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
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={statusFilter === null ? "default" : "outline"}
                  onClick={() => setStatusFilter(null)}
                  size="sm"
                >
                  Tutti
                </Button>
                <Button
                  variant={statusFilter === "draft" ? "default" : "outline"}
                  onClick={() => setStatusFilter("draft")}
                  size="sm"
                >
                  Bozze
                </Button>
                <Button
                  variant={statusFilter === "sent" ? "default" : "outline"}
                  onClick={() => setStatusFilter("sent")}
                  size="sm"
                >
                  Inviati
                </Button>
                <Button
                  variant={statusFilter === "accepted" ? "default" : "outline"}
                  onClick={() => setStatusFilter("accepted")}
                  size="sm"
                >
                  Accettati
                </Button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground block mb-2">Da</label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground block mb-2">A</label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabella preventivi */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preventivi ({filteredPreventives.length})</CardTitle>
                <CardDescription>Elenco completo dei preventivi generati</CardDescription>
              </div>
              <Button onClick={handleExportExcel} variant="outline" size="sm" className="gap-2">
                <FileDown className="w-4 h-4" />
                Export Excel
              </Button>
            </div>
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
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPreventives.map((p: any) => (
                      <tr key={p.id} className="border-b hover:bg-muted/50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-600">
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
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {p.clientEmail ? (
                            <a
                              href={`mailto:${p.clientEmail}`}
                              className="text-blue-500 hover:underline"
                            >
                              {p.clientEmail}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadPDF(p.id)}
                              title="Scarica PDF"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {p.clientEmail && p.status === "draft" && (
                              <>
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
                                  title="Invia Email"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const message = `Ciao! Ti allego il preventivo N° ${String(p.preventiveNumber).padStart(3, "0")} per il progetto "${p.projectName}". Importo: €${((p.iva || 0) + (p.altri || 0)).toFixed(2)} (IVA inclusa). Contattami per dettagli.`;
                                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                    window.open(whatsappUrl, "_blank");
                                  }}
                                  title="Invia WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4 text-green-500" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (window.confirm("Sei sicuro di voler eliminare questo preventivo?")) {
                                  deleteMutation.mutate({ id: p.id });
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              title="Elimina"
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
