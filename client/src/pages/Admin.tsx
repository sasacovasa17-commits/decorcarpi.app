/**
 * Pagina Admin - Decor Carpi
 * Accesso: /admin
 * Password: decorcarpi2024 (modificabile via env ADMIN_PASSWORD)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { RefreshCw, Trash2, Shield, LogOut, Users, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const { data: sessions, isLoading, refetch } = trpc.admin.listSessions.useQuery(
    { password },
    { enabled: authenticated, retry: false }
  );

  const resetSession = trpc.admin.resetSession.useMutation({
    onSuccess: () => {
      toast.success("Sessione resettata con successo");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const resetAll = trpc.admin.resetAll.useMutation({
    onSuccess: () => {
      toast.success("Tutte le sessioni sono state resettate");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleLogin = async () => {
    if (!password.trim()) return;
    setAuthError("");
    // Testa la password provando a caricare i dati
    try {
      setAuthenticated(true);
    } catch {
      setAuthError("Password errata");
      setAuthenticated(false);
    }
  };

  // Se i dati vengono caricati con errore, mostra errore password
  const handleQueryError = () => {
    setAuthenticated(false);
    setAuthError("Password errata. Riprova.");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)" }}>
              <Shield size={28} style={{ color: "#c9a227" }} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif" }}>
              Decor Carpi Admin
            </h1>
            <p className="text-xs mt-1" style={{ color: "#666", fontFamily: "'Open Sans', sans-serif" }}>
              Gestione sessioni e anteprime AI
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Password admin"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 rounded-sm text-sm outline-none"
              style={{
                background: "#111",
                border: "1px solid rgba(201,162,39,0.3)",
                color: "#e8e8e8",
                fontFamily: "'Open Sans', sans-serif",
              }}
            />
            {authError && (
              <p className="text-xs text-red-400 text-center">{authError}</p>
            )}
            <button
              onClick={handleLogin}
              className="w-full py-3 font-bold text-sm tracking-widest rounded-sm"
              style={{ background: "#c9a227", color: "#0a0a0a", fontFamily: "'Raleway', sans-serif" }}
            >
              ACCEDI
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <div className="flex items-center gap-3">
          <Shield size={20} style={{ color: "#c9a227" }} />
          <h1 className="text-base font-bold" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
            Admin Panel
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-sm"
            style={{ color: "#c9a227", border: "1px solid rgba(201,162,39,0.2)" }}
            title="Aggiorna"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => { setAuthenticated(false); setPassword(""); }}
            className="p-2 rounded-sm"
            style={{ color: "#888", border: "1px solid rgba(255,255,255,0.1)" }}
            title="Esci"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="px-5 py-5 flex flex-col gap-5 max-w-2xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-sm" style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} style={{ color: "#c9a227" }} />
              <span className="text-xs" style={{ color: "#888", fontFamily: "'Raleway', sans-serif" }}>Sessioni totali</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#e8e8e8", fontFamily: "'Playfair Display', serif" }}>
              {sessions?.length ?? "—"}
            </p>
          </div>
          <div className="p-4 rounded-sm" style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} style={{ color: "#c9a227" }} />
              <span className="text-xs" style={{ color: "#888", fontFamily: "'Raleway', sans-serif" }}>Generazioni totali</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#e8e8e8", fontFamily: "'Playfair Display', serif" }}>
              {sessions?.reduce((sum, s) => sum + (s.generationsUsed ?? 0), 0) ?? "—"}
            </p>
          </div>
        </div>

        {/* Reset tutto */}
        <button
          onClick={() => {
            if (confirm("Sei sicuro di voler resettare TUTTE le sessioni? Tutti i clienti potranno generare di nuovo 3 anteprime gratuite.")) {
              resetAll.mutate({ password });
            }
          }}
          disabled={resetAll.isPending}
          className="w-full py-3 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-wide"
          style={{
            background: "rgba(231,76,60,0.1)",
            border: "1px solid rgba(231,76,60,0.3)",
            color: "#e74c3c",
            fontFamily: "'Raleway', sans-serif",
          }}
        >
          <RotateCcw size={16} />
          {resetAll.isPending ? "Resettando..." : "Resetta TUTTE le sessioni"}
        </button>

        {/* Lista sessioni */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            SESSIONI ATTIVE
          </h2>
          {isLoading ? (
            <p className="text-xs text-center py-8" style={{ color: "#555" }}>Caricamento...</p>
          ) : sessions && sessions.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "#555" }}>Nessuna sessione trovata</p>
          ) : (
            sessions?.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between px-4 py-3 rounded-sm"
                style={{
                  background: (session.generationsUsed ?? 0) >= 3
                    ? "rgba(231,76,60,0.05)"
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${(session.generationsUsed ?? 0) >= 3 ? "rgba(231,76,60,0.2)" : "rgba(201,162,39,0.1)"}`,
                }}
              >
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-[11px] font-mono truncate" style={{ color: "#aaa" }}>
                    {session.sessionId}
                  </span>
                  <span className="text-[10px]" style={{ color: "#555" }}>
                    {session.createdAt ? new Date(session.createdAt).toLocaleString("it-IT") : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: (session.generationsUsed ?? 0) >= 3
                        ? "rgba(231,76,60,0.2)"
                        : "rgba(201,162,39,0.15)",
                      color: (session.generationsUsed ?? 0) >= 3 ? "#e74c3c" : "#c9a227",
                    }}
                  >
                    {session.generationsUsed ?? 0}/3
                  </span>
                  <button
                    onClick={() => resetSession.mutate({ password, sessionId: session.sessionId })}
                    disabled={resetSession.isPending}
                    className="p-1.5 rounded-sm"
                    style={{ color: "#c9a227", border: "1px solid rgba(201,162,39,0.2)" }}
                    title="Resetta questa sessione"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
