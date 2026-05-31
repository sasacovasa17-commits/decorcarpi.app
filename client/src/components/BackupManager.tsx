import React, { useState, useCallback, useEffect } from 'react';
import { Download, Upload, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BackupManagerProps {
  onClose: () => void;
}

export function BackupManager({ onClose }: BackupManagerProps) {
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  const [backupSize, setBackupSize] = useState<string>('0 KB');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const ADMIN_PASSWORD = 'Alexandru.07'; // Password admin

  useEffect(() => {
    // Verifica l'ultimo backup
    const lastBackup = localStorage.getItem('lastBackupTime');
    if (lastBackup) {
      setLastBackupTime(new Date(lastBackup).toLocaleString('it-IT'));
    }

    // Calcola la dimensione del backup
    const allData = {
      preventives: localStorage.getItem('decorcarpi_preventivi') || '[]',
      calculatorPreferences: localStorage.getItem('calculatorPreferences') || '{}',
      calculatorAntimuffaPreferences: localStorage.getItem('calculatorAntimuffaPreferences') || '{}',
    };
    const size = new Blob([JSON.stringify(allData)]).size;
    setBackupSize(`${(size / 1024).toFixed(2)} KB`);
  }, []);

  const handleAdminAuth = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminMode(true);
      setAdminPassword('');
      toast.success('Modalità admin attivata!', {
        style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
      });
    } else {
      toast.error('Password admin non corretta!', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
    }
  };

  const handleExportBackup = useCallback(() => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          preventives: JSON.parse(localStorage.getItem('decorcarpi_preventivi') || '[]'),
          calculatorPreferences: JSON.parse(localStorage.getItem('calculatorPreferences') || '{}'),
          calculatorAntimuffaPreferences: JSON.parse(localStorage.getItem('calculatorAntimuffaPreferences') || '{}'),
        },
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DecorCarpi-Backup-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Backup esportato con successo!', {
        style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
      });
    } catch (err) {
      console.error('Errore esportazione backup:', err);
      toast.error('Errore nell\'esportazione del backup', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
    }
  }, []);

  const handleImportBackup = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      try {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const backupData = JSON.parse(event.target.result);

            // Validazione backup
            if (!backupData.data || !backupData.timestamp) {
              toast.error('Formato backup non valido', {
                style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
              });
              return;
            }

            // Restaurare date
            localStorage.setItem('decorcarpi_preventivi', JSON.stringify(backupData.data.preventives || []));
            localStorage.setItem('calculatorPreferences', JSON.stringify(backupData.data.calculatorPreferences || {}));
            localStorage.setItem('calculatorAntimuffaPreferences', JSON.stringify(backupData.data.calculatorAntimuffaPreferences || {}));
            localStorage.setItem('lastBackupTime', new Date().toISOString());

            toast.success('Backup ripristinato con successo! Ricarica la pagina.', {
              style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
            });

            // Ricarica la pagina dopo 2 secondi
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } catch (err) {
            console.error('Errore parsing backup:', err);
            toast.error('Errore nella lettura del backup', {
              style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
            });
          }
        };
        reader.readAsText(file);
      } catch (err) {
        console.error('Errore importazione backup:', err);
        toast.error('Errore nell\'importazione del backup', {
          style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
        });
      }
    };
    input.click();
  }, []);

  const handleClearData = useCallback(() => {
    if (window.confirm('Sei sicuro? Questo eliminerà TUTTI i dati salvati!')) {
      try {
        localStorage.removeItem('decorcarpi_preventivi');
        localStorage.removeItem('calculatorPreferences');
        localStorage.removeItem('calculatorAntimuffaPreferences');
        localStorage.removeItem('lastBackupTime');

        toast.success('Dati eliminati con successo!', {
          style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        console.error('Errore eliminazione dati:', err);
        toast.error('Errore nell\'eliminazione dei dati', {
          style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
        });
      }
    }
  }, []);

  // Se non è in modalità admin, mostra il modulo di accesso
  if (!isAdminMode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a0a0a] rounded-lg p-6 max-w-md w-full border" style={{ borderColor: 'rgba(201,162,39,0.3)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#c9a227' }}>
            🔒 Backup Manager - Admin Only
          </h2>
          <p className="text-xs mb-4" style={{ color: '#888' }}>
            Questa è una funzione amministrativa. Inserisci la password per continuare.
          </p>
          <input
            type="password"
            placeholder="Password admin"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
            className="w-full px-3 py-2 rounded-sm mb-4 text-sm"
            style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: '#e8e8e8' }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdminAuth}
              className="flex-1 py-2 rounded-sm font-semibold transition"
              style={{ background: 'rgba(76,175,80,0.2)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.4)' }}
            >
              Autentica
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-sm text-xs transition"
              style={{ background: 'rgba(201,162,39,0.1)', color: '#888', border: '1px solid rgba(201,162,39,0.2)' }}
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a0a0a] rounded-lg p-6 max-w-md w-full border" style={{ borderColor: 'rgba(201,162,39,0.3)' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#c9a227' }}>
          ✅ Backup Manager - Admin
        </h2>

        {/* Stato */}
        <div className="mb-4 p-3 rounded-sm" style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.25)' }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} style={{ color: '#4caf50' }} />
            <span className="text-xs" style={{ color: '#e8e8e8' }}>
              Ultimo backup: {lastBackupTime || 'Mai'}
            </span>
          </div>
          <div className="text-xs" style={{ color: '#888' }}>
            Dimensione dati: {backupSize}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 mb-4">
          <button
            onClick={handleExportBackup}
            className="w-full py-2 rounded-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{ background: 'rgba(76,175,80,0.2)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.4)' }}
          >
            <Download size={16} /> Export Backup
          </button>
          <button
            onClick={handleImportBackup}
            className="w-full py-2 rounded-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{ background: 'rgba(201,162,39,0.2)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.4)' }}
          >
            <Upload size={16} /> Import Backup
          </button>
          <button
            onClick={handleClearData}
            className="w-full py-2 rounded-sm font-semibold flex items-center justify-center gap-2 transition"
            style={{ background: 'rgba(255,107,107,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.4)' }}
          >
            <Trash2 size={16} /> Șterge Date
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2 rounded-sm text-xs transition"
          style={{ background: 'rgba(201,162,39,0.1)', color: '#888', border: '1px solid rgba(201,162,39,0.2)' }}
        >
          Închide
        </button>
      </div>
    </div>
  );
}
