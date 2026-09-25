import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Mail, 
  Server, 
  Shield, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Info, 
  CheckCircle2,
  Key,
  Sun,
  Moon
} from 'lucide-react';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage({ stats, onDataChanged }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPendingInvites();
  }, []);

  const fetchPendingInvites = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCustomers({ status: 'PENDING_INVITE' });
      setPendingCustomers(res.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const dbStatus = stats?.database || { engine: 'PostgreSQL 18', host: 'localhost:5432', connected: true };
  const emailStatus = stats?.emailService || {
    configured: false,
    mode: 'Dev / Ethereal Test Mailer',
    host: 'smtp.ethereal.email (auto-generated)',
    from: '"PiezoPulse IoT Platform" <no-reply@piezopulse.io>'
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">System & Platform Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Database infrastructure, invite link simulation center, and theme preferences</p>
        </div>

        {/* Quick Theme Toggle Card */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-2">Theme:</span>
          <button
            onClick={() => isDark && toggleTheme()}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              !isDark ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>
          <button
            onClick={() => !isDark && toggleTheme()}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              isDark ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Database Diagnostic Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Database Engine</h3>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Connected & Operational</span>
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Active Engine</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{dbStatus.engine}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Host / Target</span>
              <span className="font-semibold text-cyan-700 dark:text-cyan-300 font-mono">{dbStatus.host}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Connection Mode</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Pooled Clients (pg)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
              <Info className="w-3.5 h-3.5" />
              <span>Dual Storage Engine</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Configured for PostgreSQL on port 5432 with auto-migration of all entities.
            </p>
          </div>
        </div>

        {/* Email & SMTP Dispatch Service Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Service</h3>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active Mailer</span>
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Dispatch Mode</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{emailStatus.mode}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">SMTP Host</span>
              <span className="font-semibold text-cyan-700 dark:text-cyan-300 font-mono truncate max-w-[150px]" title={emailStatus.host}>{emailStatus.host}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Sender Identity</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px]" title={emailStatus.from}>{emailStatus.from}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <Info className="w-3.5 h-3.5" />
              <span>Automated Email Delivery</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              When adding a customer, an invitation email with a secure password setup link is automatically sent using Nodemailer.
            </p>
          </div>
        </div>

        {/* Security & Token Parameters */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Tokens</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">HMAC SHA-256</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Authentication Protocol</span>
              <span className="font-semibold text-slate-900 dark:text-white">JWT Bearer Tokens</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Token Validity Period</span>
              <span className="font-semibold text-slate-900 dark:text-white">7 Days</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Password Hashing Algorithm</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">Bcrypt (Salt Rounds: 10)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Email & Invitation Testing Center */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-subtle">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Invitation Link Testing Center</h3>
          </div>
          <button
            onClick={fetchPendingInvites}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          When customers are created, a unique password creation link is issued. Use this testing center to copy or open any active customer invitation link directly in your browser.
        </p>

        <div className="space-y-3">
          {pendingCustomers.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 text-center border border-slate-200 dark:border-slate-800/80 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-900 dark:text-white">No Pending Invitations</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">All customers have set their passwords and are fully active.</p>
            </div>
          ) : (
            pendingCustomers.map((cust) => (
              <div
                key={cust.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{cust.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      Pending Password Set
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{cust.email}</p>
                </div>

                {cust.invite_link && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => copyLink(cust.invite_link, cust.id)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition shadow-sm"
                    >
                      {copiedId === cust.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Setup Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={cust.invite_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Open Link</span>
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
