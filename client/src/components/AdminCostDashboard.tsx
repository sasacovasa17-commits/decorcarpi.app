import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, TrendingUp, DollarSign, Zap, Download, AlertTriangle, Settings } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { CostChart } from './CostChart';
import { CostAlertSettings, checkCostAlert, getCostAlertPercentage } from './CostAlertSettings';
import { exportToCSV, exportToPDF } from '@/lib/export-utils';

const ADMIN_PASSWORD = 'Alexandru.07';

interface AiUsageStats {
  Totale: number;
  count: number;
  byModel: Record<string, { count: number; cost: number }>;
  daily: Array<{ date: string; cost: number }>;
}

interface AiUsageLog {
  id: number;
  sessionId: string | null;
  userId: number | null;
  modelUsed: string;
  costEstimated: number;
  status: 'success' | 'failed';
  createdAt: Date;
}

export function AdminCostDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [days, setDays] = useState(7);
  const [showSettings, setShowSettings] = useState(false);
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [costPercentage, setCostPercentage] = useState(0);

  // tRPC queries
  const statsQuery = trpc.admin.getAiStats.useQuery(
    { days },
    { enabled: isAuthenticated }
  );
  const usageQuery = trpc.admin.getRecentUsage.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated }
  );

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    // Emulate delay for security
    await new Promise(resolve => setTimeout(resolve, 300));

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
      toast.success('Admin autenticato');
    } else {
      setError('Password non corretta');
      setPassword('');
      toast.error('Password non corretta');
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setError('');
    setShowSettings(false);
    toast.success('Disconnesso');
  };

  const stats = statsQuery.data as AiUsageStats | undefined;
  const recentUsage = usageQuery.data as AiUsageLog[] | undefined;

  // Calculate monthly prediction
  const monthlyPrediction = stats && stats.daily.length > 0
    ? (stats.Totale / stats.daily.length) * 30
    : 0;

  // Check cost alert
  useEffect(() => {
    if (stats) {
      const shouldAlert = checkCostAlert(monthlyPrediction);
      setAlertTriggered(shouldAlert);
      setCostPercentage(getCostAlertPercentage(monthlyPrediction));

      if (shouldAlert) {
        toast.warning(`Attenzione: Costi al ${getCostAlertPercentage(monthlyPrediction)}% del limite mensile!`);
      }
    }
  }, [monthlyPrediction]);

  const handleExportCSV = () => {
    if (recentUsage) {
      exportToCSV(recentUsage);
      toast.success('Rapporto CSV scaricato');
    }
  };

  const handleExportPDF = () => {
    if (stats && recentUsage) {
      exportToPDF(stats, recentUsage);
      toast.success('Rapporto PDF generato');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-gold/30 bg-black/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold">
              <Lock className="w-5 h-5" />
              Pannello Amministratore
            </CardTitle>
            <CardDescription>Inserisci la password per accedere</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Inserisci la password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                  disabled={isLoading}
                  className="pr-10 bg-black/50 border-gold/30 text-white placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-400">{error === 'Password non corretta' ? 'Password non corretta' : error}</p>
              )}
            </div>
            <Button
              onClick={handleLogin}
              disabled={isLoading || !password}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              {isLoading ? 'Autenticazione...' : 'Accedi'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Alert Banner */}
      {alertTriggered && (
        <div className="p-4 bg-red-900/20 border border-red-600/30 rounded flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-300">Attenzione: Limite di costo in avvicinamento!</p>
            <p className="text-sm text-red-200 mt-1">
              Costi mensili al {costPercentage}% del limite configurato. Controlla le impostazioni per modificare il limite.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Pannello Costi AI</h2>
          <p className="text-sm text-gray-400 mt-1">Monitoraggio utilizzo e costi AI</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="border-gold/30 text-gold hover:bg-gold/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Impostazioni
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-gold/30 text-gold hover:bg-gold/10"
          >
            Esci
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="space-y-4">
          <CostAlertSettings />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Totale Cost Today */}
        <Card className="border-gold/30 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gold" />
              Costo Oggi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold">
              €{((stats?.Totale || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {stats?.count || 0} generazioni
            </p>
          </CardContent>
        </Card>

        {/* Monthly Prediction */}
        <Card className={`border-gold/30 ${alertTriggered ? 'bg-red-900/20 border-red-600/30' : 'bg-black/50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${alertTriggered ? 'text-red-400' : 'text-gold'}`} />
              Previsione Mese
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${alertTriggered ? 'text-red-400' : 'text-gold'}`}>
              €{(monthlyPrediction / 100).toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Basato su {stats?.daily.length || 0} giorni
            </p>
          </CardContent>
        </Card>

        {/* Totale Generations */}
        <Card className="border-gold/30 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold" />
              Generazioni Totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold">
              {stats?.count || 0}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Negli ultimi {days} giorni
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Chart */}
      {stats?.daily && stats.daily.length > 0 && (
        <Card className="border-gold/30 bg-black/50">
          <CardHeader>
            <CardTitle className="text-gold">Grafico Costi Giornalieri</CardTitle>
          </CardHeader>
          <CardContent>
            <CostChart data={stats.daily} title={`Costi Giornalieri - Ultimi ${days} giorni (€)`} />
          </CardContent>
        </Card>
      )}

      {/* By Model Stats */}
      {stats?.byModel && Object.keys(stats.byModel).length > 0 && (
        <Card className="border-gold/30 bg-black/50">
          <CardHeader>
            <CardTitle className="text-gold">Utilizzo per Modello</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byModel).map(([model, data]) => (
                <div key={model} className="flex items-center justify-between p-3 bg-black/30 rounded">
                  <div>
                    <p className="font-medium text-white">{model}</p>
                    <p className="text-sm text-gray-400">{data.count} generazioni</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gold">€{(data.cost / 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">
                      €{((data.cost / data.count) / 100).toFixed(4)}/gen
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Buttons */}
      <Card className="border-gold/30 bg-black/50">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <Download className="w-5 h-5" />
            Scarica Rapporto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={handleExportCSV}
              className="flex-1 bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              Scarica CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              className="flex-1 bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              Scarica PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Usage Table */}
      <Card className="border-gold/30 bg-black/50">
        <CardHeader>
          <CardTitle className="text-gold">Utilizzi Recenti</CardTitle>
          <CardDescription>Ultimi 20 generazioni AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="text-left py-2 px-2 text-gray-400">Modello</th>
                  <th className="text-left py-2 px-2 text-gray-400">Costo</th>
                  <th className="text-left py-2 px-2 text-gray-400">Stato</th>
                  <th className="text-left py-2 px-2 text-gray-400">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentUsage && recentUsage.length > 0 ? (
                  recentUsage.map((log) => (
                    <tr key={log.id} className="border-b border-gold/10 hover:bg-black/30">
                      <td className="py-2 px-2 text-white">{log.modelUsed}</td>
                      <td className="py-2 px-2 text-gold">€{(log.costEstimated / 100).toFixed(4)}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status === 'success'
                            ? 'bg-green-900/30 text-green-300'
                            : 'bg-red-900/30 text-red-300'
                        }`}>
                          {log.status === 'success' ? 'Successo' : 'Errore'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-gray-400">
                        {new Date(log.createdAt).toLocaleString('ro-RO')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                      <td colSpan={4} className="py-4 px-2 text-center text-gray-400">
                      Nessuna generazione registrata
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Days Filter */}
      <Card className="border-gold/30 bg-black/50">
        <CardHeader>
          <CardTitle className="text-gold">Filtra Giorni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[7, 14, 30].map((d) => (
              <Button
                key={d}
                onClick={() => setDays(d)}
                variant={days === d ? 'default' : 'outline'}
                className={days === d
                  ? 'bg-gold text-black hover:bg-gold/90'
                  : 'border-gold/30 text-gold hover:bg-gold/10'
                }
              >
                {d} giorni
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
