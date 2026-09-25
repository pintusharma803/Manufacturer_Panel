import React, { useState } from 'react';
import { X, UserCheck, AlertCircle, RefreshCw, Unlink } from 'lucide-react';
import { api } from '../../api/client';

export default function AssignCustomerModal({ isOpen, onClose, device, customers = [], onAssigned }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !device) return null;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await api.assignDevice(device.id, selectedCustomerId);
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign device.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await api.unassignDevice(device.id);
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to unassign device.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Manage Device Assignment</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{device.unique_id} ({device.serial_number})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleAssign} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Status Info */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Current Assignment:</span>
            {device.status === 'ASSIGNED' ? (
              <div>
                <p className="font-semibold text-blue-600 dark:text-blue-400">{device.customer_name || 'Assigned Customer'}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">{device.customer_email}</p>
              </div>
            ) : (
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">Currently Unassigned (Available)</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assign to Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition shadow-sm"
              required
            >
              <option value="">-- Choose target customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 gap-2 flex-wrap">
            {device.status === 'ASSIGNED' ? (
              <button
                type="button"
                onClick={handleUnassign}
                disabled={isSubmitting}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 transition flex items-center gap-1.5"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Unassign Device</span>
              </button>
            ) : <div></div>}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-glow transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
