import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './admin.css';

export default function AdminLogin() {
  const { login, isFirebaseConfigured } = useAuth();
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
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-root">
      <div className="admin-login">
        <div className="admin-login-bg" />
        <div className="admin-blob admin-blob-1" />
        <div className="admin-blob admin-blob-2" />

        <div className="admin-login-card">
          <div className="admin-login-logo">HOT<span>SI</span></div>
          <p className="admin-login-sub">Admin Panel — Sign in to manage your restaurant</p>

          {!isFirebaseConfigured && (
            <div className="admin-warn-box">
              <strong>Firebase not connected.</strong><br />
              Create a <code>.env</code> file with your Firebase keys. Follow <strong>FIREBASE_SETUP.md</strong> for step-by-step instructions.
            </div>
          )}

          {error && <div className="admin-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="admin-field">
              <label className="admin-label">Email</label>
              <input
                type="email"
                className="admin-input"
                placeholder="admin@hotsi.com"
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
            <button type="submit" className="admin-btn" disabled={loading || !isFirebaseConfigured}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <Link to="/" className="admin-back-link">← Back to HOTSI Website</Link>
        </div>
      </div>
    </div>
  );
}
