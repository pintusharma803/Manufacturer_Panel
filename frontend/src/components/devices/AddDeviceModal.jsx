import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Cpu, Calendar, CheckCircle2, User, Hash, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

export default function AddDeviceModal({ isOpen, onClose, onDeviceCreated, customers = [] }) {
  const [uniqueId, setUniqueId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('PiezoPulse X100');
  const [customModel, setCustomModel] = useState('');
  const [firmwareVersion, setFirmwareVersion] = useState('');
  const [mfgDate, setMfgDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('AVAILABLE');
  const [customerId, setCustomerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // useEffect(() => {
  //   if (isOpen) {
  //     const randomSN = `PZ-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
  //     setSerialNumber(randomSN);
  //     setError('');
  //   }
  // }, [isOpen]);

  const generateId = async () => {
    try {
      const res = await api.getGeneratedDeviceId();
      if (res.unique_id) {
        setUniqueId(res.unique_id);
      }
    } catch {
      const fallback = `TB-DEV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setUniqueId(fallback);
    }
  };

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === customerId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!serialNumber.trim()) {
      setError('Serial number is required.');
      return;
    }
    if (!mfgDate) {
      setError('Manufacturing date is required.');
      return;
    }
    if (status === 'ASSIGNED' && !customerId) {
      setError('Please select a customer to assign this device to.');
      return;
    }

    const finalModel = model === 'CUSTOM' ? customModel.trim() : model;
    if (!finalModel) {
      setError('Please provide a valid device model.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        unique_id: uniqueId,
        serial_number: serialNumber,
        model: finalModel,
        firmware_version: firmwareVersion,
        mfg_date: mfgDate,
        status,
        customer_id: status === 'ASSIGNED' ? customerId : null,
      };

      await api.createDevice(payload);
      onDeviceCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create device.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Add New Device</h2>
              {/* <p className="text-xs text-slate-500 dark:text-slate-400">Register hardware with auto-generated identifiers</p> */}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Auto-generated Unique ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Device Unique ID
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={uniqueId}
                  onChange={(e) => setUniqueId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-700 dark:text-cyan-300 focus:outline-none focus:border-blue-500 transition"
                  placeholder="TB-DEV-XXXX"
                  required
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Auto-Gen
                </span>
              </div>
              <button
                type="button"
                onClick={generateId}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                title="Generate new ID"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Serial Number & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Serial Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. PZ-100-4821"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Device Model <span className="text-rose-500">*</span>
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="PiezoPulse X100">PiezoPulse X100 (Pulse Sensor)</option>
                <option value="EchoSense Lite">EchoSense Lite (Vibration)</option>
                <option value="PulseNode Pro">PulseNode Pro (High-Freq)</option>
                <option value="Gateway Ultra">Gateway Ultra (Edge Hub)</option>
                <option value="CUSTOM">+ Custom Model...</option>
              </select>
            </div>
          </div>

          {model === 'CUSTOM' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Model Name
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. SensorArray-900"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          )}

          {/* Firmware & Manufacturing Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Firmware Version
              </label>
              <input
                type="text"
                value={firmwareVersion}
                onChange={(e) => setFirmwareVersion(e.target.value)}
                placeholder="e.g. v2.1.0"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Manufacturing Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={mfgDate}
                onChange={(e) => setMfgDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          </div>

          {/* Status Toggle */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Assignment Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => { setStatus('AVAILABLE'); setCustomerId(''); }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${status === 'AVAILABLE'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Available in Inventory</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('ASSIGNED')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${status === 'ASSIGNED'
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Assign to Customer</span>
              </button>
            </div>
          </div>

          {/* Customer Selection if Assigned */}
          {status === 'ASSIGNED' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <User className="w-4 h-4" />
                <span>Customer Assignment Details</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Select Customer <span className="text-rose-500">*</span>
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition shadow-sm"
                  required
                >
                  <option value="">-- Choose a customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email}) {c.company ? `- ${c.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{selectedCustomer.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-300">
                      {selectedCustomer.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{selectedCustomer.email}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-glow transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Adding...' : 'Add Device'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
