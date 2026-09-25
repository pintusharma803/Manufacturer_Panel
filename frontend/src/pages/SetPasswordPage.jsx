import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  ShieldCheck,
  ArrowRight,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export default function SetPasswordPage({ onPasswordSetSuccess }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [token, setToken] = useState('');
  const [customer, setCustomer] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (!tokenParam) {
      setError('No invitation token found in link.');
      setIsLoading(false);
      return;
    }

    setToken(tokenParam);
    verifyToken(tokenParam);
  }, []);

  const verifyToken = async (tok) => {
    try {
      const res = await api.verifyInviteToken(tok);
      setCustomer(res.customer);
    } catch (err) {
      setError(err.message || 'Invitation token is invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.setPassword({ token, password });
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to establish password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Theme toggle top-right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-md transition flex items-center gap-2 text-xs font-semibold"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-glow mb-1">
            <Zap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Piezo Pulse IoT Platform</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Customer Credential & Account Activation</p>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-500" />
            <p className="text-xs">Verifying invitation link...</p>
          </div>
        ) : error && !isSuccess ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Invalid Invitation Link</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">{error}</p>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold transition"
            >
              Back to Home
            </button>
          </div>
        ) : isSuccess ? (
          <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-glow-emerald">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Password Successfully Created!</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your account for <strong className="text-slate-900 dark:text-white">{customer?.email}</strong> is now <strong className="text-emerald-600 dark:text-emerald-400">Active</strong> in the ThingsBoard system.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-left space-y-1">
              <p>✓ Status updated to Active on administrator dashboard</p>
              <p>✓ Telemetry access permissions granted</p>
              <p>✓ Hardware assignment synchronization complete</p>
            </div>

            <button
              onClick={() => { window.location.href = '/'; }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-glow transition flex items-center justify-center gap-2"
            >
              <span>Sign In with New Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Activating Account:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{customer?.name}</span>
              </div>
              <p className="text-xs font-mono text-cyan-700 dark:text-cyan-300">{customer?.email}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-glow transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Activating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Set Password & Activate</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
