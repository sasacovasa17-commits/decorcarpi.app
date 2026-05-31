/**
 * Admin Email Dashboard
 * Pagina pentru gestionare email-uri Inviati (contact, preventivo, etc.)
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Loader, RefreshCw, Trash2, Eye } from 'lucide-react';

interface AdminEmailDashboardProps {
  onBack: () => void;
}

export function AdminEmailDashboard({ onBack }: AdminEmailDashboardProps) {
  const { currentColorTheme } = useTheme();
  const { successTranslated, errorTranslated } = useToastNotifications();

  const [filterType, setFilterType] = useState<'contact' | 'preventivo' | 'confirmation' | 'admin_notification' | undefined>();
  const [filterStatus, setFilterStatus] = useState<'sent' | 'failed' | 'pending' | 'retry' | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // Queries
  const { data: emails, isLoading: emailsLoading, refetch } = trpc.adminEmails.list.useQuery({
    type: filterType,
    status: filterStatus,
    search: searchTerm,
    limit: 50,
  });

  const { data: stats } = trpc.adminEmails.stats.useQuery();

  // Mutations
  const retryMutation = trpc.adminEmails.retry.useMutation({
    onSuccess: () => {
      successTranslated('Retry trimis cu Successo');
      refetch();
    },
    onError: (error) => {
      errorTranslated(error.message || 'Errore la retry');
    },
  });

  const updateStatusMutation = trpc.adminEmails.updateStatus.useMutation({
    onSuccess: () => {
      successTranslated('Status actualizat');
      refetch();
    },
    onError: (error) => {
      errorTranslated(error.message || 'Errore la actualizare');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return '#10b981'; // green
      case 'failed':
        return '#ef4444'; // red
      case 'pending':
        return '#f59e0b'; // amber
      case 'retry':
        return '#3b82f6'; // blue
      default:
        return '#6b7280'; // gray
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      contact: 'Contact',
      preventivo: 'Preventivo',
      confirmation: 'Confirmare',
      admin_notification: 'Notifica Admin',
    };
    return labels[type] || type;
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: 'rgba(201,162,39,0.2)' }}>
        <button onClick={onBack} className="text-[#c9a227]">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: '#e8e8e8' }}>
          Admin: Email Dashboard
        </h1>
      </div>

      <div className="flex-1 px-4 py-6 pb-24 overflow-y-auto">
        {/* Statistici */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div
              className="p-3 rounded-sm"
              style={{
                background: 'rgba(201,162,39,0.1)',
                border: '1px solid rgba(201,162,39,0.3)',
              }}
            >
              <p className="text-xs" style={{ color: '#888' }}>
                Totale
              </p>
              <p className="text-lg font-bold" style={{ color: '#c9a227' }}>
                {stats.total}
              </p>
            </div>
            <div
              className="p-3 rounded-sm"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              <p className="text-xs" style={{ color: '#888' }}>
                Inviati
              </p>
              <p className="text-lg font-bold" style={{ color: '#10b981' }}>
                {stats.sent}
              </p>
            </div>
            <div
              className="p-3 rounded-sm"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              <p className="text-xs" style={{ color: '#888' }}>
                Falliti
              </p>
              <p className="text-lg font-bold" style={{ color: '#ef4444' }}>
                {stats.failed}
              </p>
            </div>
            <div
              className="p-3 rounded-sm"
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
            >
              <p className="text-xs" style={{ color: '#888' }}>
                Pending
              </p>
              <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>
                {stats.pending}
              </p>
            </div>
          </div>
        )}

        {/* Filtre */}
        <div className="mb-6 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Cauta email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 rounded-sm text-sm"
            style={{
              background: currentColorTheme.colors.bg,
              color: '#e8e8e8',
              border: '1px solid rgba(201,162,39,0.3)',
            }}
          />

          <div className="flex gap-2">
            <select
              value={filterType || ''}
              onChange={(e) => setFilterType((e.target.value as any) || undefined)}
              className="flex-1 px-3 py-2 rounded-sm text-sm"
              style={{
                background: currentColorTheme.colors.bg,
                color: '#e8e8e8',
                border: '1px solid rgba(201,162,39,0.3)',
              }}
            >
              <option value="">Toate tipurile</option>
              <option value="contact">Contact</option>
              <option value="preventivo">Preventivo</option>
              <option value="confirmation">Confirmare</option>
              <option value="admin_notification">Notifica Admin</option>
            </select>

            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus((e.target.value as any) || undefined)}
              className="flex-1 px-3 py-2 rounded-sm text-sm"
              style={{
                background: currentColorTheme.colors.bg,
                color: '#e8e8e8',
                border: '1px solid rgba(201,162,39,0.3)',
              }}
            >
              <option value="">Toate statusurile</option>
              <option value="sent">Inviati</option>
              <option value="failed">Falliti</option>
              <option value="pending">Pending</option>
              <option value="retry">Retry</option>
            </select>
          </div>

          <button
            onClick={() => refetch()}
            className="w-full py-2 flex items-center justify-center gap-2 rounded-sm font-semibold text-sm transition-all"
            style={{
              background: 'rgba(201,162,39,0.2)',
              color: '#c9a227',
              border: '1px solid rgba(201,162,39,0.3)',
            }}
          >
            <RefreshCw size={16} />
            Ricarica
          </button>
        </div>

        {/* Email List */}
        {emailsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin" size={24} style={{ color: '#c9a227' }} />
          </div>
        ) : emails && emails.length > 0 ? (
          <div className="flex flex-col gap-3">
            {emails.map((email) => (
              <div
                key={email.id}
                className="p-4 rounded-sm cursor-pointer transition-all hover:opacity-80"
                style={{
                  background: 'rgba(201,162,39,0.05)',
                  border: `1px solid ${getStatusColor(email.status)}`,
                }}
                onClick={() => setSelectedEmail(selectedEmail === email.id ? null : email.id)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: '#e8e8e8' }}>
                      {email.subject}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#888' }}>
                      To: {email.to}
                    </p>
                  </div>
                  <div
                    className="px-2 py-1 rounded-sm text-xs font-semibold whitespace-nowrap"
                    style={{
                      background: getStatusColor(email.status),
                      color: '#fff',
                    }}
                  >
                    {email.status}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-1 rounded-sm text-xs"
                    style={{
                      background: 'rgba(201,162,39,0.2)',
                      color: '#c9a227',
                    }}
                  >
                    {getTypeLabel(email.type)}
                  </span>
                  <span className="text-xs" style={{ color: '#666' }}>
                    {new Date(email.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Expanded view */}
                {selectedEmail === email.id && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(201,162,39,0.2)' }}>
                    <p className="text-xs mb-2" style={{ color: '#888' }}>
                      <strong>Client:</strong> {email.clientName || 'N/A'}
                    </p>
                    <p className="text-xs mb-2" style={{ color: '#888' }}>
                      <strong>Email:</strong> {email.clientEmail || 'N/A'}
                    </p>
                    {email.lastError && (
                      <p className="text-xs mb-2" style={{ color: '#ff6b6b' }}>
                        <strong>Errore:</strong> {email.lastError}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      {email.status === 'failed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            retryMutation.mutate({ id: email.id });
                          }}
                          disabled={retryMutation.isPending}
                          className="flex-1 py-2 rounded-sm text-xs font-semibold transition-all"
                          style={{
                            background: '#3b82f6',
                            color: '#fff',
                            opacity: retryMutation.isPending ? 0.5 : 1,
                          }}
                        >
                          {retryMutation.isPending ? 'Retry...' : 'Retry'}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({
                            id: email.id,
                            status: 'sent',
                          });
                        }}
                        className="flex-1 py-2 rounded-sm text-xs font-semibold"
                        style={{
                          background: '#10b981',
                          color: '#fff',
                        }}
                      >
                        Mark Sent
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p style={{ color: '#888' }}>Nu sunt email-uri</p>
          </div>
        )}
      </div>
    </div>
  );
}
