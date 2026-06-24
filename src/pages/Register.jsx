import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ── Stripe payment form (Step 3) ─────────────────────────────────────────────
function PaymentForm({ plan, onSuccess, onSkip }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error('Stripe not loaded. Please try again.');
      return;
    }
    setPaying(true);

    try {
      // ✅ Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('🔑 Token for payment:', token);

      if (!token) {
        toast.error('Please login first');
        setPaying(false);
        return;
      }

      // Create payment method from card element
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (pmError) {
        toast.error(pmError.message);
        setPaying(false);
        return;
      }

      console.log('💳 Payment Method ID:', paymentMethod.id);

      // Send to backend — create subscription
      const { data } = await api.post(
        '/subscriptions',
        {
          plan: plan,
          paymentMethodId: paymentMethod.id,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('📦 Subscription response:', data);

      // Confirm the payment with the client secret
      const { error: confirmError } = await stripe.confirmCardPayment(
        data.clientSecret
      );

      if (confirmError) {
        toast.error(confirmError.message);
        setPaying(false);
        return;
      }

      toast.success('🎉 Subscription activated successfully!');
      onSuccess();
    } catch (err) {
      console.error('❌ Payment error:', err);
      console.error('❌ Response:', err.response?.data);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Payment failed');
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <div style={{ marginBottom: '1.25rem' }}>
        <label className="label" style={{ marginBottom: '0.75rem', display: 'block' }}>
          Card details
        </label>

        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            padding: '0.9rem 1rem',
            transition: 'border-color 0.2s',
          }}
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#F0EDE6',
                  fontFamily: 'Inter, sans-serif',
                  '::placeholder': {
                    color: 'rgba(240,237,230,0.3)',
                  },
                },
                invalid: {
                  color: '#E67E73',
                },
              },
            }}
          />
        </div>
      </div>

      <div
        style={{
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.82rem',
          color: 'rgba(240,237,230,0.5)',
          lineHeight: 1.6,
        }}
      >
        💳 Test card:{' '}
        <span
          style={{
            fontFamily: 'monospace',
            color: '#C9A84C',
            fontWeight: 600,
          }}
        >
          4242 4242 4242 4242
        </span>
        <br />
        Any future date — Any 3-digit CVC
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={!stripe || paying}
        style={{
          width: '100%',
          textAlign: 'center',
          padding: '0.875rem',
          fontSize: '0.95rem',
          opacity: paying ? 0.7 : 1,
          cursor: paying ? 'not-allowed' : 'pointer',
        }}
      >
        {paying
          ? '⏳ Processing…'
          : `💳 Pay ${plan === 'YEARLY' ? '£99.99/year' : '£9.99/month'}`}
      </button>

      {/* Skip option */}
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={onSkip}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(240,237,230,0.35)',
            fontSize: '0.82rem',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Skip for now — I'll subscribe later
        </button>
      </div>
    </form>
  );
}

