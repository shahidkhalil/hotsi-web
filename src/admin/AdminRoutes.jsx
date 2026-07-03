import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminOrders from './AdminOrders';
import AdminMenu from './AdminMenu';
import AdminSettings from './AdminSettings';

function AdminSpinner() {
  return (
    <div className="admin-root">
      <div className="admin-bg-mesh" />
      <div className="admin-loader">
        <div className="admin-loader-logo">HOT<span>SI</span></div>
        <div className="admin-loader-bar"><div className="admin-loader-fill" /></div>
        <p className="admin-loader-text">Loading admin panel…</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <AdminSpinner />;
  if (!user || !isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoutesInner() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <AdminSpinner />;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user && isAdmin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default function AdminRoutes() {
  return (
    <AuthProvider>
      <AdminRoutesInner />
    </AuthProvider>
  );
}
