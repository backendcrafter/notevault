import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to NoteVault.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
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
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>Start capturing your thoughts securely</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text" name="name"
                value={form.name} onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

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
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                autoComplete="new-password"
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create account'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
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
    background: 'radial-gradient(ellipse at 40% 60%, rgba(124,106,247,0.06) 0%, transparent 60%)',
  },
  container: { width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { fontSize: 28, color: 'var(--accent)' },
  logoText: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' },
  card: { width: '100%' },
  title: { fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 },
  subtitle: { color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' },
};
