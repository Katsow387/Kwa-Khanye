import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import './AuthPages.css';

// Updated logo path
const logoPath = '/assets/images/KwaKhanye_logo.jpeg';

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
        <div className="auth-brand">
          <img 
            src={logoPath} 
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

        <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>

        <p className="auth-footer-text">
          New to the Kraal? <Link to="/signup" className="auth-redirect-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}