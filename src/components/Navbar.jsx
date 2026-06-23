import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = user
    ? [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Draws',     to: '/draws' },
        { label: 'Charities', to: '/charities' },
        ...(isAdmin() ? [{ label: 'Admin', to: '/admin' }] : []),
      ]
    : [
        { label: 'Draws',     to: '/draws' },
        { label: 'Charities', to: '/charities' },
      ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(13,31,15,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(201,168,76,0.15)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '64px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '1.3rem',
            fontWeight: 700, color: 'var(--gold)',
          }}>GolfGive</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}
             className="desktop-nav">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{
              fontSize: '0.875rem', fontWeight: 500,
              color: location.pathname === l.to
                ? 'var(--gold)' : 'rgba(240,237,230,0.7)',
              transition: 'color 0.2s',
            }}>{l.label}</Link>
          ))}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.5)' }}>
                {user.fullName}
              </span>
              <button className="btn-outline"
                      style={{ padding: '0.45rem 1.25rem', fontSize: '0.8rem' }}
                      onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn-outline"
                    style={{ padding: '0.45rem 1.25rem', fontSize: '0.8rem' }}>
                Sign in
              </Link>
              <Link to="/register" className="btn-primary"
                    style={{ padding: '0.45rem 1.25rem', fontSize: '0.8rem' }}>
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)}
                style={{ color: 'var(--cream)', display: 'none' }}
                className="mobile-toggle">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'var(--forest)',
          borderTop: '1px solid var(--border)',
          padding: '1rem 1.5rem',
        }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block', padding: '0.75rem 0',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--cream)', fontSize: '0.95rem',
                  }}>{l.label}</Link>
          ))}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            {user ? (
              <button className="btn-outline" onClick={handleLogout}>Sign out</button>
            ) : (
              <>
                <Link to="/login"    className="btn-outline" onClick={() => setOpen(false)}>Sign in</Link>
                <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}


