import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import DevicesPage from './pages/DevicesPage';
import CustomersPage from './pages/CustomersPage';
import DashboardsPage from './pages/DashboardsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SetPasswordPage from './pages/SetPasswordPage';
import { api } from './api/client';

function ProtectedRoute() {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono">Initializing Piezo Pulse...</p>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function PublicLoginRoute() {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono">Initializing Piezo Pulse...</p>
      </div>
    );
  }

  if (user && token) {
    return <Navigate to={from} replace />;
  }

  return <LoginPage />;
}

function MainApp() {
  const { token, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      loadStats();
    }
  }, [token]);

  // If invitation token is present in search parameters but path is not /set-password, redirect
  if (location.search.includes('token=') && location.pathname !== '/set-password') {
    return <Navigate to={`/set-password${location.search}`} replace />;
  }


  const loadStats = async () => {
    try {
      const res = await api.getOverviewStats();
      setStats(res.stats);

      if (isAdmin) {
        const custRes = await api.getCustomers({ status: 'PENDING_INVITE' });
        setPendingInvites(custRes.customers || []);
      }
    } catch (err) {
      console.warn('Stats fetch error:', err.message);
    }
  };

  const handleOpenAddDevice = () => {
    setIsAddDeviceModalOpen(true);
    if (location.pathname !== '/devices') {
      navigate('/devices');
    }
  };

  const handleOpenAddCustomer = () => {
    setIsAddCustomerModalOpen(true);
    if (location.pathname !== '/customers') {
      navigate('/customers');
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicLoginRoute />} />
      <Route
        path="/set-password"
        element={
          <SetPasswordPage
            onPasswordSetSuccess={() => {
              navigate('/login');
            }}
          />
        }
      />

      {/* Authenticated Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <AppLayout
              stats={stats}
              pendingInvites={pendingInvites}
              onOpenAddDevice={handleOpenAddDevice}
              onOpenAddCustomer={handleOpenAddCustomer}
            />
          }
        >
          <Route
            index
            element={
              <HomePage
                stats={stats}
                onNavigate={(tab) => navigate(tab.startsWith('/') ? tab : `/${tab}`)}
                onOpenAddDevice={handleOpenAddDevice}
                onOpenAddCustomer={handleOpenAddCustomer}
              />
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route
            path="/devices"
            element={
              <DevicesPage
                isAddModalOpen={isAddDeviceModalOpen}
                setIsAddModalOpen={setIsAddDeviceModalOpen}
                onDataChanged={loadStats}
              />
            }
          />
          <Route
            path="/customers"
            element={
              isAdmin ? (
                <CustomersPage
                  isAddModalOpen={isAddCustomerModalOpen}
                  setIsAddModalOpen={setIsAddCustomerModalOpen}
                  onDataChanged={loadStats}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/dashboards" element={<DashboardsPage />} />
          <Route
            path="/settings"
            element={
              isAdmin ? (
                <SettingsPage
                  stats={stats}
                  onDataChanged={loadStats}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Route>
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
