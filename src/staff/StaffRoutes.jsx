import { Routes, Route, Navigate } from 'react-router-dom';
import { StaffAuthProvider, useStaffAuth } from '../context/StaffAuthContext';
import StaffLogin from './StaffLogin';
import StaffLayout from './StaffLayout';
import StaffOrders from './StaffOrders';

function StaffSpinner() {
  return (
    <div className="staff-root">
      <div className="staff-bg-mesh" />
      <div className="admin-loader">
        <div className="admin-loader-logo">HOT<span>SI</span></div>
        <div className="admin-loader-bar"><div className="admin-loader-fill" /></div>
        <p className="admin-loader-text">Loading kitchen panel…</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, isStaff, loading } = useStaffAuth();
  if (loading) return <StaffSpinner />;
  if (!user || !isStaff) return <Navigate to="/staff" replace />;
  return children;
}

function StaffRoutesInner() {
  const { user, isStaff, loading } = useStaffAuth();

  if (loading) return <StaffSpinner />;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user && isStaff ? <Navigate to="/staff/orders" replace /> : <StaffLogin />
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route path="orders" element={<StaffOrders />} />
      </Route>
      <Route path="*" element={<Navigate to="/staff" replace />} />
    </Routes>
  );
}

export default function StaffRoutes() {
  return (
    <StaffAuthProvider>
      <StaffRoutesInner />
    </StaffAuthProvider>
  );
}
