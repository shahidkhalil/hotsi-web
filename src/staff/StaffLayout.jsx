import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../context/StaffAuthContext';
import '../admin/admin.css';
import './staff.css';

export default function StaffLayout() {
  const { user, staffProfile, logout } = useStaffAuth();
  const navigate = useNavigate();
  const name = staffProfile?.name || user?.email?.split('@')[0] || 'Staff';
  const initial = name[0].toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/staff');
  };

  return (
    <div className="staff-root">
      <div className="staff-bg-mesh" />
      <div className="staff-bg-grid" />

      <header className="staff-header">
        <div className="staff-header-left">
          <Link to="/staff/orders" className="staff-logo">HOT<span>SI</span> Kitchen</Link>
          <span className="staff-live">● Live orders</span>
        </div>
        <div className="staff-header-right">
          <div className="staff-user-chip">
            <span className="staff-avatar">{initial}</span>
            <span>{name}</span>
          </div>
          <Link to="/" className="staff-header-btn">← Website</Link>
          <button type="button" className="staff-header-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
}
