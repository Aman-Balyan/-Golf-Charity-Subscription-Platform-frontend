import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Trophy, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MATCH_LABEL = {
  FIVE_MATCH:  { label: 'Jackpot — 5 match', color: 'var(--gold)' },
  FOUR_MATCH:  { label: 'Major — 4 match',   color: '#7DC67A' },
  THREE_MATCH: { label: 'Entry — 3 match',   color: 'rgba(240,237,230,0.5)' },
};

export default function Draws() {
  const [draws,   setDraws]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(null); // expanded draw id

  useEffect(() => {
    api.get('/draws/published')
      .then(r => setDraws(r.data))
      .catch(() => toast.error('Failed to load draws'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setOpen(prev => prev === id ? null : id);

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        padding: '4rem 0 3rem',
        background: 'linear-gradient(160deg, #0D1F0F 60%, #162A18 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <span className="tag tag-gold" style={{ marginBottom: '1rem' }}>
            Monthly draws
          </span>
          <h1 className="section-title" style={{ marginBottom: '1rem' }}>
            Draw results
          </h1>
          <p style={{
            color: 'rgba(240,237,230,0.55)', fontSize: '1rem',
            maxWidth: '480px', lineHeight: 1.7,
          }}>
            Every month, winning numbers are drawn and matched against
            subscribers' last 5 Stableford scores. Three ways to win.
          </p>
        </div>
      </div>

      {/* Prize structure strip */}
      <div style={{
        background: 'var(--charcoal)',
        borderBottom: '1px solid var(--border)',
        padding: '1.25rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'flex', gap: '2rem', flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: '0.7rem', letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(240,237,230,0.3)',
            }}>
              Prize split
            </span>
            {[
              { label: '5 match — Jackpot', pct: '40%', color: 'var(--gold)' },
              { label: '4 match',            pct: '35%', color: '#7DC67A' },
              { label: '3 match',            pct: '25%', color: 'rgba(240,237,230,0.5)' },
            ].map(t => (
              <div key={t.label} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: t.color,
                }} />
                <span style={{
                  fontSize: '0.8rem', color: 'rgba(240,237,230,0.5)',
                }}>
                  {t.label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem', color: t.color,
                }}>
                  {t.pct}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 1.5rem' }}>

        {loading ? (
          <div style={{
            textAlign: 'center', padding: '4rem',
            color: 'rgba(240,237,230,0.35)', fontSize: '0.9rem',
          }}>
            Loading draws…
          </div>
        ) : draws.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 0',
            color: 'rgba(240,237,230,0.35)',
          }}>
            <Trophy size={36} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.95rem' }}>No draws published yet.</p>
            <p style={{
              fontSize: '0.82rem', marginTop: '0.5rem',
              color: 'rgba(240,237,230,0.25)',
            }}>
              Check back after the first monthly draw.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {draws.map((draw, index) => (
              <DrawRow
                key={draw.id} draw={draw}
                isOpen={open === draw.id}
                onToggle={() => toggle(draw.id)}
                isLatest={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DrawRow({ draw, isOpen, onToggle, isLatest }) {
  const fiveWinners  = (draw.winners || []).filter(w => w.matchType === 'FIVE_MATCH');
  const fourWinners  = (draw.winners || []).filter(w => w.matchType === 'FOUR_MATCH');
  const threeWinners = (draw.winners || []).filter(w => w.matchType === 'THREE_MATCH');

  return (
    <div style={{
      border: `1px solid ${isLatest ? 'rgba(201,168,76,0.35)' : 'var(--border)'}`,
      borderRadius: '8px', overflow: 'hidden',
      background: isLatest
        ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.02)',
    }}>
      {/* Row header — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', gap: '1rem',
          background: 'none', cursor: 'pointer',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1.25rem',
          flex: 1, flexWrap: 'wrap',
        }}>
          {/* Month / Year */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={15} color="var(--gold)" />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem', fontWeight: 700, color: 'var(--cream)',
            }}>
              {MONTH_NAMES[draw.drawMonth]} {draw.drawYear}
            </span>
            {isLatest && (
              <span className="tag tag-gold" style={{ fontSize: '0.6rem' }}>
                Latest
              </span>
            )}
          </div>

          {/* Winning numbers */}
          {draw.winningNumbers && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {draw.winningNumbers.map((n, i) => (
                <div key={i} style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(201,168,76,0.12)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem', fontWeight: 500, color: 'var(--gold)',
                }}>
                  {n}
                </div>
              ))}
            </div>
          )}

          {/* Pool total */}
          <div style={{
            marginLeft: 'auto', textAlign: 'right',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem', color: 'var(--gold)',
            }}>
              £{Number(draw.totalPool || 0).toFixed(2)}
            </div>
            <div style={{
              fontSize: '0.7rem', color: 'rgba(240,237,230,0.35)',
            }}>
              total pool
            </div>
          </div>
        </div>

        <div style={{ color: 'rgba(240,237,230,0.4)', flexShrink: 0 }}>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div style={{
          padding: '0 1.5rem 1.5rem',
          borderTop: '1px solid var(--border)',
        }}>
          {/* Prize tier breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem', margin: '1.25rem 0',
          }}>
            {[
              {
                type: 'FIVE_MATCH', winners: fiveWinners,
                pool: Number(draw.totalPool || 0) * 0.40,
                rollover: Number(draw.jackpotAmount || 0) > 0,
              },
              {
                type: 'FOUR_MATCH', winners: fourWinners,
                pool: Number(draw.totalPool || 0) * 0.35,
              },
              {
                type: 'THREE_MATCH', winners: threeWinners,
                pool: Number(draw.totalPool || 0) * 0.25,
              },
            ].map(tier => {
              const meta = MATCH_LABEL[tier.type];
              return (
                <div key={tier.type} style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}>
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: meta.color, marginBottom: '0.5rem',
                    letterSpacing: '0.04em',
                  }}>
                    {meta.label}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.3rem', color: meta.color,
                    marginBottom: '0.25rem',
                  }}>
                    £{tier.pool.toFixed(2)}
                  </div>
                  <div style={{
                    fontSize: '0.75rem', color: 'rgba(240,237,230,0.4)',
                  }}>
                    {tier.winners.length === 0
                      ? tier.type === 'FIVE_MATCH' && tier.rollover
                        ? '↑ Rolled to next month'
                        : 'No winners'
                      : `${tier.winners.length} winner${tier.winners.length > 1 ? 's' : ''} — £${Number(tier.winners[0]?.prizeAmount || 0).toFixed(2)} each`
                    }
                  </div>
                </div>
              );
            })}
          </div>

          {/* Winners list */}
          {(draw.winners || []).length > 0 && (
            <div>
              <p style={{
                fontSize: '0.75rem', letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(240,237,230,0.3)',
                marginBottom: '0.75rem',
              }}>
                Winners
              </p>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
              }}>
                {draw.winners.map(w => {
                  const meta = MATCH_LABEL[w.matchType];
                  return (
                    <div key={w.id} style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 1rem',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: meta?.color || 'var(--gold)', flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: '0.875rem', color: 'var(--cream)',
                        }}>
                          {w.userFullName}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          color: 'rgba(240,237,230,0.4)',
                        }}>
                          {meta?.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.9rem', color: meta?.color || 'var(--gold)',
                        }}>
                          £{Number(w.prizeAmount).toFixed(2)}
                        </span>
                        <span className="tag" style={{
                          fontSize: '0.6rem',
                          background: w.payoutStatus === 'PAID'
                            ? 'rgba(39,174,96,0.15)' : 'rgba(255,255,255,0.06)',
                          color: w.payoutStatus === 'PAID'
                            ? '#7DC67A' : 'rgba(240,237,230,0.4)',
                        }}>
                          {w.payoutStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Published date */}
          {draw.publishedAt && (
            <p style={{
              marginTop: '1rem', fontSize: '0.72rem',
              color: 'rgba(240,237,230,0.25)',
            }}>
              Published {new Date(draw.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}