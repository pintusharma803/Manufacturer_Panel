import React, { useState, useEffect } from 'react';
import { X, Cpu, Plus, Unlink, AlertCircle, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

export default function CustomerDevicesModal({ isOpen, onClose, customer, onUpdated }) {
  const [assignedDevices, setAssignedDevices] = useState([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceToAssign, setSelectedDeviceToAssign] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && customer) {
      loadData();
    }
  }, [isOpen, customer]);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [custDevsRes, allDevsRes] = await Promise.all([
        api.getCustomerDevices(customer.id),
        api.getDevices({ status: 'AVAILABLE' })
      ]);
      setAssignedDevices(custDevsRes.devices || []);
      setAvailableDevices(allDevsRes.devices || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch customer devices.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !customer) return null;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedDeviceToAssign) return;

    setIsAssigning(true);
    setError('');
    try {
      await api.assignDevice(selectedDeviceToAssign, customer.id);
      setSelectedDeviceToAssign('');
      await loadData();
      onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to assign device.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async (deviceId) => {
    setError('');
    try {
      await api.unassignDevice(deviceId);
      await loadData();
      onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to unassign device.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{customer.name} — Assigned Hardware</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{customer.email} • {assignedDevices.length} active</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Assign Available Device Form */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Assign New Device From Inventory</span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {availableDevices.length} available
              </span>
            </div>

            <form onSubmit={handleAssign} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={selectedDeviceToAssign}
                onChange={(e) => setSelectedDeviceToAssign(e.target.value)}
                disabled={availableDevices.length === 0 || isAssigning}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition disabled:opacity-50 shadow-sm"
              >
                <option value="">
                  {availableDevices.length === 0 ? 'No available devices in inventory' : '-- Select available device --'}
                </option>
                {availableDevices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.model} ({d.unique_id} - SN: {d.serial_number})
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!selectedDeviceToAssign || isAssigning}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-glow transition disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
              >
                {isAssigning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Assign</span>
              </button>
            </form>
          </div>

          {/* Current Assigned Devices List */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Currently Assigned Hardware ({assignedDevices.length})
            </h3>

            {isLoading ? (
              <div className="py-8 flex items-center justify-center text-slate-500 dark:text-slate-400 gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-xs">Loading hardware units...</span>
              </div>
            ) : assignedDevices.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Cpu className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">No devices assigned to this customer</p>
                {/* <p className="text-[11px] text-slate-400 mt-0.5">Use the dropdown above to allocate available devices.</p> */}
              </div>
            ) : (
              <div className="space-y-2.5">
                {assignedDevices.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">{dev.model}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300">
                            {dev.unique_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                          <span>SN: <strong className="text-slate-700 dark:text-slate-300 font-mono">{dev.serial_number}</strong></span>
                          <span>FW: <strong className="text-slate-700 dark:text-slate-300 font-mono">{dev.firmware_version}</strong></span>
                          {dev.assigned_at && (
                            <span>Assigned: {new Date(dev.assigned_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnassign(dev.id)}
                      className="self-end sm:self-auto px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition flex items-center gap-1 shrink-0"
                      title="Unassign device from customer"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Unassign</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
