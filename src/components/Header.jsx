import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { LogOut } from 'lucide-react';

function getDisplayName(session) {
  if (!session) return null;
  const meta = session.user?.user_metadata || {};
  return meta.username || meta.full_name || meta.name || session.user?.email?.split('@')[0] || 'Member';
}

function getAvatarUrl(session) {
  return session?.user?.user_metadata?.avatar_url || null;
}

function AvatarIcon({ session, size = 20 }) {
  const url = getAvatarUrl(session);
  const name = getDisplayName(session) || '?';
  const initial = name.charAt(0).toUpperCase();

  if (url) {
    return (
      <img 
        src={url} 
        alt={name} 
        style={{
          width: size, 
          height: size, 
          borderRadius: '50%', 
          objectFit: 'cover',
        }} 
      />
    );
  }

  return (
    <div style={{
      width: size, 
      height: size, 
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #8B6914, #c67a34)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: "'Cinzel', serif", 
      fontWeight: 700,
      fontSize: size * 0.45, 
      color: '#fff', 
      flexShrink: 0,
    }}>{initial}</div>
  );
}

export default function Header({ session }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [uploading, setUploading] = useState(false);
  const displayName = getDisplayName(session);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { 
      alert('❌ File is too large. Max 2MB.'); 
      return; 
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { 
      alert('❌ Please upload a JPEG, PNG, GIF, or WEBP image.'); 
      return; 
    }

    setUploading(true);
    try {
      const user = session?.user;
      if (!user) throw new Error('Not authenticated');
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
        
      if (error) throw new Error(`Upload failed: ${error.message}`);
      
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.auth.updateUser({ data: { avatar_url: urlData.publicUrl } });
      await supabase.auth.refreshSession();
      window.location.reload();
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setUploading(false);
      setMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setMenuOpen(false);
    setSigningOut(false);
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="header-left-group">
        <span className="brand-logo-text">Kraal Culture</span>
        
        {session && (
          <div className="user-profile-badge" onClick={() => setMenuOpen(o => !o)}>
            <AvatarIcon session={session} size={34} />
            <span className="profile-name">Welcome, {displayName}</span>
            <span className="arrow-indicator">{menuOpen ? '▲' : '▼'}</span>
          </div>
        )}
      </div>

      <nav className="nav-container">
        <ul className="nav-list">
          {session ? (
            <li>
              <button onClick={handleSignOut} disabled={signingOut} className="nav-action-btn logout-btn">
                <LogOut size={13} strokeWidth={2.5} />
                <span className="nav-label">Logout</span>
              </button>
            </li>
          ) : (
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '0.5rem' }}>
              <a href="/login" className="auth-nav-link">Sign In</a>
              <a href="/signup" className="auth-nav-link join-btn">Join</a>
            </li>
          )}
        </ul>
      </nav>

      {menuOpen && session && (
        <div className="profile-dropdown-menu">
          <div className="dropdown-info-section">
            <div className="dropdown-label">Signed in as</div>
            <div className="dropdown-username">{displayName}</div>
          </div>
          <div style={{ padding: '0.4rem 1rem' }}>
            <label htmlFor="avatar-upload" className="dropdown-action-item" style={{ cursor: 'pointer' }}>
              {uploading ? 'Uploading…' : '🖼 Change Avatar'}
            </label>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarUpload} 
              disabled={uploading} 
              style={{ display: 'none' }} 
            />
          </div>
          <button onClick={handleSignOut} disabled={signingOut} className="dropdown-signout-btn">
            {signingOut ? 'Signing out…' : '↪ Sign Out'}
          </button>
        </div>
      )}
    </header>
  );
}