import React, { useState, useEffect } from 'react';
import { X, Activity, Zap, Radio, Thermometer, Shield, Copy, Check, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

export default function DeviceTelemetryDrawer({ isOpen, onClose, device }) {
  const [telemetry, setTelemetry] = useState([]);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && device) {
      fetchTelemetry();
    }
  }, [isOpen, device]);

  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDeviceTelemetry(device.id);
      setTelemetry(res.telemetry || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !device) return null;

  const copyToken = () => {
    navigator.clipboard.writeText(device.credentials_token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{device.model}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                device.status === 'ASSIGNED' 
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}>
                {device.status}
              </span>
            </div>
            <p className="text-xs text-cyan-700 dark:text-cyan-300 font-mono mt-0.5">{device.unique_id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Hardware Specs Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Hardware Metadata</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Serial Number</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">{device.serial_number}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Firmware</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">{device.firmware_version}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Manufacturing Date</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{device.mfg_date}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Customer Assigned</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium truncate block">{device.customer_name || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          {/* Access Token Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Access Token</span>
              </h3>
              <button
                onClick={copyToken}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium transition"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-indigo-700 dark:text-indigo-300 break-all select-all shadow-sm">
              {device.credentials_token}
            </div>
          </div>

          {/* Real-time Telemetry */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Piezo Telemetry</span>
              </h3>
              <button
                onClick={fetchTelemetry}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {telemetry.map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-[11px] uppercase tracking-wider capitalize">
                      {t.metric.replace('_', ' ')}
                    </span>
                    <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono flex items-baseline gap-1">
                    {t.value}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
