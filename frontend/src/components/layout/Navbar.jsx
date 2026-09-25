import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Database, 
  Plus, 
  User, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Radio, 
  ChevronDown, 
  Menu, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ 
  activeTab, 
  onOpenAddDevice, 
  onOpenAddCustomer, 
  databaseStatus,
  pendingInvites = [],
  onToggleMobileMenu
}) {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabLabels = {
    home: { title: 'Platform Overview', subtitle: 'Real-time telemetry and fleet metrics' },
    customers: { title: 'Customer Management', subtitle: 'Tenants, credential invitations & assigned hardware' },
    devices: { title: 'Device Inventory', subtitle: 'Provision, assign, and monitor piezo hardware units' },
    dashboards: { title: 'Live Telemetry Dashboard', subtitle: 'Time-series sensor telemetry and pulse visualization' },
    settings: { title: 'Platform Settings', subtitle: 'System configuration and database connection' }
  };

  const getActiveKey = () => {
    const path = location.pathname.toLowerCase();
    if (path === '/' || path === '/home') return 'home';
    if (path.startsWith('/customers')) return 'customers';
    if (path.startsWith('/devices')) return 'devices';
    if (path.startsWith('/dashboards')) return 'dashboards';
    if (path.startsWith('/settings')) return 'settings';
    return activeTab || 'home';
  };

  const currentTab = tabLabels[getActiveKey()] || { title: 'Dashboard', subtitle: 'IoT Fleet Overview' };

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      {/* Left: Mobile Menu Trigger + Title & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition md:hidden"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {currentTab.title}
            </h1>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md hidden xs:inline-block ${
              isAdmin 
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' 
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}>
              {isAdmin ? 'Tenant Admin' : 'Customer Portal'}
            </span>
          </div>
          {/* <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{currentTab.subtitle}</p> */}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Database engine status pill */}

        {/* <div 
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300"
          title={`Database connected: ${databaseStatus?.engine || 'PostgreSQL'}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Database className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="font-medium text-slate-800 dark:text-slate-200">{databaseStatus?.engine || 'PostgreSQL'}</span>
        </div> */}

        {/* Quick Action Buttons for Admin (Hidden on very small screens) */}
        {/* {isAdmin && (
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onOpenAddDevice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Device</span>
            </button>
            <button
              onClick={onOpenAddCustomer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Customer</span>
            </button>
          </div>
        )} */}

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition flex items-center justify-center shadow-sm"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Notifications / Invites Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            title="Recent Invitations & Notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingInvites.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                {pendingInvites.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Pending Invites ({pendingInvites.length})
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Awaiting Setup</span>
              </div>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {pendingInvites.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">No pending invitations. All active!</p>
                ) : (
                  pendingInvites.map((cust) => (
                    <div key={cust.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{cust.name}</span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Invite Ready</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{cust.email}</p>
                      {cust.invite_link && (
                        <a
                          href={cust.invite_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium pt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Password Link</span>
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-semibold bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300">
                  {user?.role}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { logout(); setShowUserMenu(false); navigate('/login'); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
