import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStaffAuth } from '../context/StaffAuthContext';
import '../admin/admin.css';
import './staff.css';

export default function StaffLogin() {
  const { login, isFirebaseConfigured } = useStaffAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-root">
      <div className="staff-bg-mesh" />
      <div className="admin-login">
        <div className="admin-blob staff-blob-1" />
        <div className="admin-blob staff-blob-2" />

        <div className="admin-login-card staff-login-card">
          <div className="staff-login-icon">👨‍🍳</div>
          <div className="admin-login-logo">HOT<span>SI</span></div>
          <p className="admin-login-sub">Kitchen Staff — Sign in to view orders</p>

          {!isFirebaseConfigured && (
            <div className="admin-warn-box">
              <strong>Firebase not connected.</strong> Add your keys to <code>.env</code>
            </div>
          )}

          {error && <div className="admin-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="admin-field">
              <label className="admin-label">Staff Email</label>
              <input
                type="email"
                className="admin-input"
                placeholder="kitchen@hotsi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!isFirebaseConfigured}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Password</label>
              <input
                type="password"
                className="admin-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!isFirebaseConfigured}
              />
            </div>
            <button type="submit" className="admin-btn staff-btn" disabled={loading || !isFirebaseConfigured}>
              {loading ? 'Signing in…' : 'Sign In to Kitchen'}
            </button>
          </form>

          <div className="staff-login-links">
            <Link to="/" className="admin-back-link">← Back to Website</Link>
            <Link to="/admin" className="admin-back-link">Admin Panel →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
