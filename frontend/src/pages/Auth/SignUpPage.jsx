import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import './AuthPages.css';

const logoPath = '/assets/images/KwaKhanye_logo.jpeg';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // new
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername || trimmedUsername.length < 3) {
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

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', trimmedUsername)
      .maybeSingle();

    if (existingUser) {
      setError('That username is already taken.');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: trimmedUsername,
          role: role, // store role in metadata
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      // Insert role into user_roles table
      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: role,
      });

      // Redirect based on role
      if (role === 'artist') {
        navigate('/artist-application');
      } else {
        navigate('/login');
      }
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    // Similar logic – you can set role via query param or choose after redirect
    // For simplicity, we'll skip Google for now.
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-blur">Kwa Khanye</div>
      <div className="auth-card">
        <div className="auth-brand">
          <img src={logoPath} alt="Kwa Khanye Logo" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '50%' }} />
          <span className="brand-name">Kwa Khanye</span>
        </div>

        <h1 className="auth-title">Join the Kraal</h1>
        <p className="auth-subtitle">Create your account</p>

        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <label style={{ color: '#f4d090', marginRight: '1rem' }}>I am a:</label>
          <label style={{ marginRight: '1rem', color: '#f4d090' }}>
            <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} /> Customer
          </label>
          <label style={{ color: '#f4d090' }}>
            <input type="radio" name="role" value="artist" checked={role === 'artist'} onChange={() => setRole('artist')} /> Artist
          </label>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" className="form-input" placeholder="warrior_of_khanye" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="your.name@culture.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '🙈'}</span>
            </div>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-redirect-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}