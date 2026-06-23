import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Trophy,
  Heart, CheckSquare
} from 'lucide-react';

const links = [
  { to: '/admin',            label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users',      label: 'Users',     icon: Users },
  { to: '/admin/draws',      label: 'Draws',     icon: Trophy },
  { to: '/admin/charities',  label: 'Charities', icon: Heart },
  { to: '/admin/winners',    label: 'Winners',   icon: CheckSquare },
];

export default function AdminLayout() {
  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0,
        background: 'var(--charcoal)',
        borderRight: '1px solid var(--border)',
        padding: '2rem 0',
        position: 'sticky', top: '64px',
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
      }}>
        <p style={{
          fontSize: '0.65rem', letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(240,237,230,0.25)',
          padding: '0 1.5rem', marginBottom: '0.75rem',
        }}>
          Admin panel
        </p>

        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.7rem 1.5rem',
            fontSize: '0.875rem', fontWeight: 500,
            color: isActive ? 'var(--gold)' : 'rgba(240,237,230,0.55)',
            background: isActive ? 'rgba(201,168,76,0.08)' : 'none',
            borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
            transition: 'all 0.15s',
            textDecoration: 'none',
          })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
}