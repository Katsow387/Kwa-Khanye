import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import './AuthPages.css';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // --- Basic validation ---
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedUsername) {
      setError('Username is required');
      setLoading(false);
      return;
    }
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }
    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, and underscores');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // --- Check if username is already taken ---
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', trimmedUsername)
      .maybeSingle();

    if (checkError) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    if (existingUser) {
      setError('That username is already taken. Try another one.');
      setLoading(false);
      return;
    }

    // --- Sign up the user ---
    // The database trigger (handle_new_user) will automatically
    // insert a row into public.profiles when auth.users gets the new user.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: trimmedUsername, // stored in raw_user_meta_data, picked up by trigger
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Supabase returns a user even if email confirmation is pending
    // data.user will exist but data.session will be null until confirmed
    if (data?.user) {
      setSuccess(true);
    }

    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // redirect back to home after Google OAuth
      },
    });
    if (error) setError(error.message);
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-bg-blur">Kwa Khanye</div>
        <div className="auth-card" style={{ textAlign: 'center' }}>

          {/* Logo */}
          <div className="auth-brand" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg width="48" height="48" viewBox="0 0 100 100">
              <polygon points="50,5 10,55 90,55" fill="#8B6914"/>
              <rect x="8" y="53" width="84" height="6" rx="2" fill="#5C4208"/>
              <ellipse cx="50" cy="72" rx="32" ry="22" fill="#D4895A"/>
              <polyline points="18,55 24,47 30,55 36,47 42,55 48,47 54,55 60,47 66,55 72,47 78,55 84,47" fill="none" stroke="#8B3A0F" strokeWidth="2"/>
              <rect x="42" y="68" width="16" height="20" rx="8" fill="#6B2D0A"/>
              <circle cx="50" cy="5" r="5" fill="#5C4208"/>
            </svg>
          </div>

          {/* Success badge */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(198, 122, 52, 0.15)',
            border: '1px solid rgba(198, 122, 52, 0.4)',
            borderRadius: '50px',
            padding: '0.3rem 1rem',
            color: '#c67a34',
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            ✓ Account Created
          </div>

          <h2 className="auth-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            Sawubona, {username.trim()} 👋
          </h2>

          <p className="auth-subtitle" style={{ lineHeight: '1.6', marginBottom: '2rem' }}>
            You're now part of the Kraal.<br />
            A place where culture lives — music, art, stories & more await you.
          </p>

          <button
            className="submit-btn"
            onClick={() => navigate('/login')}
            style={{ marginTop: 0 }}
          >
            Sign In to Your Account
          </button>

          <p style={{ color: 'rgba(244,208,144,0.35)', fontSize: '0.78rem', marginTop: '1.25rem' }}>
            Kwa Khanye &mdash; Home of Culture
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-bg-blur">Kwa Khanye</div>
      <div className="auth-card">
        <div className="auth-brand">
          <svg width="36" height="36" viewBox="0 0 100 100">
            <polygon points="50,5 10,55 90,55" fill="#8B6914"/>
            <rect x="8" y="53" width="84" height="6" rx="2" fill="#5C4208"/>
            <ellipse cx="50" cy="72" rx="32" ry="22" fill="#D4895A"/>
            <polyline points="18,55 24,47 30,55 36,47 42,55 48,47 54,55 60,47 66,55 72,47 78,55 84,47" fill="none" stroke="#8B3A0F" strokeWidth="2"/>
            <rect x="42" y="68" width="16" height="20" rx="8" fill="#6B2D0A"/>
            <circle cx="50" cy="5" r="5" fill="#5C4208"/>
          </svg>
          <span className="brand-name">Kwa Khanye</span>
        </div>

        <h1 className="auth-title">Join the Kraal</h1>
        <p className="auth-subtitle">Create your account</p>

        <button type="button" className="google-btn" onClick={handleGoogleSignUp}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google Logo"
            className="google-icon"
          />
          Sign up with Google
        </button>

        <div className="divider">or with email</div>

        <form onSubmit={handleSubmit}>
          {/* USERNAME */}
          <div className="form-group">
            <div className="label-row">
              <label className="form-label">Username</label>
            </div>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="e.g., warrior_of_khanye"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* EMAIL */}
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

          {/* PASSWORD */}
          <div className="form-group">
            <div className="label-row">
              <label className="form-label">Password</label>
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

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-redirect-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
