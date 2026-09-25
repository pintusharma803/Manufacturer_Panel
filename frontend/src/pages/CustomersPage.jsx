import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Users,
  Mail,
  Phone,
  Building,
  Layers,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import AddCustomerModal from '../components/customers/AddCustomerModal';
import CustomerDevicesModal from '../components/customers/CustomerDevicesModal';
import Pagination from '../components/common/Pagination';

export default function CustomersPage({ isAddModalOpen, setIsAddModalOpen, onDataChanged }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1
  });

  // Modals state
  const [managingDevicesCustomer, setManagingDevicesCustomer] = useState(null);
  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [resendNotice, setResendNotice] = useState(null);

  const fetchCustomers = async (targetPage = currentPage, targetLimit = pageSize) => {
    setIsLoading(true);
    try {
      const res = await api.getCustomers({
        search,
        status: statusFilter,
        page: targetPage,
        limit: targetLimit
      });
      setCustomers(res.customers || []);
      if (res.pagination) {
        setPagination(res.pagination);
        if (targetPage > res.pagination.totalPages && res.pagination.totalPages > 0) {
          setCurrentPage(res.pagination.totalPages);
        }
      } else {
        setPagination({
          total: res.customers?.length || 0,
          page: 1,
          limit: targetLimit,
          totalPages: 1
        });
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      return next;
    });
    fetchCustomers(1, pageSize);
  }, [search, statusFilter]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newPage === 1) {
        next.delete('page');
      } else {
        next.set('page', String(newPage));
      }
      return next;
    });
    fetchCustomers(newPage, pageSize);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      return next;
    });
    fetchCustomers(1, newSize);
  };


  const handleResendInvite = async (id, email) => {
    setResendingId(id);
    try {
      const res = await api.resendInvite(id);
      await fetchCustomers();
      if (res.invite_link) {
        navigator.clipboard.writeText(res.invite_link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
      }
      setResendNotice({
        email: email,
        sent: res.emailDelivery?.sent,
        previewUrl: res.emailDelivery?.previewUrl,
        error: res.emailDelivery?.error
      });
      setTimeout(() => setResendNotice(null), 7000);
    } catch (err) {
      alert(err.message || 'Failed to regenerate invite.');
    } finally {
      setResendingId(null);
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await api.deleteCustomer(id);
      setDeleteConfirmCustomer(null);
      fetchCustomers();
      onDataChanged();
    } catch (err) {
      alert(err.message || 'Failed to delete customer.');
    }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-subtle">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, email, or company..."
            className="w-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Status Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'PENDING_INVITE', label: 'Pending Invite' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statusFilter === st.id
                  ? 'bg-blue-600 text-white shadow-glow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Resend Notice Alert */}
      {resendNotice && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Mail className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              {resendNotice.sent
                ? `Invitation email successfully resent to ${resendNotice.email} with set-password link.`
                : `New invitation link generated for ${resendNotice.email}. (Email delivery note: ${resendNotice.error || 'Check SMTP configuration'})`}
            </span>
          </div>
          {resendNotice.previewUrl && (
            <a
              href={resendNotice.previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline font-semibold text-xs shrink-0"
            >
              <span>View Test Email (Ethereal)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Customer Table */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-500" />
          <p className="text-xs">Loading customer directory...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No customers found</h3>
          {search || statusFilter !== 'ALL' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try modifying your filter options.
            </p>
          ) : null}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Customer / Organization</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Hardware</th>
                  {/* <th className="py-3.5 px-4">Password Setup Link</th> */}
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition">
                    {/* Name & Company */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-700 dark:text-white text-sm">{cust.name}</div>
                      {cust.company && <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{cust.company}</span>
                      </div>}
                    </td>

                    {/* Email & Phone */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{cust.email}</div>
                      {cust.phone && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {cust.phone}
                      </div>}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cust.status === 'ACTIVE'
                        ? ' text-emerald-600 dark:text-emerald-400 '
                        : ' text-amber-600 dark:text-amber-400 '
                        }`}>
                        {/* <span className={`w-1.5 h-1.5 rounded-full ${cust.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span> */}
                        <span>{cust.status === 'ACTIVE' ? 'Active' : 'Pending'}</span>
                      </span>
                    </td>

                    {/* Assigned Hardware */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setManagingDevicesCustomer(cust)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg     text-blue-600 dark:text-blue-400 hover:underline transition"
                      >
                        {/* <Layers className="w-3.5 h-3.5" /> */}
                        <span className="font-semibold">{cust.assigned_device_count} devices</span>
                        {/* <span className="text-[10px] text-slate-400">Manage →</span> */}
                      </button>
                    </td>

                    {/* Password Setup Link */}
                    {/* <td className="py-3.5 px-4">
                      {cust.status === 'PENDING_INVITE' && cust.invite_link ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyLink(cust.invite_link, cust.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-[11px] font-medium transition"
                            title="Copy setup link to send to customer"
                          >
                            {copiedId === cust.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <a
                            href={cust.invite_link}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                            title="Test open set-password link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Credentials Active</span>
                        </div>
                      )}
                    </td> */}

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {cust.status === 'PENDING_INVITE' && (
                          <button
                            onClick={() => handleResendInvite(cust.id, cust.email)}
                            disabled={resendingId === cust.id}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                            title="Resend invitation email & generate fresh link"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${resendingId === cust.id ? 'animate-spin' : ''}`} />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteConfirmCustomer(cust)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition"
                          title="Delete customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 sm:px-6 pb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[5, 10, 20, 50]}
              itemName="customers"
            />
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCustomerCreated={() => { fetchCustomers(); onDataChanged(); }}
      />

      {/* Customer Assigned Devices Modal */}
      <CustomerDevicesModal
        isOpen={!!managingDevicesCustomer}
        onClose={() => setManagingDevicesCustomer(null)}
        customer={managingDevicesCustomer}
        onUpdated={() => { fetchCustomers(); onDataChanged(); }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 w-fit">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Customer?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Are you sure you want to delete <strong>{deleteConfirmCustomer.name}</strong>? Any assigned devices will automatically revert to <strong>Available</strong> status in inventory.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCustomer(deleteConfirmCustomer.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition"
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
