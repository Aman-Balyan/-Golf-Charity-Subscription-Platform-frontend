import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', paddingTop: '64px',
      background: 'linear-gradient(160deg, #0D1F0F 60%, #162A18 100%)',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '440px',
        margin: '2rem 1.5rem', position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)',
            display: 'block', marginBottom: '2rem',
          }}>
            GolfGive
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem', fontWeight: 700, color: 'var(--cream)',
            marginBottom: '0.5rem',
          }}>
            Welcome back
          </h1>
          <p style={{ color: 'rgba(240,237,230,0.5)', fontSize: '0.95rem' }}>
            Sign in to your account
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label">Email address</label>
              <input
                className="input-field"
                type="email" name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="label">Password</label>
              <input
                className="input-field"
                type="password" name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%', textAlign: 'center',
                padding: '0.875rem',
                opacity: loading ? 0.7 : 1,
                fontSize: '0.95rem',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="divider" />

          <p style={{
            textAlign: 'center',
            fontSize: '0.875rem', color: 'rgba(240,237,230,0.5)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: 'var(--gold)', fontWeight: 500,
            }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}