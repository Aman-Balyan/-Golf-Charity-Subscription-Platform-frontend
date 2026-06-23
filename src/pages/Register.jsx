import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    plan: 'MONTHLY',
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState(1); // 1 = details, 2 = plan

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters'); return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      toast.success('Account created! Welcome to GolfGive.');
      // After register, redirect to dashboard
      // Subscription is handled from dashboard
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'MONTHLY',
      name: 'Monthly',
      price: '£9.99',
      period: 'per month',
      perks: ['All monthly draws', 'Score tracking', 'Charity giving', 'Cancel anytime'],
    },
    {
      id: 'YEARLY',
      name: 'Yearly',
      price: '£99.99',
      period: 'per year',
      badge: 'Save 17%',
      perks: ['Everything in monthly', '2 months free', 'Priority support', 'Early draw access'],
    },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', paddingTop: '64px',
      background: 'linear-gradient(160deg, #0D1F0F 60%, #162A18 100%)',
    }}>
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: step === 2 ? '640px' : '440px',
        margin: '2rem 1.5rem', position: 'relative', zIndex: 1,
        transition: 'max-width 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)',
            display: 'block', marginBottom: '2rem',
          }}>
            GolfGive
          </Link>

          {/* Step indicator */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.5rem',
            marginBottom: '1.75rem',
          }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: step >= s ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                  color: step >= s ? 'var(--forest)' : 'rgba(240,237,230,0.4)',
                  transition: 'all 0.3s',
                }}>
                  {s}
                </div>
                {s < 2 && (
                  <div style={{
                    width: '40px', height: '1px',
                    background: step > s ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            ))}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem', fontWeight: 700,
            color: 'var(--cream)', marginBottom: '0.5rem',
          }}>
            {step === 1 ? 'Create your account' : 'Choose your plan'}
          </h1>
          <p style={{ color: 'rgba(240,237,230,0.5)', fontSize: '0.95rem' }}>
            {step === 1
              ? 'Start playing with purpose today'
              : 'You can subscribe from your dashboard after signing up'}
          </p>
        </div>

        {/* Step 1 — Account details */}
        {step === 1 && (
          <div className="card" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleStep1}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label">Full name</label>
                <input
                  className="input-field" type="text" name="fullName"
                  placeholder="John Smith"
                  value={form.fullName} onChange={handleChange} required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label">Email address</label>
                <input
                  className="input-field" type="email" name="email"
                  placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label">Password</label>
                <input
                  className="input-field" type="password" name="password"
                  placeholder="Minimum 8 characters"
                  value={form.password} onChange={handleChange} required
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label className="label">Confirm password</label>
                <input
                  className="input-field" type="password" name="confirmPassword"
                  placeholder="Repeat your password"
                  value={form.confirmPassword} onChange={handleChange} required
                />
              </div>

              <button type="submit" className="btn-primary"
                      style={{ width: '100%', textAlign: 'center', padding: '0.875rem' }}>
                Continue
              </button>
            </form>

            <div className="divider" />
            <p style={{
              textAlign: 'center', fontSize: '0.875rem',
              color: 'rgba(240,237,230,0.5)',
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 500 }}>
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* Step 2 — Plan selection */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '1rem', marginBottom: '1.5rem',
            }}>
              {plans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setForm(p => ({ ...p, plan: plan.id }))}
                  style={{
                    padding: '1.75rem',
                    border: `2px solid ${form.plan === plan.id
                      ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '8px',
                    background: form.plan === plan.id
                      ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  {plan.badge && (
                    <span className="tag tag-green" style={{
                      position: 'absolute', top: '-10px', right: '12px',
                      fontSize: '0.65rem',
                    }}>
                      {plan.badge}
                    </span>
                  )}

                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem', fontWeight: 700,
                    color: 'var(--cream)', marginBottom: '0.25rem',
                  }}>
                    {plan.name}
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.8rem', fontWeight: 500,
                      color: form.plan === plan.id ? 'var(--gold)' : 'var(--cream)',
                    }}>
                      {plan.price}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      color: 'rgba(240,237,230,0.4)',
                      marginLeft: '0.35rem',
                    }}>
                      {plan.period}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {plan.perks.map(perk => (
                      <div key={perk} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.8rem', color: 'rgba(240,237,230,0.6)',
                      }}>
                        <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✓</span>
                        {perk}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p style={{
              fontSize: '0.8rem',
              color: 'rgba(240,237,230,0.4)',
              textAlign: 'center', marginBottom: '1.5rem',
            }}>
              You'll set up payment from your dashboard after creating your account.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '0.875rem' }}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  flex: 2, padding: '0.875rem',
                  textAlign: 'center',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}