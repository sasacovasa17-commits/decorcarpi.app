import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Download, Filter, Eye, EyeOff, Lock, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { getAllUsers, createUser, deleteUser, updateUser, getCurrentUser, UserRole } from '@/lib/roleManager';
import { getAuditLog, getAuditLogByAction, getAuditLogLastHours, downloadAuditLogAsCSV, AuditLogEntry } from '@/lib/auditLog';

const ADMIN_PASSWORD = 'Alexandru.07';

export function AdminPanel() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'client' as UserRole,
    password: 'Alexandru.07',
  });
  const [auditFilter, setAuditFilter] = useState<'all' | 'last24h' | 'last7d'>('all');
  const [showPasswords, setShowPasswords] = useState(false);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadUsers();
      loadAuditLogs();
    }
  }, [isAdminAuthenticated, auditFilter]);

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setAdminPassword('');
      toast.success('Admin autenticato!', {
        style: { background: '#1a0a0a', color: '#51cf66', border: '1px solid rgba(81,207,102,0.3)' },
      });
    } else {
      toast.error('Password admin non corretta!', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
      setAdminPassword('');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminPassword('');
      toast.info('Disconnesso da Admin Panel', {
      style: { background: '#1a0a0a', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' },
    });
  };

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const loadAuditLogs = () => {
    let logs: AuditLogEntry[] = [];
    if (auditFilter === 'all') {
      logs = getAuditLog();
    } else if (auditFilter === 'last24h') {
      logs = getAuditLogLastHours(24);
    } else if (auditFilter === 'last7d') {
      logs = getAuditLogLastHours(24 * 7);
    }
    setAuditLogs(logs.reverse()); // Newest first
  };

  const handleCreateUser = () => {
    if (!newUserForm.name || !newUserForm.email) {
      toast.error('Completa tutti i campi!', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
      return;
    }
    createUser(newUserForm.name, newUserForm.email, newUserForm.role, newUserForm.password);
    setNewUserForm({ name: '', email: '', role: 'client', password: 'Alexandru.07' });
    loadUsers();
      toast.success('Utente creato!', {
      style: { background: '#1a0a0a', color: '#51cf66', border: '1px solid rgba(81,207,102,0.3)' },
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      deleteUser(userId);
      loadUsers();
      toast.success('Utente eliminato!', {
        style: { background: '#1a0a0a', color: '#51cf66', border: '1px solid rgba(81,207,102,0.3)' },
      });
    }
  };

  const handleExportAuditLog = () => {
    downloadAuditLogAsCSV();
    toast.success('Audit log exportat ca CSV!', {
      style: { background: '#1a0a0a', color: '#51cf66', border: '1px solid rgba(81,207,102,0.3)' },
    });
  };

  // LOGIN FORM - ADMIN ONLY
  if (!isAdminAuthenticated) {
    return (
      <div className="p-4 rounded-sm" style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Lock size={20} style={{ color: '#c9a227' }} />
          <h3 className="text-sm font-bold" style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>
            🔐 Admin Panel
          </h3>
        </div>
        <p className="text-xs mb-3" style={{ color: '#999' }}>
          Inserisci la password admin per accedere al pannello di amministrazione
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            placeholder="Password admin..."
            className="flex-1 px-3 py-2 rounded-sm text-sm"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,162,39,0.3)', color: '#fff' }}
          />
          <button
            onClick={handleAdminLogin}
            className="px-4 py-2 rounded-sm text-sm font-semibold transition hover:opacity-80"
            style={{ background: '#c9a227', color: '#0a0a0a' }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // ADMIN PANEL - AFTER AUTHENTICATION
  return (
    <div className="p-4 rounded-sm" style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock size={20} style={{ color: '#c9a227' }} />
          <h3 className="text-sm font-bold" style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>
            🔐 Admin Panel
          </h3>
        </div>
        <button
          onClick={handleAdminLogout}
          className="flex items-center gap-1 px-3 py-1 rounded-sm text-xs transition"
          style={{ background: 'rgba(255,107,107,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('users')}
          className="flex-1 px-3 py-2 rounded-sm text-xs font-semibold transition"
          style={{
            background: activeTab === 'users' ? '#51cf66' : 'rgba(81,207,102,0.2)',
            color: activeTab === 'users' ? '#0a0a0a' : '#51cf66',
            border: `1px solid ${activeTab === 'users' ? '#51cf66' : 'rgba(81,207,102,0.3)'}`,
          }}
        >
          👤 Utenti
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className="flex-1 px-3 py-2 rounded-sm text-xs font-semibold transition"
          style={{
            background: activeTab === 'audit' ? '#c9a227' : 'rgba(201,162,39,0.2)',
            color: activeTab === 'audit' ? '#0a0a0a' : '#c9a227',
            border: `1px solid ${activeTab === 'audit' ? '#c9a227' : 'rgba(201,162,39,0.3)'}`,
          }}
        >
          📋 Audit Log
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Create User Form */}
          <div className="p-3 rounded-sm" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(201,162,39,0.2)' }}>
            <h4 className="text-xs font-bold mb-3" style={{ color: '#c9a227' }}>
              ➕ Crea Nuovo Utente
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                placeholder="Nume"
                className="w-full px-3 py-2 rounded-sm text-xs"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,162,39,0.2)', color: '#fff' }}
              />
              <input
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                placeholder="Email"
                className="w-full px-3 py-2 rounded-sm text-xs"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,162,39,0.2)', color: '#fff' }}
              />
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 rounded-sm text-xs"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,162,39,0.2)', color: '#fff' }}
              >
                <option value="client">Client</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-2">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Password"
                  className="flex-1 px-3 py-2 rounded-sm text-xs"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,162,39,0.2)', color: '#fff' }}
                />
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="px-3 py-2 rounded-sm text-xs"
                  style={{ background: 'rgba(201,162,39,0.2)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' }}
                >
                  {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                onClick={handleCreateUser}
                className="w-full px-3 py-2 rounded-sm text-xs font-semibold transition"
                style={{ background: '#51cf66', color: '#0a0a0a' }}
              >
                ➕ Crea Utente
              </button>
            </div>
          </div>

          {/* Users List */}
          <div>
            <h4 className="text-xs font-bold mb-2" style={{ color: '#c9a227' }}>
              Utenti ({users.length})
            </h4>
            <div className="space-y-2">
              {users.length === 0 ? (
                <p className="text-xs" style={{ color: '#999' }}>
                  Nessun utente
                </p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 rounded-sm flex items-center justify-between"
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(201,162,39,0.2)' }}
                  >
                    <div className="flex-1">
                      <p className="text-xs font-semibold" style={{ color: '#fff' }}>
                        {user.name}
                      </p>
                      <p className="text-[10px]" style={{ color: '#999' }}>
                        {user.email} • {user.role}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="px-2 py-1 rounded-sm text-xs"
                        style={{ background: 'rgba(201,162,39,0.2)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-2 py-1 rounded-sm text-xs"
                        style={{ background: 'rgba(255,107,107,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setAuditFilter('all')}
              className="flex-1 px-3 py-2 rounded-sm text-xs font-semibold transition"
              style={{
                background: auditFilter === 'all' ? '#c9a227' : 'rgba(201,162,39,0.2)',
                color: auditFilter === 'all' ? '#0a0a0a' : '#c9a227',
              }}
            >
              Tutti
            </button>
            <button
              onClick={() => setAuditFilter('last24h')}
              className="flex-1 px-3 py-2 rounded-sm text-xs font-semibold transition"
              style={{
                background: auditFilter === 'last24h' ? '#c9a227' : 'rgba(201,162,39,0.2)',
                color: auditFilter === 'last24h' ? '#0a0a0a' : '#c9a227',
              }}
            >
              24h
            </button>
            <button
              onClick={() => setAuditFilter('last7d')}
              className="flex-1 px-3 py-2 rounded-sm text-xs font-semibold transition"
              style={{
                background: auditFilter === 'last7d' ? '#c9a227' : 'rgba(201,162,39,0.2)',
                color: auditFilter === 'last7d' ? '#0a0a0a' : '#c9a227',
              }}
            >
              7 giorni
            </button>
            <button
              onClick={handleExportAuditLog}
              className="px-3 py-2 rounded-sm text-xs font-semibold transition"
              style={{ background: 'rgba(81,207,102,0.2)', color: '#51cf66', border: '1px solid rgba(81,207,102,0.3)' }}
            >
              <Download size={14} />
            </button>
          </div>

          {/* Audit Logs */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="text-xs" style={{ color: '#999' }}>
                Nessun registro di audit
              </p>
            ) : (
              auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-sm text-xs"
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(201,162,39,0.2)' }}
                >
                  <p style={{ color: '#c9a227', fontWeight: 'bold' }}>
                    {log.action} - {log.userId || 'Unknown'}
                  </p>
                  <p style={{ color: '#999', fontSize: '10px' }}>
                    {new Date(log.timestamp).toLocaleString('ro-RO')}
                  </p>
                  {log.details && (
                    <p style={{ color: '#999', fontSize: '10px', marginTop: '4px' }}>
                      {log.details}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
