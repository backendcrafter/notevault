import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const mapped = {};
        apiErrors.forEach(({ field, message }) => { mapped[field] = message; });
        setErrors(mapped);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container} className="fade-in">
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>NoteVault</span>
        </div>

        <div className="card" style={styles.card}>
          <h1 style={styles.title}>Sign in</h1>
          <p style={styles.subtitle}>Access your encrypted notes</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password" name="password"
                value={form.password} onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>
        </div>

        <p style={styles.hint}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>
            API docs →{' '}
          </span>
          <a href="http://localhost:5000/api/docs" target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
            localhost:5000/api/docs
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    background: 'radial-gradient(ellipse at 60% 40%, rgba(124,106,247,0.06) 0%, transparent 60%)',
  },
  container: { width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { fontSize: 28, color: 'var(--accent)' },
  logoText: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' },
  card: { width: '100%' },
  title: { fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 },
  subtitle: { color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' },
  hint: { textAlign: 'center' },
};
