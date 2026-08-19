import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(phone.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span style={{ color: 'var(--gold)' }}>MB</span> TRADERS
        </div>
        <div className="login-sub">Admin Panel Login</div>

        <div className="field">
          <label>Phone Number</label>
          <input
            type="text"
            placeholder="0300-1234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoFocus
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="error-text">{error}</div>}

        <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }} disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log In'}
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 18, textAlign: 'center' }}>
          Only accounts promoted to admin can log in here. Use your backend's{' '}
          <code>npm run make-admin -- &lt;phone&gt;</code> command to promote one.
        </p>
      </form>
    </div>
  );
}
