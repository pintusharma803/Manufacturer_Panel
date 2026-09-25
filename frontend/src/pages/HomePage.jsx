import React from 'react';
import { 
  Cpu, 
  Users, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Plus, 
  ArrowUpRight, 
  Server, 
  Layers, 
  Zap,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage({ 
  stats, 
  onNavigate, 
  onOpenAddDevice, 
  onOpenAddCustomer 
}) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleNav = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      const path = target.startsWith('/') ? target : `/${target}`;
      navigate(path);
    }
  };


  const totalDevices = stats?.totalDevices || 0;
  const availableDevices = stats?.availableDevices || 0;
  const assignedDevices = stats?.assignedDevices || 0;
  const totalCustomers = stats?.totalCustomers || 0;
  const activeCustomers = stats?.activeCustomers || 0;
  const pendingCustomers = stats?.pendingCustomers || 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Devices */}
        <div 
          onClick={() => handleNav('devices')}
          className=" flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 transition cursor-pointer group shadow-sm dark:shadow-subtle"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 ">
            <span className="text-xs font-bold uppercase tracking-wider">Total Devices</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
              <Cpu className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{totalDevices}</span>
            {/* <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5">
              <span className = "hover:underline">View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span> */}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline ">view all</p>
        </div>

        {/* Available Devices */}
        <div 
          onClick={() => handleNav('devices')}
          className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition cursor-pointer group shadow-sm dark:shadow-subtle"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 ">
            <span className="text-xs font-bold uppercase tracking-wider">Available Hardware</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{availableDevices}</span>
            {/* <span className="text-xs px-2 py-0.5 rounded-full  text-blue-600 dark:text-emerald-400 font-medium hover:underline ">
              Ready to assign
            </span> */}
          </div>
          <p className="text-blue-600 text-xs dark:text-emerald-400 font-medium hover:underline ">Ready to assign</p>
        </div>

        {/* Assigned Devices */}
        <div 
          onClick={() => handleNav('devices')}
          className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition cursor-pointer group shadow-sm dark:shadow-subtle"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 ">
            <span className="text-xs font-bold uppercase tracking-wider">Assigned Hardware</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{assignedDevices}</span>
            {/* <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {totalDevices > 0 ? `${Math.round((assignedDevices / totalDevices) * 100)}% active` : '0%'}
            </span> */}
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium ">{totalDevices > 0 ? `${Math.round((assignedDevices / totalDevices) * 100)}% active` : '0%'}</p>
        </div>

        {/* Total Customers */}
        <div 
          onClick={() => isAdmin && handleNav('customers')}
          className={`flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500/50 transition group shadow-sm dark:shadow-subtle ${isAdmin ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 ">
            <span className="text-xs font-bold uppercase tracking-wider">Total Customers</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl  font-extrabold text-slate-900 dark:text-white font-mono">{totalCustomers}</span>
            {pendingCustomers > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full  text-amber-600 dark:text-amber-400 font-bold hover:underline">
                {pendingCustomers} pending invite
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 ">
            {activeCustomers} active 
            {/* : {pendingCustomers} waiting setup */}
          </p>
        </div>
      </div>

      {/* Main Grid: Device Models & Recent Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Hardware Fleet Models Breakdown */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {/* <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" /> */}
              <span>Hardware Models</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Distribution</span>
          </div>

          <div className="space-y-3">
            {stats?.deviceModels?.length ? (
              stats.deviceModels.map((m, idx) => {
                const percentage = totalDevices > 0 ? Math.round((m.count / totalDevices) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{m.model}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">{m.count} units ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-[3px] overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 h-[3px] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No devices registered yet</p>
            )}
          </div>

          <button
            onClick={() => handleNav('dashboards')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Open Telemetry Dashboard</span>
          </button>
        </div>

        {/* Recent Provisioned Devices */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {/* <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> */}
              <span>Recently Registered Devices</span>
            </h3>
            <button
              onClick={() => handleNav('devices')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View Full Inventory
            </button>
          </div>

          <div className="space-y-2.5">
            {stats?.recentDevices?.length ? (
              stats.recentDevices.map((dev) => (
                <div
                  key={dev.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{dev.model}</span>
                        {/* <span className="text-[10px] font-mono px-1.5 py-0.2 rounded  text-cyan-700 dark:text-cyan-300">
                          {dev.unique_id}
                        </span> */}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        SN:{" "} 
                        <strong className="text-slate-700 dark:text-slate-300 font-mono">{dev.serial_number}</strong>{" "}
                        FW:{" "} 
                        <strong className="text-slate-700 dark:text-slate-300 font-mono">{dev.firmware_version}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      dev.status === 'ASSIGNED'
                        ? ' text-blue-600 dark:text-blue-400  '
                        : ' text-emerald-600 dark:text-emerald-400 '
                    }`}>
                      {dev.status}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {dev.customer_name ? dev.customer_name : 'Available in pool'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">No devices found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log / Event Feed */}
      {isAdmin && stats?.recentActivity?.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {/* <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> */}
              <span>Platform Audit & Security Event Stream</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">activity tracking</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.recentActivity.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-3"
              >
                <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-cyan-700 dark:text-cyan-300 uppercase font-bold truncate">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5 truncate">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
