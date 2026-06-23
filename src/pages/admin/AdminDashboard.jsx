import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, Trophy, Heart, CreditCard, Clock, Award } from 'lucide-react';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    {
      label: 'Total users',
      value: stats.totalUsers,
      icon: Users, color: 'var(--gold)',
    },
    {
      label: 'Active subscribers',
      value: stats.activeSubscribers,
      icon: CreditCard, color: '#7DC67A',
    },
    {
      label: 'Total prize pool',
      value: `£${Number(stats.totalPrizePool || 0).toFixed(2)}`,
      icon: Trophy, color: 'var(--gold)',
    },
    {
      label: 'Charity contributions',
      value: `£${Number(stats.totalCharityContributions || 0).toFixed(2)}`,
      icon: Heart, color: '#E8A87C',
    },
    {
      label: 'Draws published',
      value: stats.totalDrawsPublished,
      icon: Award, color: 'var(--gold)',
    },
    {
      label: 'Pending verifications',
      value: stats.pendingVerifications,
      icon: Clock,
      color: stats.pendingVerifications > 0 ? '#E67E73' : 'rgba(240,237,230,0.4)',
    },
  ] : [];

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{
          fontSize: '0.7rem', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--gold)',
          marginBottom: '0.4rem',
        }}>
          Overview
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem', fontWeight: 700, color: 'var(--cream)',
        }}>
          Admin Dashboard
        </h1>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(240,237,230,0.35)', fontSize: '0.9rem' }}>
          Loading…
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}>
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="card" style={{ padding: '1.5rem' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', marginBottom: '1rem',
                }}>
                  <p style={{
                    fontSize: '0.78rem', color: 'rgba(240,237,230,0.45)',
                    fontWeight: 500,
                  }}>
                    {card.label}
                  </p>
                  <Icon size={16} color={card.color} />
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.8rem', fontWeight: 500,
                  color: card.color, lineHeight: 1,
                }}>
                  {card.value}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}