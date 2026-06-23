import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Trash2, ShieldCheck } from 'lucide-react';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = () => {
    api.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Change ${user.fullName} to ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${user.id}/role?role=${newRole}`);
      toast.success('Role updated');
      loadUsers();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Delete ${user.fullName}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      toast.success('User deleted');
      loadUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleExpireSub = async (userId) => {
    if (!confirm('Force-expire this subscription?')) return;
    try {
      await api.put(`/admin/users/${userId}/expire-subscription`);
      toast.success('Subscription lapsed');
      loadUsers();
    } catch {
      toast.error('Failed to expire subscription');
    }
  };

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontSize: '0.7rem', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--gold)',
          marginBottom: '0.4rem',
        }}>
          Admin
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem', fontWeight: 700, color: 'var(--cream)',
        }}>
          Users
        </h1>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(240,237,230,0.35)', fontSize: '0.9rem' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {users.map(user => (
            <div key={user.id} style={{
              border: '1px solid var(--border)',
              borderRadius: '8px', overflow: 'hidden',
              background: 'rgba(255,255,255,0.02)',
            }}>
              {/* Row */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem', flexWrap: 'wrap', gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(201,168,76,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold)',
                    flexShrink: 0,
                  }}>
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '0.9rem', fontWeight: 600, color: 'var(--cream)',
                    }}>
                      {user.fullName}
                    </div>
                    <div style={{
                      fontSize: '0.78rem', color: 'rgba(240,237,230,0.4)',
                    }}>
                      {user.email}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  flexWrap: 'wrap',
                }}>
                  {/* Role badge */}
                  <span className="tag" style={{
                    background: user.role === 'ADMIN'
                      ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)',
                    color: user.role === 'ADMIN'
                      ? 'var(--gold)' : 'rgba(240,237,230,0.4)',
                    fontSize: '0.65rem',
                  }}>
                    {user.role}
                  </span>

                  {/* Sub status */}
                  <span className="tag" style={{
                    background: user.activeSubscription
                      ? 'rgba(39,174,96,0.12)' : 'rgba(255,255,255,0.05)',
                    color: user.activeSubscription
                      ? '#7DC67A' : 'rgba(240,237,230,0.3)',
                    fontSize: '0.65rem',
                  }}>
                    {user.activeSubscription ? 'Subscribed' : 'No subscription'}
                  </span>

                  {/* Scores count */}
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem', color: 'rgba(240,237,230,0.35)',
                  }}>
                    {user.scores?.length || 0} scores
                  </span>

                  {/* Actions */}
                  <button
                    onClick={() => handleRoleToggle(user)}
                    title="Toggle role"
                    style={{
                      padding: '0.35rem', color: 'rgba(240,237,230,0.35)',
                      transition: 'color 0.2s', borderRadius: '4px',
                    }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(240,237,230,0.35)'}
                  >
                    <ShieldCheck size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(user)}
                    title="Delete user"
                    style={{
                      padding: '0.35rem', color: 'rgba(240,237,230,0.35)',
                      transition: 'color 0.2s', borderRadius: '4px',
                    }}
                    onMouseOver={e => e.currentTarget.style.color = '#E67E73'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(240,237,230,0.35)'}
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Expand */}
                  <button
                    onClick={() => setOpen(p => p === user.id ? null : user.id)}
                    style={{
                      padding: '0.35rem', color: 'rgba(240,237,230,0.35)',
                      transition: 'color 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--cream)'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(240,237,230,0.35)'}
                  >
                    {open === user.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {open === user.id && (
                <div style={{
                  padding: '1.25rem',
                  borderTop: '1px solid var(--border)',
                  background: 'rgba(0,0,0,0.15)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.25rem',
                }}>
                  {/* Subscription detail */}
                  <div>
                    <p style={{
                      fontSize: '0.7rem', textTransform: 'uppercase',
                      letterSpacing: '0.1em', color: 'var(--gold)',
                      marginBottom: '0.6rem',
                    }}>
                      Subscription
                    </p>
                    {user.activeSubscription ? (
                      <div style={{
                        display: 'flex', flexDirection: 'column', gap: '0.35rem',
                      }}>
                        {[
                          ['Plan', user.activeSubscription.plan],
                          ['Amount', `£${user.activeSubscription.amount}`],
                          ['Renews', user.activeSubscription.renewalDate
                            ? new Date(user.activeSubscription.renewalDate)
                                .toLocaleDateString('en-GB')
                            : '—'],
                        ].map(([k, v]) => (
                          <div key={k} style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: '0.8rem',
                          }}>
                            <span style={{ color: 'rgba(240,237,230,0.4)' }}>{k}</span>
                            <span style={{ color: 'var(--cream)' }}>{v}</span>
                          </div>
                        ))}
                        <button
                          className="btn-danger"
                          onClick={() => handleExpireSub(user.id)}
                          style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                        >
                          Force expire
                        </button>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.3)' }}>
                        No active subscription
                      </p>
                    )}
                  </div>

                  {/* Scores */}
                  <div>
                    <p style={{
                      fontSize: '0.7rem', textTransform: 'uppercase',
                      letterSpacing: '0.1em', color: 'var(--gold)',
                      marginBottom: '0.6rem',
                    }}>
                      Scores
                    </p>
                    {user.scores?.length > 0 ? (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {user.scores.map(s => (
                          <div key={s.id} style={{
                            padding: '0.3rem 0.6rem',
                            background: 'rgba(201,168,76,0.1)',
                            border: '1px solid rgba(201,168,76,0.2)',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem', color: 'var(--gold)',
                          }}>
                            {s.score}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.3)' }}>
                        No scores
                      </p>
                    )}
                  </div>

                  {/* Charity + Winnings */}
                  <div>
                    <p style={{
                      fontSize: '0.7rem', textTransform: 'uppercase',
                      letterSpacing: '0.1em', color: 'var(--gold)',
                      marginBottom: '0.6rem',
                    }}>
                      Charity & winnings
                    </p>
                    <div style={{
                      display: 'flex', flexDirection: 'column', gap: '0.35rem',
                      fontSize: '0.8rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(240,237,230,0.4)' }}>Supporting</span>
                        <span style={{ color: 'var(--cream)' }}>
                          {user.charityName || '—'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(240,237,230,0.4)' }}>Contribution %</span>
                        <span style={{ color: 'var(--cream)' }}>
                          {user.charityPercentage || 10}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(240,237,230,0.4)' }}>Total donated</span>
                        <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
                          £{Number(user.totalDonated || 0).toFixed(2)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(240,237,230,0.4)' }}>Wins</span>
                        <span style={{ color: 'var(--cream)' }}>
                          {user.winnings?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}