// ── Main Register component ───────────────────────────────────────────────────
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [plan, setPlan] = useState('MONTHLY');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Step 1 — validate details
  const handleStep1 = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setStep(2);
  };

  // Step 2 — create account then go to payment
  const handleStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      console.log('✅ Registration successful, moving to payment');
      setStep(3);
    } catch (err) {
      console.error('❌ Registration failed:', err);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — after payment success
  const handlePaymentSuccess = () => {
    toast.success('🎉 Welcome! Redirecting to dashboard…');
    navigate('/dashboard');
  };

  // Skip payment — go to dashboard without subscribing
  const handleSkip = () => {
    toast.success('You can subscribe anytime from your dashboard.');
    navigate('/dashboard');
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

  const stepLabels = ['Your details', 'Choose plan', 'Payment'];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '64px',
        background: 'linear-gradient(160deg, #0D1F0F 60%, #162A18 100%)',
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            'linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: step === 2 ? '640px' : '440px',
          margin: '2rem 1.5rem',
          position: 'relative',
          zIndex: 1,
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link
            to="/"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#C9A84C',
              display: 'block',
              marginBottom: '2rem',
              textDecoration: 'none',
            }}
          >
            GolfGive
          </Link>

          {/* Step indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0',
              marginBottom: '1.75rem',
            }}
          >
            {stepLabels.map((label, i) => {
              const s = i + 1;
              const active = step === s;
              const complete = step > s;
              return (
                <div
                  key={s}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: complete
                          ? '#4A7C59'
                          : active
                          ? '#C9A84C'
                          : 'rgba(255,255,255,0.08)',
                        color: active || complete ? 'white' : 'rgba(240,237,230,0.3)',
                        transition: 'all 0.3s',
                      }}
                    >
                      {complete ? '✓' : s}
                    </div>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        color: active ? '#C9A84C' : 'rgba(240,237,230,0.3)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {s < 3 && (
                    <div
                      style={{
                        width: '48px',
                        height: '1px',
                        marginBottom: '18px',
                        background: step > s ? '#4A7C59' : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.3s',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <h1
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#F0EDE6',
              marginBottom: '0.5rem',
            }}
          >
            {step === 1 && 'Create your account'}
            {step === 2 && 'Choose your plan'}
            {step === 3 && 'Activate subscription'}
          </h1>
          <p style={{ color: 'rgba(240,237,230,0.5)', fontSize: '0.95rem' }}>
            {step === 1 && 'Start playing with purpose today'}
            {step === 2 && 'Pick the plan that works for you'}
            {step === 3 && 'One payment to enter every draw this month'}
          </p>
        </div>

        {/* ── STEP 1 — Account details ── */}
        {step === 1 && (
          <div
            className="card"
            style={{
              padding: '2.5rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <form onSubmit={handleStep1}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label" style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(240,237,230,0.7)' }}>
                  Full name
                </label>
                <input
                  className="input-field"
                  type="text"
                  name="fullName"
                  placeholder="John Smith"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#F0EDE6',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label" style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(240,237,230,0.7)' }}>
                  Email address
                </label>
                <input
                  className="input-field"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#F0EDE6',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label" style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(240,237,230,0.7)' }}>
                  Password
                </label>
                <input
                  className="input-field"
                  type="password"
                  name="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#F0EDE6',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label className="label" style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(240,237,230,0.7)' }}>
                  Confirm password
                </label>
                <input
                  className="input-field"
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#F0EDE6',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  padding: '0.875rem',
                  background: '#C9A84C',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Continue →
              </button>
            </form>
            <hr style={{ margin: '2rem 0', borderColor: 'rgba(255,255,255,0.06)' }} />
            <p
              style={{
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'rgba(240,237,230,0.5)',
              }}
            >
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#C9A84C', fontWeight: 500, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* ── STEP 2 — Plan selection ── */}
        {step === 2 && (
          <form onSubmit={handleStep2}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  style={{
                    padding: '1.75rem',
                    border: `2px solid ${
                      plan === p.id ? '#C9A84C' : 'rgba(255,255,255,0.08)'
                    }`,
                    borderRadius: '12px',
                    background: plan === p.id ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  {p.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '12px',
                        fontSize: '0.65rem',
                        background: '#4A7C59',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                  <div
                    style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#F0EDE6',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: 600,
                        color: plan === p.id ? '#C9A84C' : '#F0EDE6',
                      }}
                    >
                      {p.price}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'rgba(240,237,230,0.4)',
                        marginLeft: '0.35rem',
                      }}
                    >
                      {p.period}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {p.perks.map((perk) => (
                      <div
                        key={perk}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.8rem',
                          color: 'rgba(240,237,230,0.6)',
                        }}
                      >
                        <span style={{ color: '#C9A84C', fontSize: '0.7rem' }}>✓</span>
                        {perk}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#F0EDE6',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '0.875rem',
                  textAlign: 'center',
                  background: '#C9A84C',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '⏳ Creating account…' : 'Continue to payment →'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3 — Stripe Payment ── */}
        {step === 3 && (
          <div
            className="card"
            style={{
              padding: '2.5rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Plan summary */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.875rem 1rem',
                background: 'rgba(201,168,76,0.07)',
                border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: '8px',
                marginBottom: '1.75rem',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(240,237,230,0.45)',
                    marginBottom: '0.2rem',
                  }}
                >
                  Selected plan
                </div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#F0EDE6',
                  }}
                >
                  {plan === 'MONTHLY' ? 'Monthly subscription' : 'Yearly subscription'}
                </div>
              </div>
              <div
                style={{
                  fontSize: '1.2rem',
                  color: '#C9A84C',
                  fontWeight: 600,
                }}
              >
                {plan === 'MONTHLY' ? '£9.99' : '£99.99'}
              </div>
            </div>

            {/* Stripe card element */}
            <Elements stripe={stripePromise}>
              <PaymentForm
                plan={plan}
                onSuccess={handlePaymentSuccess}
                onSkip={handleSkip}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}