import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Cpu,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  stats,
  isMobileOpen,
  setIsMobileOpen
}) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'home', path: '/', label: 'Home', icon: Home, badge: null, role: 'ALL' },
    { id: 'dashboards', path: '/dashboards', label: 'Dashboards', icon: Activity, badge: 'LIVE', role: 'ALL' },
    { id: 'devices', path: '/devices', label: 'Devices', icon: Cpu, badge: stats?.totalDevices ?? null, role: 'ALL' },
    { id: 'customers', path: '/customers', label: 'Customers', icon: Users, badge: isAdmin ? (stats?.totalCustomers ?? null) : null, role: 'MANUFACTURER' },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings, badge: null, role: 'ADMIN' },
  ];

  const visibleMenuItems = menuItems.filter(item => item.role === 'ALL' || (item.role === 'ADMIN' && isAdmin));

  const isItemActive = (item) => {
    if (item.path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-150"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 select-none ${isMobileOpen ? 'translate-x-0 w-54 shadow-2xl' : '-translate-x-full md:translate-x-0'
          } ${isCollapsed ? 'md:w-20' : 'md:w-54'
          }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 backdrop-blur">
          <Link
            to="/"
            className="flex items-center gap-3 overflow-hidden cursor-pointer"
            onClick={handleLinkClick}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-glow text-white shrink-0">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="leading-tight truncate">
                <span className="font-bold text-base tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-600 dark:from-blue-400 to-cyan-500 dark:to-cyan-300">
                  PiezoPulse
                </span>
                <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  IoT Platform
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition hidden md:flex"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition md:hidden"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={handleLinkClick}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${isActive
                    ? 'bg-blue-600 text-white shadow-glow'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`} />

                {(!isCollapsed || isMobileOpen) && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== null && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${item.badge === 'LIVE'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse'
                          : isActive
                            ? 'bg-blue-800/80 text-blue-100'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* User / Session Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mb-2 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <div className="overflow-hidden leading-tight flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-500/10 transition group ${isCollapsed && !isMobileOpen ? 'justify-center' : ''
              }`}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
