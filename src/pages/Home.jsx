import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export default function Home() {
  const { isAuth } = useAuth();
  const [stats, setStats] = useState({
    totalDonated: 0,
    activeSubscribers: 0,
    totalDraws: 0,
  });
  const [featuredCharities, setFeaturedCharities] = useState([]);
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const donatedCount     = useCountUp(stats.totalDonated,       2200, statsVisible);
  const subscribersCount = useCountUp(stats.activeSubscribers,  1800, statsVisible);
  const drawsCount       = useCountUp(stats.totalDraws,         1500, statsVisible);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);

    // Load featured charities
    api.get('/charities/featured').then(r => setFeaturedCharities(r.data)).catch(() => {});

    // Load stats (admin endpoint — fallback gracefully)
    api.get('/admin/stats').then(r => {
      setStats({
        totalDonated:       Number(r.data.totalCharityContributions || 0),
        activeSubscribers:  Number(r.data.activeSubscribers || 0),
        totalDraws:         Number(r.data.totalDrawsPublished || 0),
      });
    }).catch(() => {});

    // Intersection observer for stats counter
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page" style={{ paddingTop: '64px' }}>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '92vh',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #0D1F0F 60%, #162A18 100%)',
      }}>
        {/* Background grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Gold accent blob */}
        <div style={{
          position: 'absolute', right: '-10%', top: '10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '720px' }}>

            <div style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'none' : 'translateY(32px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}>
              <span className="tag tag-gold" style={{ marginBottom: '1.5rem' }}>
                Play. Give. Win.
              </span>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.8rem, 6vw, 5rem)',
                fontWeight: 900, lineHeight: 1.05,
                color: 'var(--cream)', marginBottom: '1.5rem',
                marginTop: '1rem',
              }}>
                Every round you play<br />
                <span style={{ color: 'var(--gold)' }}>funds something</span><br />
                that matters.
              </h1>

              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: 'rgba(240,237,230,0.65)',
                lineHeight: 1.7, maxWidth: '520px',
                marginBottom: '2.5rem',
              }}>
                Submit your Stableford scores, enter monthly prize draws,
                and automatically support the charity you care about —
                all in one place.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {isAuth() ? (
                  <Link to="/dashboard" className="btn-primary"
                        style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
                    Go to dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary"
                          style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
                      Start your subscription
                    </Link>
                    <Link to="/draws" className="btn-outline"
                          style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
                      See past draws
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '0.5rem',
          opacity: 0.4,
        }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Scroll
          </span>
          <div style={{
            width: '1px', height: '40px',
            background: 'linear-gradient(to bottom, var(--gold), transparent)',
          }} />
        </div>
      </section>

      {/* ── IMPACT COUNTER ── */}
      <section ref={statsRef} style={{
        background: 'var(--charcoal)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '4rem 0',
      }}>
        <div className="container">
          <p style={{
            fontSize: '0.75rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--gold)',
            textAlign: 'center', marginBottom: '3rem',
          }}>
            Platform impact
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem', textAlign: 'center',
          }}>
            {[
              {
                value: `£${donatedCount.toLocaleString()}`,
                label: 'Donated to charity',
                sub: 'and growing every month',
              },
              {
                value: subscribersCount.toLocaleString(),
                label: 'Active players',
                sub: 'across all subscription tiers',
              },
              {
                value: drawsCount.toLocaleString(),
                label: 'Draws completed',
                sub: 'with verified winners',
              },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: '1.5rem',
                borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                  fontWeight: 500, color: 'var(--gold)',
                  lineHeight: 1, marginBottom: '0.5rem',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.95rem', fontWeight: 600,
                  color: 'var(--cream)', marginBottom: '0.25rem',
                }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(240,237,230,0.4)' }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '7rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title">How it works</h2>
            <p style={{
              color: 'rgba(240,237,230,0.55)', marginTop: '1rem',
              fontSize: '1.05rem', maxWidth: '480px', margin: '1rem auto 0',
            }}>
              Three things. That's all it takes.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              {
                step: '01',
                title: 'Subscribe',
                body: 'Choose a monthly or yearly plan. A portion of every payment goes directly to your chosen charity.',
                accent: 'var(--gold)',
              },
              {
                step: '02',
                title: 'Submit your scores',
                body: 'Log your last 5 Stableford scores after each round. Your rolling total keeps you in every monthly draw.',
                accent: 'var(--sage)',
              },
              {
                step: '03',
                title: 'Win & give',
                body: 'Match 3, 4, or all 5 draw numbers to win prize pool tiers — while your charity receives its share automatically.',
                accent: 'var(--gold)',
              },
            ].map((item) => (
              <div key={item.step} className="card" style={{
                borderTop: `3px solid ${item.accent}`,
                padding: '2rem',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem', color: item.accent,
                  letterSpacing: '0.1em', marginBottom: '1rem',
                }}>
                  {item.step}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem', fontWeight: 700,
                  color: 'var(--cream)', marginBottom: '0.75rem',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem', color: 'rgba(240,237,230,0.55)',
                  lineHeight: 1.7,
                }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE POOL ── */}
      <section style={{
        padding: '6rem 0',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '4rem', alignItems: 'center',
          }}>
            <div>
              <span className="tag tag-gold" style={{ marginBottom: '1.25rem' }}>
                Prize structure
              </span>
              <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>
                Three ways<br />to win every month
              </h2>
              <p style={{
                color: 'rgba(240,237,230,0.55)',
                lineHeight: 1.8, fontSize: '0.95rem',
              }}>
                The prize pool is built from active subscriptions and split
                across three match tiers. The jackpot rolls over if unclaimed —
                so it keeps growing until someone hits all five.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { match: '5 numbers', share: '40%', label: 'Jackpot', rollover: true,  color: 'var(--gold)' },
                { match: '4 numbers', share: '35%', label: 'Major prize', rollover: false, color: 'var(--sage)' },
                { match: '3 numbers', share: '25%', label: 'Entry prize', rollover: false, color: 'rgba(240,237,230,0.4)' },
              ].map((tier) => (
                <div key={tier.match} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tier.color}30`,
                  borderRadius: '6px',
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem', fontWeight: 700,
                      color: tier.color,
                    }}>
                      {tier.label}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'rgba(240,237,230,0.45)',
                      marginTop: '0.2rem',
                    }}>
                      Match {tier.match}
                      {tier.rollover && (
                        <span style={{
                          marginLeft: '0.5rem',
                          color: 'var(--gold)',
                          fontSize: '0.7rem',
                        }}>
                          ↑ rolls over
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.6rem', fontWeight: 500,
                    color: tier.color,
                  }}>
                    {tier.share}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            section > .container > div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}</style>
      </section>

      {/* ── FEATURED CHARITIES ── */}
      {featuredCharities.length > 0 && (
        <section style={{ padding: '7rem 0' }}>
          <div className="container">
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-end', marginBottom: '3rem',
              flexWrap: 'wrap', gap: '1rem',
            }}>
              <div>
                <h2 className="section-title">Featured charities</h2>
                <p style={{
                  color: 'rgba(240,237,230,0.5)',
                  marginTop: '0.5rem', fontSize: '0.95rem',
                }}>
                  Your subscription supports causes that matter.
                </p>
              </div>
              <Link to="/charities" className="btn-outline"
                    style={{ fontSize: '0.85rem' }}>
                View all charities
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}>
              {featuredCharities.slice(0, 3).map((charity) => (
                <div key={charity.id} className="card" style={{
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                }}>
                  {charity.imageUrl && (
                    <div style={{
                      height: '140px', borderRadius: '4px', overflow: 'hidden',
                      background: 'rgba(255,255,255,0.05)',
                    }}>
                      <img src={charity.imageUrl} alt={charity.name}
                           style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem', fontWeight: 700,
                      color: 'var(--cream)', marginBottom: '0.5rem',
                    }}>
                      {charity.name}
                    </div>
                    <p style={{
                      fontSize: '0.85rem',
                      color: 'rgba(240,237,230,0.5)',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {charity.description}
                    </p>
                  </div>
                  <div style={{
                    marginTop: 'auto', paddingTop: '1rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem', color: 'var(--gold)',
                    }}>
                      £{Number(charity.totalContributions).toLocaleString()} raised
                    </span>
                    <span className="tag tag-gold">Featured</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{
        padding: '7rem 0',
        background: 'linear-gradient(135deg, #0D1F0F 0%, #1A3A1C 100%)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>
            Ready to play with purpose?
          </h2>
          <p style={{
            color: 'rgba(240,237,230,0.55)',
            fontSize: '1.05rem', lineHeight: 1.7,
            marginBottom: '2.5rem',
          }}>
            Join a community of golfers who turn every round into real-world impact.
            Subscribe today and never miss a draw.
          </p>
          {isAuth() ? (
            <Link to="/dashboard" className="btn-primary"
                  style={{ fontSize: '1.05rem', padding: '1rem 3rem' }}>
              Go to your dashboard
            </Link>
          ) : (
            <Link to="/register" className="btn-primary"
                  style={{ fontSize: '1.05rem', padding: '1rem 3rem' }}>
              Get started — it takes 2 minutes
            </Link>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: 'var(--charcoal)',
        borderTop: '1px solid var(--border)',
        padding: '2.5rem 0',
      }}>
        <div className="container" style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)',
          }}>
            GolfGive
          </span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.3)' }}>
            © {new Date().getFullYear()} GolfGive. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Charities', 'Draws', 'Subscribe'].map(l => (
              <Link key={l} to={`/${l.toLowerCase()}`}
                    style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.4)' }}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}