import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Trophy, Target, Heart, CreditCard,
  Plus, Pencil, Trash2, Check, X
} from 'lucide-react';

// ── Score Card ────────────────────────────────────────────────────────────────
function ScoreCard({ score, onEdit, onDelete }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1.25rem',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.6rem', fontWeight: 500,
          color: 'var(--gold)', minWidth: '48px',
        }}>
          {score.score}
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.4)' }}>
            Stableford points
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(240,237,230,0.6)' }}>
            {new Date(score.playedDate).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => onEdit(score)} style={{
          padding: '0.4rem', borderRadius: '4px',
          color: 'rgba(240,237,230,0.4)',
          transition: 'color 0.2s',
        }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(240,237,230,0.4)'}
        >
          <Pencil size={15} />
        </button>
        <button onClick={() => onDelete(score.id)} style={{
          padding: '0.4rem', borderRadius: '4px',
          color: 'rgba(240,237,230,0.4)',
          transition: 'color 0.2s',
        }}
          onMouseOver={e => e.currentTarget.style.color = '#E67E73'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(240,237,230,0.4)'}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Score Form ────────────────────────────────────────────────────────────────
function ScoreForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || { score: '', playedDate: new Date().toISOString().split('T')[0] }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.score < 1 || form.score > 45) {
      toast.error('Score must be between 1 and 45'); return;
    }
    setSaving(true);
    await onSave({ score: Number(form.score), playedDate: form.playedDate });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
      padding: '1rem', background: 'rgba(201,168,76,0.05)',
      border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px',
    }}>
      <div style={{ flex: '1', minWidth: '100px' }}>
        <label className="label">Score (1–45)</label>
        <input className="input-field" type="number"
          min={1} max={45} required
          value={form.score}
          onChange={e => setForm(p => ({ ...p, score: e.target.value }))}
        />
      </div>
      <div style={{ flex: '2', minWidth: '160px' }}>
        <label className="label">Date played</label>
        <input className="input-field" type="date"
          max={new Date().toISOString().split('T')[0]}
          required
          value={form.playedDate}
          onChange={e => setForm(p => ({ ...p, playedDate: e.target.value }))}
        />
      </div>
      <div style={{
        display: 'flex', gap: '0.5rem',
        alignItems: 'flex-end', paddingBottom: '0',
      }}>
        <button type="submit" disabled={saving} style={{
          background: 'var(--gold)', color: 'var(--forest)',
          padding: '0.7rem 1.25rem', borderRadius: '4px',
          fontWeight: 600, fontSize: '0.85rem',
          opacity: saving ? 0.7 : 1,
        }}>
          {saving ? '…' : <Check size={16} />}
        </button>
        <button type="button" onClick={onCancel} style={{
          background: 'rgba(255,255,255,0.06)',
          color: 'var(--cream)', padding: '0.7rem 1rem',
          borderRadius: '4px', fontSize: '0.85rem',
        }}>
          <X size={16} />
        </button>
      </div>
    </form>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  const [scores,       setScores]       = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [charities,    setCharities]    = useState([]);
  const [myCharity,    setMyCharity]    = useState(null);
  const [winnings,     setWinnings]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  const [showScoreForm, setShowScoreForm] = useState(false);
  const [editingScore,  setEditingScore]  = useState(null);

  const [charityPct, setCharityPct]         = useState(10);
  const [selectedCharity, setSelectedCharity] = useState('');
  const [savingCharity, setSavingCharity]   = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [scoresRes, subRes, charitiesRes, winRes] = await Promise.all([
        api.get('/scores'),
        api.get('/subscriptions').catch(() => ({ data: null })),
        api.get('/charities'),
        api.get('/draws/my-winnings'),
      ]);
      setScores(scoresRes.data);
      setSubscription(subRes.data);
      setCharities(charitiesRes.data);
      setWinnings(winRes.data);

      // Pre-fill charity selection
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      if (stored.charityId) {
        setSelectedCharity(stored.charityId);
        setCharityPct(stored.charityPercentage || 10);
        const found = charitiesRes.data.find(c => c.id === stored.charityId);
        if (found) setMyCharity(found);
      }
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ── Score handlers ──
  const handleAddScore = async (data) => {
    try {
      await api.post('/scores', data);
      toast.success('Score added');
      setShowScoreForm(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add score');
    }
  };

  const handleEditScore = async (data) => {
    try {
      await api.put(`/scores/${editingScore.id}`, data);
      toast.success('Score updated');
      setEditingScore(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update score');
    }
  };

  const handleDeleteScore = async (id) => {
    if (!confirm('Delete this score?')) return;
    try {
      await api.delete(`/scores/${id}`);
      toast.success('Score removed');
      loadAll();
    } catch {
      toast.error('Failed to delete score');
    }
  };

  // ── Charity handler ──
  const handleSaveCharity = async () => {
    if (!selectedCharity) { toast.error('Select a charity first'); return; }
    setSavingCharity(true);
    try {
      await api.post('/charities/select', {
        charityId: selectedCharity,
        charityPercentage: charityPct,
      });
      toast.success('Charity preference saved');
      const found = charities.find(c => c.id === selectedCharity);
      setMyCharity(found);
      // Update local storage user
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...stored, charityId: selectedCharity, charityPercentage: charityPct,
      }));
    } catch (err) {
      toast.error('Failed to save charity');
    } finally {
      setSavingCharity(false);
    }
  };

  const statusColor = {
    ACTIVE:    'var(--success)',
    CANCELLED: '#E67E73',
    LAPSED:    'rgba(240,237,230,0.4)',
  };

  const matchLabel = {
    FIVE_MATCH:  '5-Number Match',
    FOUR_MATCH:  '4-Number Match',
    THREE_MATCH: '3-Number Match',
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      paddingTop: '64px',
    }}>
      <div style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.9rem' }}>
        Loading dashboard…
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '2.5rem 0 2rem',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div className="container">
          <p style={{
            fontSize: '0.75rem', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--gold)',
            marginBottom: '0.4rem',
          }}>
            Player dashboard
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 700, color: 'var(--cream)',
          }}>
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>

          {/* ── SUBSCRIPTION ── */}
          <section className="card">
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '0.6rem', marginBottom: '1.25rem',
            }}>
              <CreditCard size={18} color="var(--gold)" />
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem', fontWeight: 700, color: 'var(--cream)',
              }}>
                Subscription
              </h2>
            </div>

            {subscription ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontSize: '0.8rem', color: 'rgba(240,237,230,0.5)',
                  }}>Status</span>
                  <span className="tag" style={{
                    background: `${statusColor[subscription.status]}20`,
                    color: statusColor[subscription.status],
                  }}>
                    {subscription.status}
                  </span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.5)' }}>
                    Plan
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--cream)' }}>
                    {subscription.plan === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                  </span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.5)' }}>
                    Amount
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.95rem', color: 'var(--gold)',
                  }}>
                    £{subscription.amount}
                  </span>
                </div>
                {subscription.renewalDate && (
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.5)' }}>
                      Renews
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--cream)' }}>
                      {new Date(subscription.renewalDate).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(240,237,230,0.45)',
                  marginBottom: '1.25rem', lineHeight: 1.6,
                }}>
                  No active subscription. Subscribe to enter monthly draws.
                </p>
                <Link to="/register" className="btn-primary"
                      style={{ fontSize: '0.85rem', padding: '0.65rem 1.5rem' }}>
                  Subscribe now
                </Link>
              </div>
            )}
          </section>

          {/* ── SCORES ── */}
          <section className="card" style={{ gridColumn: 'span 1' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Target size={18} color="var(--gold)" />
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem', fontWeight: 700, color: 'var(--cream)',
                }}>
                  My scores
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  color: 'rgba(240,237,230,0.35)',
                }}>
                  {scores.length}/5
                </span>
                {!showScoreForm && !editingScore && (
                  <button
                    onClick={() => setShowScoreForm(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      fontSize: '0.78rem', color: 'var(--gold)',
                      fontWeight: 500, padding: '0.35rem 0.75rem',
                      border: '1px solid rgba(201,168,76,0.3)',
                      borderRadius: '4px', transition: 'background 0.2s',
                    }}
                  >
                    <Plus size={13} /> Add score
                  </button>
                )}
              </div>
            </div>

            {/* Add score form */}
            {showScoreForm && (
              <div style={{ marginBottom: '1rem' }}>
                <ScoreForm
                  onSave={handleAddScore}
                  onCancel={() => setShowScoreForm(false)}
                />
              </div>
            )}

            {/* Score list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {scores.length === 0 && !showScoreForm && (
                <p style={{
                  textAlign: 'center', padding: '1.5rem 0',
                  fontSize: '0.875rem', color: 'rgba(240,237,230,0.35)',
                }}>
                  No scores yet. Add your first round.
                </p>
              )}
              {scores.map(score => (
                editingScore?.id === score.id ? (
                  <ScoreForm
                    key={score.id}
                    initial={{ score: score.score, playedDate: score.playedDate }}
                    onSave={handleEditScore}
                    onCancel={() => setEditingScore(null)}
                  />
                ) : (
                  <ScoreCard
                    key={score.id} score={score}
                    onEdit={setEditingScore}
                    onDelete={handleDeleteScore}
                  />
                )
              ))}
            </div>

            {scores.length > 0 && (
              <p style={{
                marginTop: '1rem', fontSize: '0.75rem',
                color: 'rgba(240,237,230,0.3)', textAlign: 'center',
              }}>
                Only your latest 5 scores count toward draws
              </p>
            )}
          </section>

          {/* ── CHARITY ── */}
          <section className="card">
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '0.6rem', marginBottom: '1.25rem',
            }}>
              <Heart size={18} color="var(--gold)" />
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem', fontWeight: 700, color: 'var(--cream)',
              }}>
                My charity
              </h2>
            </div>

            {myCharity && (
              <div className="tag tag-green" style={{ marginBottom: '1rem' }}>
                Currently supporting: {myCharity.name}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Select charity</label>
              <select
                className="input-field"
                value={selectedCharity}
                onChange={e => setSelectedCharity(e.target.value)}
                style={{ appearance: 'none' }}
              >
                <option value="">Choose a charity…</option>
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label">
                Contribution — {charityPct}% of subscription
              </label>
              <input
                type="range" min={10} max={100} step={5}
                value={charityPct}
                onChange={e => setCharityPct(Number(e.target.value))}
                style={{
                  width: '100%', accentColor: 'var(--gold)',
                  cursor: 'pointer',
                }}
              />
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.7rem', color: 'rgba(240,237,230,0.3)',
                marginTop: '0.25rem',
              }}>
                <span>10% (min)</span>
                <span>100%</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleSaveCharity}
              disabled={savingCharity}
              style={{
                width: '100%', textAlign: 'center',
                padding: '0.75rem',
                opacity: savingCharity ? 0.7 : 1,
                fontSize: '0.875rem',
              }}
            >
              {savingCharity ? 'Saving…' : 'Save charity preference'}
            </button>
          </section>

          {/* ── WINNINGS ── */}
          <section className="card" style={{
            gridColumn: 'span 1',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '0.6rem', marginBottom: '1.25rem',
            }}>
              <Trophy size={18} color="var(--gold)" />
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem', fontWeight: 700, color: 'var(--cream)',
              }}>
                My winnings
              </h2>
            </div>

            {winnings.length === 0 ? (
              <p style={{
                textAlign: 'center', padding: '1.5rem 0',
                fontSize: '0.875rem', color: 'rgba(240,237,230,0.35)',
              }}>
                No winnings yet. Keep entering draws!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Summary row */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(201,168,76,0.07)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: '6px',
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(240,237,230,0.6)' }}>
                    Total won
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--gold)', fontWeight: 500,
                  }}>
                    £{winnings
                      .filter(w => w.payoutStatus === 'PAID')
                      .reduce((sum, w) => sum + Number(w.prizeAmount), 0)
                      .toFixed(2)}
                  </span>
                </div>

                {/* Winnings list */}
                {winnings.map(w => (
                  <div key={w.id} style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}>
                      <span style={{
                        fontSize: '0.85rem', fontWeight: 600,
                        color: 'var(--cream)',
                      }}>
                        {matchLabel[w.matchType] || w.matchType}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--gold)', fontSize: '0.95rem',
                      }}>
                        £{Number(w.prizeAmount).toFixed(2)}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
                    }}>
                      <span className="tag" style={{
                        background: w.verificationStatus === 'APPROVED'
                          ? 'rgba(39,174,96,0.15)' : 'rgba(255,255,255,0.06)',
                        color: w.verificationStatus === 'APPROVED'
                          ? '#7DC67A' : 'rgba(240,237,230,0.4)',
                        fontSize: '0.65rem',
                      }}>
                        {w.verificationStatus}
                      </span>
                      <span className="tag" style={{
                        background: w.payoutStatus === 'PAID'
                          ? 'rgba(39,174,96,0.15)' : 'rgba(255,255,255,0.06)',
                        color: w.payoutStatus === 'PAID'
                          ? '#7DC67A' : 'rgba(240,237,230,0.4)',
                        fontSize: '0.65rem',
                      }}>
                        {w.payoutStatus}
                      </span>
                    </div>

                    {/* Proof upload */}
                    {w.verificationStatus === 'PENDING' && !w.proofUrl && (
                      <ProofUpload winnerId={w.id} onDone={loadAll} />
                    )}
                    {w.proofUrl && (
                      <p style={{
                        marginTop: '0.5rem', fontSize: '0.72rem',
                        color: 'rgba(240,237,230,0.35)',
                      }}>
                        Proof submitted — awaiting review
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

// ── Proof Upload ──────────────────────────────────────────────────────────────
function ProofUpload({ winnerId, onDone }) {
  const [url, setUrl]       = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSaving(true);
    try {
      await api.post(`/winners/${winnerId}/proof`, { proofUrl: url });
      toast.success('Proof submitted');
      onDone();
    } catch {
      toast.error('Failed to submit proof');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      marginTop: '0.75rem', display: 'flex', gap: '0.5rem',
    }}>
      <input
        className="input-field" type="url"
        placeholder="Paste screenshot URL…"
        value={url} onChange={e => setUrl(e.target.value)}
        style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
        required
      />
      <button type="submit" disabled={saving} style={{
        background: 'var(--gold)', color: 'var(--forest)',
        padding: '0.5rem 0.9rem', borderRadius: '4px',
        fontWeight: 600, fontSize: '0.8rem',
        whiteSpace: 'nowrap', opacity: saving ? 0.7 : 1,
      }}>
        {saving ? '…' : 'Submit'}
      </button>
    </form>
  );
}