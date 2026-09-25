import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Building,
  Phone,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';

export default function AddCustomerModal({ isOpen, onClose, onCustomerCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Result dialog state after creation
  const [createdCustomer, setCreatedCustomer] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Customer Name and Email are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createCustomer({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        status: 'PENDING_INVITE'
      });

      setCreatedCustomer({
        ...res.customer,
        emailDelivery: res.emailDelivery
      });
      onCustomerCreated();
    } catch (err) {
      setError(err.message || 'Failed to create customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (createdCustomer?.invite_link) {
      navigator.clipboard.writeText(createdCustomer.invite_link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDone = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setCreatedCustomer(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {createdCustomer ? 'Customer Registered & Invited!' : 'Add New Customer'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {createdCustomer
                  ? 'Password setup link has been created and emailed'
                  : 'Customer receives an password setup email to activate account'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleDone}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If customer was just created, show success & copyable invite link */}
        {createdCustomer ? (
          <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Customer Registered Successfully</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Customer <strong>{createdCustomer.name}</strong> ({createdCustomer.email}) has been registered with status <strong className="text-amber-600 dark:text-amber-400">Pending Invite</strong>.
              </p>

              {/* Email Delivery Badge */}
              {/* bg-emerald-500/15  border border-emerald-500/30*/}
              {createdCustomer.emailDelivery?.sent ? (
                <div className="flex items-center gap-2 p-2 rounded-xl   text-emerald-700 dark:text-emerald-300 font-semibold">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Set-password invitation email sent to {createdCustomer.email}</span>
                </div>
              ) : createdCustomer.emailDelivery?.error ? (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Email could not be delivered ({createdCustomer.emailDelivery.error}). Please share the link manually.</span>
                </div>
              ) : null}
            </div>

            {/* Ethereal Dev Preview Link if available */}
            {/* {createdCustomer.emailDelivery?.previewUrl && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 font-medium">
                  <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Dev Preview: View dispatched email in Ethereal</span>
                </div>
                <a
                  href={createdCustomer.emailDelivery.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition shadow-sm text-xs"
                >
                  <span>Open Email</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )} */}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password Setup Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdCustomer.invite_link}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-700 dark:text-cyan-300 select-all focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-glow shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                This link was sent in the email. You can also copy it or test it directly in a new tab.
              </p>
            </div>

            {/* <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Next Steps:</span>
              <p>1. The customer visits the link and chooses a secure password.</p>
              <p>2. Once submitted, their status automatically flips to <strong className="text-emerald-600 dark:text-emerald-400">Active</strong> in your customer list.</p>
              <p>3. The customer can then log into the ThingsBoard platform using their credentials.</p>
            </div> */}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 gap-2 flex-wrap">
              <a
                href={createdCustomer.invite_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-700 dark:text-cyan-400 hover:underline font-semibold transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Link in New Tab</span>
              </a>

              <button
                onClick={handleDone}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Customer Name<span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Piezo Pulse"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. piezopulse@example.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                required
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                A set-password link will be automatically generated and emailed to this customer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543562"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Organization
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Piezo Pulse Inc."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

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
                <span>{isSubmitting ? 'Creating & Sending Email...' : 'Create Customer & Send Password Link'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
