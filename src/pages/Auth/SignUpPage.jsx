import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import './AuthPages.css';

// Import your WhatsApp logo
const whatsappLogo = '/assets/images/WhatsApp Image 2026-06-02 at 14.41.43.jpeg';

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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: trimmedUsername,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

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
        redirectTo: window.location.origin,
      },
    });
    if (error) setError(error.message);
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-bg-blur">Kwa Khanye</div>
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-brand" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
            <img 
              src={whatsappLogo} 
              alt="Kwa Khanye Logo" 
              style={{ 
                width: '48px', 
                height: '48px', 
                objectFit: 'cover',
                borderRadius: '50%'
              }} 
            />
          </div>
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
          <img 
            src={whatsappLogo} 
            alt="Kwa Khanye Logo" 
            style={{ 
              width: '36px', 
              height: '36px', 
              objectFit: 'cover',
              borderRadius: '50%'
            }} 
          />
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