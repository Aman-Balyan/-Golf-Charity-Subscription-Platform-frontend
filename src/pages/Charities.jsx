import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, ExternalLink, Heart } from 'lucide-react';

export default function Charities() {
  const { isAuth } = useAuth();
  const navigate   = useNavigate();

  const [charities, setCharities] = useState([]);
  const [query,     setQuery]     = useState('');
  const [loading,   setLoading]   = useState(true);
  const [selecting, setSelecting] = useState(null);

  useEffect(() => { loadCharities(); }, []);

  const loadCharities = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/charities');
      setCharities(data);
    } catch {
      toast.error('Failed to load charities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setQuery(q);
    if (q.length > 1) {
      try {
        const { data } = await api.get(`/charities/search?q=${q}`);
        setCharities(data);
      } catch {}
    } else if (q.length === 0) {
      loadCharities();
    }
  };

  const handleSelect = async (charityId) => {
    if (!isAuth()) { navigate('/register'); return; }
    setSelecting(charityId);
    try {
      await api.post('/charities/select', { charityId, charityPercentage: 10 });
      toast.success('Charity selected! Update your contribution % in the dashboard.');
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, charityId }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to select charity');
    } finally {
      setSelecting(null);
    }
  };

  const featured  = charities.filter(c => c.isFeatured);
  const rest      = charities.filter(c => !c.isFeatured);
  const displayed = query ? charities : [...featured, ...rest];

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
            Give back
          </span>
          <h1 className="section-title" style={{ marginBottom: '1rem' }}>
            Choose your cause
          </h1>
          <p style={{
            color: 'rgba(240,237,230,0.55)', fontSize: '1rem',
            maxWidth: '480px', lineHeight: 1.7, marginBottom: '2rem',
          }}>
            A portion of every subscription goes to the charity you select.
            You can change your choice at any time from your dashboard.
          </p>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px', padding: '0.65rem 1rem',
            maxWidth: '420px',
          }}>
            <Search size={16} color="rgba(240,237,230,0.35)" />
            <input
              value={query} onChange={handleSearch}
              placeholder="Search charities…"
              style={{
                background: 'none', border: 'none',
                color: 'var(--cream)', fontSize: '0.9rem',
                width: '100%', outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 1.5rem' }}>

        {loading ? (
          <div style={{
            textAlign: 'center', padding: '4rem',
            color: 'rgba(240,237,230,0.35)', fontSize: '0.9rem',
          }}>
            Loading charities…
          </div>
        ) : displayed.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem',
            color: 'rgba(240,237,230,0.35)',
          }}>
            <p style={{ fontSize: '0.95rem' }}>No charities found for "{query}"</p>
          </div>
        ) : (
          <>
            {/* Featured section */}
            {!query && featured.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '0.75rem', marginBottom: '1.5rem',
                }}>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.3rem', fontWeight: 700, color: 'var(--cream)',
                  }}>
                    Featured charities
                  </h2>
                  <div style={{
                    height: '1px', flex: 1, background: 'var(--border)',
                  }} />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.25rem',
                }}>
                  {featured.map(c => (
                    <CharityCard key={c.id} charity={c}
                      onSelect={handleSelect}
                      selecting={selecting === c.id}
                      featured />
                  ))}
                </div>
              </div>
            )}

            {/* All charities */}
            {!query && rest.length > 0 && (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '0.75rem', marginBottom: '1.5rem',
                }}>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.3rem', fontWeight: 700, color: 'var(--cream)',
                  }}>
                    All charities
                  </h2>
                  <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.25rem',
                }}>
                  {rest.map(c => (
                    <CharityCard key={c.id} charity={c}
                      onSelect={handleSelect}
                      selecting={selecting === c.id} />
                  ))}
                </div>
              </div>
            )}

            {/* Search results */}
            {query && (
              <div>
                <p style={{
                  fontSize: '0.8rem', color: 'rgba(240,237,230,0.4)',
                  marginBottom: '1.5rem',
                }}>
                  {displayed.length} result{displayed.length !== 1 ? 's' : ''} for "{query}"
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.25rem',
                }}>
                  {displayed.map(c => (
                    <CharityCard key={c.id} charity={c}
                      onSelect={handleSelect}
                      selecting={selecting === c.id} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CharityCard({ charity, onSelect, selecting, featured }) {
  return (
    <div className="card" style={{
      display: 'flex', flexDirection: 'column',
      borderTop: featured ? '3px solid var(--gold)' : undefined,
      transition: 'border-color 0.2s',
    }}>
      {/* Image */}
      {charity.imageUrl && (
        <div style={{
          height: '160px', borderRadius: '4px',
          overflow: 'hidden', marginBottom: '1rem',
          background: 'rgba(255,255,255,0.04)',
        }}>
          <img src={charity.imageUrl} alt={charity.name}
               style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '0.6rem',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.05rem', fontWeight: 700, color: 'var(--cream)',
          flex: 1, paddingRight: '0.5rem',
        }}>
          {charity.name}
        </h3>
        {featured && <span className="tag tag-gold" style={{ fontSize: '0.6rem' }}>Featured</span>}
      </div>

      {/* Description */}
      <p style={{
        fontSize: '0.85rem', color: 'rgba(240,237,230,0.5)',
        lineHeight: 1.65, marginBottom: '1.25rem', flex: 1,
        display: '-webkit-box',
        WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {charity.description || 'Supporting a great cause.'}
      </p>

      {/* Stats row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '0.75rem 0',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1rem',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem', color: 'var(--gold)',
          }}>
            £{Number(charity.totalContributions || 0).toLocaleString()}
          </div>
          <div style={{
            fontSize: '0.7rem', color: 'rgba(240,237,230,0.35)',
          }}>
            raised via GolfGive
          </div>
        </div>
        {charity.websiteUrl && (
          <a href={charity.websiteUrl} target="_blank" rel="noreferrer"
             style={{
               display: 'flex', alignItems: 'center', gap: '0.35rem',
               fontSize: '0.75rem', color: 'rgba(240,237,230,0.4)',
               transition: 'color 0.2s',
             }}
             onMouseOver={e => e.currentTarget.style.color = 'var(--gold)'}
             onMouseOut={e => e.currentTarget.style.color = 'rgba(240,237,230,0.4)'}
          >
            <ExternalLink size={12} /> Website
          </a>
        )}
      </div>

      {/* Action */}
      <button
        className="btn-primary"
        onClick={() => onSelect(charity.id)}
        disabled={selecting}
        style={{
          width: '100%', textAlign: 'center',
          padding: '0.7rem', fontSize: '0.85rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '0.4rem',
          opacity: selecting ? 0.7 : 1,
        }}
      >
        <Heart size={14} />
        {selecting ? 'Selecting…' : 'Support this charity'}
      </button>
    </div>
  );
}