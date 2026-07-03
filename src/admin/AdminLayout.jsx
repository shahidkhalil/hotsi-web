import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './admin.css';

const NAV = [
  { to: '/admin/dashboard', end: true, icon: '📊', label: 'Dashboard' },
  { to: '/admin/orders', icon: '🛒', label: 'Orders' },
  { to: '/admin/menu', icon: '🍔', label: 'Menu' },
  { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initial = (user?.email?.[0] || 'A').toUpperCase();

  const currentPage = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label || 'Admin';
  const isDashboard = location.pathname === '/admin/dashboard';

  const handleBack = () => {
    if (isDashboard) navigate('/');
    else navigate('/admin/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  return (
    <div className="admin-root">
      <div className="admin-bg-mesh" />
      <div className="admin-bg-grid" />
      <div className={`admin-sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-head">
          <Link to="/admin/dashboard" className="admin-sidebar-logo" onClick={() => setSidebarOpen(false)}>
            HOT<span>SI</span>
          </Link>
          <span className="admin-sidebar-badge">Admin Panel</span>
        </div>

        <div className="admin-nav-label">Main Menu</div>
        <div className="admin-nav" role="navigation" aria-label="Admin navigation">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <span className="admin-nav-icon-wrap"><span className="admin-nav-icon">{n.icon}</span></span>
              <span className="admin-nav-text">{n.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="admin-sidebar-foot">
          <div className="admin-user">
            <div className="admin-avatar">{initial}</div>
            <div className="admin-user-info">
              <div className="admin-user-name">Admin</div>
              <div className="admin-user-email" title={user?.email}>{user?.email}</div>
            </div>
          </div>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <button type="button" className="admin-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <span /><span /><span />
            </button>
            <div>
              <h1 className="admin-header-title">{currentPage}</h1>
              <p className="admin-header-breadcrumb">HOTSI / {currentPage}</p>
            </div>
          </div>
          <div className="admin-header-right">
            <button type="button" className="admin-header-back" onClick={handleBack}>
              ← {isDashboard ? 'Website' : 'Dashboard'}
            </button>
            <Link to="/" className="admin-header-link">View Website</Link>
          </div>
        </header>

        <div className="admin-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
