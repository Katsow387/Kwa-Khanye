import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import './AuthPages.css';
import './ForgotPasswordPage.css';

const logoPath = '/assets/images/KwaKhanye_logo.jpeg';

// ─── Shared Logo ─────────────────────────────────────────────────────────────
function KraLogo({ size = 36 }) {
  return (
    <img 
      src={logoPath} 
      alt="Kwa Khanye Logo" 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        objectFit: 'cover',
        borderRadius: '50%'
      }} 
    />
  );
}

// ─── Step 1 : Request Reset ───────────────────────────────────────────────────
function RequestReset() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="auth-container">
        <div className="auth-bg-blur">Kwa Khanye</div>
        <div className="auth-card auth-card--centered">
          <div className="auth-brand auth-brand--centered">
            <KraLogo size={48} />
          </div>

          <div className="fp-status-badge">✓ Message Sent</div>

          <h2 className="auth-title fp-success-title">Check your fire 🔥</h2>
          <p className="auth-subtitle fp-success-subtitle">
            A reset link has been sent to{' '}
            <strong className="fp-email-highlight">{email}</strong>.
            <br />
            Follow the link to choose a new password.
          </p>

          <Link to="/login" className="submit-btn fp-back-btn">
            Back to Sign In
          </Link>

          <button
            type="button"
            className="forgot-password-link fp-retry-btn"
            onClick={() => { setSent(false); setEmail(''); }}
          >
            Didn't receive it? Try again
          </button>

          <p className="fp-footer-note">Kwa Khanye &mdash; Home of Culture</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-bg-blur">Kwa Khanye</div>
      <div className="auth-card">
        <div className="auth-brand">
          <KraLogo size={36} />
          <span className="brand-name">Kwa Khanye</span>
        </div>

        <h1 className="auth-title">Rekindle Your Fire</h1>
        <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="label-row">
              <label className="form-label">Email Address</label>
            </div>
            <div className="input-wrapper">
              <input
                type="email"
                className="form-input"
                placeholder="your.name@culture.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-footer-text fp-footer-spacing">
          Remembered it?{' '}
          <Link to="/login" className="auth-redirect-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Step 2 : Update Password ─────────────────────────────────────────────────
function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [isValidSession, setIsValidSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsValidSession(false);
        setError('This reset link is invalid or has expired. Please request a new one.');
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && session) {
          setIsValidSession(true);
        } else {
          setIsValidSession(false);
          setError('Invalid reset session. Please request a new reset link.');
        }
      }
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
        setError('');
      } else if (event === 'SIGNED_OUT' && !session) {
        setIsValidSession(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  if (!isValidSession && !done) {
    return (
      <div className="auth-container">
        <div className="auth-bg-blur">Kwa Khanye</div>
        <div className="auth-card auth-card--centered">
          <div className="auth-brand auth-brand--centered">
            <KraLogo size={48} />
          </div>

          <div className="fp-status-badge" style={{ background: '#dc2626' }}>⚠️ Link Expired</div>

          <h2 className="auth-title fp-success-title">Reset Link Expired</h2>
          <p className="auth-subtitle fp-success-subtitle">
            This password reset link is invalid or has expired.
            <br />
            Please request a new password reset link.
          </p>

          <Link to="/forgot-password" className="submit-btn fp-back-btn">
            Request New Link
          </Link>

          <Link to="/login" className="forgot-password-link fp-retry-btn">
            Back to Sign In
          </Link>

          <p className="fp-footer-note">Kwa Khanye &mdash; Home of Culture</p>
        </div>
      </div>
    );
  }

  const strengthClass =
    password.length === 0
      ? ''
      : password.length < 6
      ? 'fp-strength--weak'
      : password.length < 10
      ? 'fp-strength--fair'
      : 'fp-strength--strong';

  const strengthLabel =
    password.length === 0
      ? ''
      : password.length < 6
      ? 'Too short'
      : password.length < 10
      ? 'Decent — could be stronger'
      : 'Strong password ✓';

  if (done) {
    return (
      <div className="auth-container">
        <div className="auth-bg-blur">Kwa Khanye</div>
        <div className="auth-card auth-card--centered">
          <div className="auth-brand auth-brand--centered">
            <KraLogo size={48} />
          </div>

          <div className="fp-status-badge">✓ Password Updated</div>

          <h2 className="auth-title fp-success-title">The fire is relit 🔥</h2>
          <p className="auth-subtitle fp-success-subtitle">
            Your password has been updated successfully.
            <br />
            You can now sign in with your new password.
          </p>

          <button className="submit-btn fp-submit-flush" onClick={() => navigate('/login')}>
            Sign In Now
          </button>

          <p className="fp-footer-note">Kwa Khanye &mdash; Home of Culture</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-bg-blur">Kwa Khanye</div>
      <div className="auth-card">
        <div className="auth-brand">
          <KraLogo size={36} />
          <span className="brand-name">Kwa Khanye</span>
        </div>

        <h1 className="auth-title">Choose a New Password</h1>
        <p className="auth-subtitle">Make it strong — protect the Kraal</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="label-row">
              <label className="form-label">New Password</label>
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'hide' : 'show'}
              </button>
            </div>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '🙈'}
              </span>
            </div>
          </div>

          {password.length > 0 && (
            <p className={`fp-strength ${strengthClass}`}>{strengthLabel}</p>
          )}

          <div className="form-group">
            <div className="label-row">
              <label className="form-label">Confirm Password</label>
            </div>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  return <RequestReset />;
}

export function ResetPasswordPage() {
  return <UpdatePassword />;
}

export default ForgotPasswordPage;