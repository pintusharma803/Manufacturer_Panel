import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout({ 
  children, 
  activeTab, 
  setActiveTab, 
  stats, 
  onOpenAddDevice, 
  onOpenAddCustomer, 
  pendingInvites 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        stats={stats}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar 
          activeTab={activeTab}
          onOpenAddDevice={onOpenAddDevice}
          onOpenAddCustomer={onOpenAddCustomer}
          databaseStatus={stats?.database}
          pendingInvites={pendingInvites}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
        />

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50/80 dark:bg-slate-950/60 transition-colors duration-200">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

