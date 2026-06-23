import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, DollarSign } from 'lucide-react';

const MATCH_LABEL = {
  FIVE_MATCH:  { label: 'Jackpot — 5 match', color: 'var(--gold)' },
  FOUR_MATCH:  { label: 'Major — 4 match',   color: '#7DC67A' },
  THREE_MATCH: { label: 'Entry — 3 match',   color: 'rgba(240,237,230,0.5)' },
};

export default function AdminWinners() {
  const [winners,  setWinners]  = useState([]);
  const [filter,   setFilter]   = useState('ALL');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { loadWinners(); }, []);

  const loadWinners = () => {
    api.get('/winners')
      .then(r => setWinners(r.data))
      .catch(() => toast.error('Failed to load winners'))
      .finally(() => setLoading(false));
  };

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/winners/${id}/verify`, { status });
      toast.success(`Winner ${status.toLowerCase()}`);
      loadWinners();
    } catch {
      toast.error('Failed to update verification');
    }
  };

  const handlePay = async (id) => {
    if (!confirm('Mark this winner as paid?')) return;
    try {
      await api.put(`/winners/${id}/pay`);
      toast.success('Marked as paid');
      loadWinners();
    } catch {
      toast.error('Failed to mark as paid');
    }
  };

  const filters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'PAID'];

  const filtered = winners.filter(w => {
    if (filter === 'ALL')      return true;
    if (filter === 'PAID')     return w.payoutStatus === 'PAID';
    if (filter === 'PENDING')  return w.verificationStatus === 'PENDING';
    if (filter === 'APPROVED') return w.verificationStatus === 'APPROVED' && w.payoutStatus !== 'PAID';
    if (filter === 'REJECTED') return w.verificationStatus === 'REJECTED';
    return true;
  });

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontSize: '0.7rem', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem',
        }}>Admin</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem', fontWeight: 700, color: 'var(--cream)',
        }}>Winners</h1>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap',
      }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.4rem 1rem', borderRadius: '100px',
            fontSize: '0.78rem', fontWeight: 500,
            background: filter === f ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
            color: filter === f ? 'var(--forest)' : 'rgba(240,237,230,0.5)',
            border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)',
            transition: 'all 0.15s', cursor: 'pointer',
          }}>
            {f}
            {f !== 'ALL' && (
              <span style={{ marginLeft: '0.35rem', opacity: 0.7 }}>
                ({winners.filter(w => {
                  if (f === 'PAID')     return w.payoutStatus === 'PAID';
                  if (f === 'PENDING')  return w.verificationStatus === 'PENDING';
                  if (f === 'APPROVED') return w.verificationStatus === 'APPROVED' && w.payoutStatus !== 'PAID';
                  if (f === 'REJECTED') return w.verificationStatus === 'REJECTED';
                  return false;
                }).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'rgba(240,237,230,0.35)', fontSize: '0.9rem' }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          color: 'rgba(240,237,230,0.3)', fontSize: '0.9rem',
        }}>
          No winners in this category
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(w => {
            const meta = MATCH_LABEL[w.matchType];
            return (
              <div key={w.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem',
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.9rem', fontWeight: 600,
                      color: 'var(--cream)', marginBottom: '0.25rem',
                    }}>
                      {w.userFullName}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '0.5rem', flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontSize: '0.78rem', color: meta?.color || 'var(--gold)',
                        fontWeight: 500,
                      }}>
                        {meta?.label}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.95rem', color: 'var(--gold)',
                      }}>
                        £{Number(w.prizeAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="tag" style={{
                      fontSize: '0.65rem',
                      background: w.verificationStatus === 'APPROVED'
                        ? 'rgba(39,174,96,0.15)'
                        : w.verificationStatus === 'REJECTED'
                        ? 'rgba(192,57,43,0.15)' : 'rgba(255,255,255,0.06)',
                      color: w.verificationStatus === 'APPROVED'
                        ? '#7DC67A'
                        : w.verificationStatus === 'REJECTED'
                        ? '#E67E73' : 'rgba(240,237,230,0.4)',
                    }}>
                      {w.verificationStatus}
                    </span>
                    <span className="tag" style={{
                      fontSize: '0.65rem',
                      background: w.payoutStatus === 'PAID'
                        ? 'rgba(39,174,96,0.15)' : 'rgba(255,255,255,0.06)',
                      color: w.payoutStatus === 'PAID'
                        ? '#7DC67A' : 'rgba(240,237,230,0.4)',
                    }}>
                      {w.payoutStatus}
                    </span>
                  </div>
                </div>

                {/* Proof link */}
                {w.proofUrl && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <a href={w.proofUrl} target="_blank" rel="noreferrer"
                      style={{
                        fontSize: '0.78rem', color: 'var(--gold)',
                        textDecoration: 'underline',
                      }}>
                      View proof screenshot ↗
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  marginTop: '1rem', paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  display: 'flex', gap: '0.6rem', flexWrap: 'wrap',
                }}>
                  {w.verificationStatus === 'PENDING' && w.proofUrl && (
                    <>
                      <button
                        onClick={() => handleVerify(w.id, 'APPROVED')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.35rem',
                          padding: '0.45rem 0.9rem', borderRadius: '4px',
                          background: 'rgba(39,174,96,0.15)',
                          color: '#7DC67A', fontSize: '0.8rem', fontWeight: 600,
                          border: '1px solid rgba(39,174,96,0.25)',
                          cursor: 'pointer',
                        }}
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleVerify(w.id, 'REJECTED')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.35rem',
                          padding: '0.45rem 0.9rem', borderRadius: '4px',
                          background: 'rgba(192,57,43,0.12)',
                          color: '#E67E73', fontSize: '0.8rem', fontWeight: 600,
                          border: '1px solid rgba(192,57,43,0.2)',
                          cursor: 'pointer',
                        }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                  {w.verificationStatus === 'PENDING' && !w.proofUrl && (
                    <span style={{
                      fontSize: '0.78rem', color: 'rgba(240,237,230,0.3)',
                    }}>
                      Awaiting proof upload from winner
                    </span>
                  )}
                  {w.verificationStatus === 'APPROVED' && w.payoutStatus === 'PENDING' && (
                    <button
                      onClick={() => handlePay(w.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.45rem 0.9rem', borderRadius: '4px',
                        background: 'rgba(201,168,76,0.12)',
                        color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600,
                        border: '1px solid rgba(201,168,76,0.25)',
                        cursor: 'pointer',
                      }}
                    >
                      <DollarSign size={14} /> Mark as paid
                    </button>
                  )}
                  {w.payoutStatus === 'PAID' && (
                    <span style={{ fontSize: '0.78rem', color: '#7DC67A' }}>
                      ✓ Paid out
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}