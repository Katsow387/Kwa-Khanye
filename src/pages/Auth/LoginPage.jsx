import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import './AuthPages.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setError(error.message);
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-blur">Kwa Khanye</div>
      <div className="auth-card">
        {/* ====== SVG LOGO (same as Navbar) ====== */}
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

        <h1 className="auth-title">Enter the Kraal</h1>
        <p className="auth-subtitle">Sign back into your account</p>

        <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google Logo" 
            className="google-icon"
          />
          Continue with Google
        </button>

        <div className="divider">or with email</div>

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
              <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '🙈'}
              </span>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* FIXED: Changed from <a> to <Link> */}
        <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>

        <p className="auth-footer-text">
          New to the Kraal? <Link to="/signup" className="auth-redirect-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}