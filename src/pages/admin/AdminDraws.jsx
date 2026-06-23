import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDraws() {
  const [draws,      setDraws]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [simulation, setSimulation] = useState(null);
  const [simDrawId,  setSimDrawId]  = useState(null);
  const [creating,   setCreating]   = useState(false);
  const [form, setForm] = useState({
    drawMonth: new Date().getMonth() + 1,
    drawYear:  new Date().getFullYear(),
    drawType: 'RANDOM',
  });

  useEffect(() => { loadDraws(); }, []);

  const loadDraws = () => {
    api.get('/draws')
      .then(r => setDraws(r.data))
      .catch(() => toast.error('Failed to load draws'))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/draws', form);
      toast.success('Draw created');
      loadDraws();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create draw');
    } finally {
      setCreating(false);
    }
  };

  const handleSimulate = async (drawId) => {
    try {
      const { data } = await api.get(`/draws/${drawId}/simulate`);
      setSimulation(data);
      setSimDrawId(drawId);
    } catch {
      toast.error('Simulation failed');
    }
  };

  const handlePublish = async (drawId) => {
    if (!confirm('Publish this draw? This cannot be undone.')) return;
    try {
      await api.post(`/draws/${drawId}/publish`);
      toast.success('Draw published!');
      setSimulation(null);
      loadDraws();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    }
  };

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
        }}>Draws</h1>
      </div>

      {/* Create draw form */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem', fontWeight: 700,
          color: 'var(--cream)', marginBottom: '1.25rem',
        }}>
          Create new draw
        </h2>
        <form onSubmit={handleCreate} style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end',
        }}>
          <div style={{ minWidth: '120px' }}>
            <label className="label">Month</label>
            <select className="input-field"
              value={form.drawMonth}
              onChange={e => setForm(p => ({ ...p, drawMonth: Number(e.target.value) }))}
              style={{ appearance: 'none' }}
            >
              {MONTHS.slice(1).map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: '100px' }}>
            <label className="label">Year</label>
            <input className="input-field" type="number"
              value={form.drawYear}
              onChange={e => setForm(p => ({ ...p, drawYear: Number(e.target.value) }))}
            />
          </div>
          <div style={{ minWidth: '160px' }}>
            <label className="label">Draw type</label>
            <select className="input-field"
              value={form.drawType}
              onChange={e => setForm(p => ({ ...p, drawType: e.target.value }))}
              style={{ appearance: 'none' }}
            >
              <option value="RANDOM">Random</option>
              <option value="ALGORITHMIC">Algorithmic</option>
            </select>
          </div>
          <button type="submit" className="btn-primary"
            disabled={creating}
            style={{ padding: '0.75rem 1.5rem', opacity: creating ? 0.7 : 1 }}>
            {creating ? 'Creating…' : 'Create draw'}
          </button>
        </form>
      </div>

      {/* Simulation result */}
      {simulation && (
        <div className="card" style={{
          marginBottom: '2rem', padding: '1.75rem',
          border: '1px solid rgba(201,168,76,0.3)',
          background: 'rgba(201,168,76,0.04)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '1.25rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem', fontWeight: 700, color: 'var(--cream)',
            }}>
              Simulation preview
            </h2>
            <button onClick={() => setSimulation(null)}
              style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.8rem' }}>
              Dismiss
            </button>
          </div>

          {/* Winning numbers */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {simulation.winningNumbers?.map((n, i) => (
              <div key={i} style={{
                width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(201,168,76,0.15)',
                border: '2px solid var(--gold)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem', fontWeight: 600, color: 'var(--gold)',
              }}>
                {n}
              </div>
            ))}
          </div>

          {/* Tier summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem', marginBottom: '1.25rem',
          }}>
            {[
              { label: 'Jackpot (5)',  count: simulation.fiveMatchCount,
                prize: simulation.jackpotPerWinner,  color: 'var(--gold)' },
              { label: 'Major (4)',    count: simulation.fourMatchCount,
                prize: simulation.fourMatchPerWinner, color: '#7DC67A' },
              { label: 'Entry (3)',    count: simulation.threeMatchCount,
                prize: simulation.threeMatchPerWinner, color: 'rgba(240,237,230,0.5)' },
            ].map(t => (
              <div key={t.label} style={{
                padding: '0.875rem 1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)', borderRadius: '6px',
              }}>
                <div style={{
                  fontSize: '0.75rem', color: t.color,
                  fontWeight: 600, marginBottom: '0.35rem',
                }}>
                  {t.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.2rem', color: t.color,
                }}>
                  {t.count} winner{t.count !== 1 ? 's' : ''}
                </div>
                <div style={{
                  fontSize: '0.75rem', color: 'rgba(240,237,230,0.4)',
                  marginTop: '0.2rem',
                }}>
                  £{Number(t.prize || 0).toFixed(2)} each
                </div>
              </div>
            ))}
          </div>

          <button className="btn-primary"
            onClick={() => handlePublish(simDrawId)}
            style={{ fontSize: '0.875rem' }}>
            Publish this draw
          </button>
        </div>
      )}

      {/* Draws list */}
      {loading ? (
        <p style={{ color: 'rgba(240,237,230,0.35)', fontSize: '0.9rem' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {draws.map(draw => (
            <div key={draw.id} className="card" style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem', fontWeight: 700, color: 'var(--cream)',
                  marginBottom: '0.25rem',
                }}>
                  {MONTHS[draw.drawMonth]} {draw.drawYear}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="tag" style={{
                    fontSize: '0.62rem',
                    background: draw.status === 'PUBLISHED'
                      ? 'rgba(39,174,96,0.12)' : 'rgba(255,255,255,0.06)',
                    color: draw.status === 'PUBLISHED'
                      ? '#7DC67A' : 'rgba(240,237,230,0.4)',
                  }}>
                    {draw.status}
                  </span>
                  <span style={{
                    fontSize: '0.75rem', color: 'rgba(240,237,230,0.35)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {draw.drawType}
                  </span>
                  {draw.winningNumbers && (
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {draw.winningNumbers.map((n, i) => (
                        <span key={i} style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem', color: 'var(--gold)',
                          background: 'rgba(201,168,76,0.1)',
                          padding: '0.1rem 0.4rem', borderRadius: '3px',
                        }}>
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {draw.status !== 'PUBLISHED' && (
                  <>
                    <button className="btn-outline"
                      onClick={() => handleSimulate(draw.id)}
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                      Simulate
                    </button>
                    <button className="btn-primary"
                      onClick={() => handlePublish(draw.id)}
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                      Publish
                    </button>
                  </>
                )}
                {draw.status === 'PUBLISHED' && (
                  <span style={{
                    fontSize: '0.78rem', color: '#7DC67A',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}>
                    ✓ Published · {draw.winners?.length || 0} winners
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}