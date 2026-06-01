import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import './AuthPages.css';
import './ForgotPasswordPage.css';

// ─── Shared Logo ─────────────────────────────────────────────────────────────
function KraLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="50,5 10,55 90,55" fill="#8B6914" />
      <rect x="8" y="53" width="84" height="6" rx="2" fill="#5C4208" />
      <ellipse cx="50" cy="72" rx="32" ry="22" fill="#D4895A" />
      <polyline
        points="18,55 24,47 30,55 36,47 42,55 48,47 54,55 60,47 66,55 72,47 78,55 84,47"
        fill="none"
        stroke="#8B3A0F"
        strokeWidth="2"
      />
      <rect x="42" y="68" width="16" height="20" rx="8" fill="#6B2D0A" />
      <circle cx="50" cy="5" r="5" fill="#5C4208" />
    </svg>
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

// ─── Step 2 : Update Password (landed from email link) ────────────────────────
function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is now in a temporary session — ready to update password
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

  // Derive strength level for CSS class
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
          {/* New Password */}
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

          {/* Strength hint */}
          {password.length > 0 && (
            <p className={`fp-strength ${strengthClass}`}>{strengthLabel}</p>
          )}

          {/* Confirm Password */}
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
// Route /forgot-password → <ForgotPasswordPage />
// Route /reset-password  → <ResetPasswordPage />
export function ForgotPasswordPage() {
  return <RequestReset />;
}

export function ResetPasswordPage() {
  return <UpdatePassword />;
}

export default ForgotPasswordPage;