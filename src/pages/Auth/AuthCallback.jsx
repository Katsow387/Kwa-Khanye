import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Get the session after OAuth redirect
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if there was an intended destination before OAuth
        const intendedDestination = sessionStorage.getItem('oauthIntendedDestination');
        if (intendedDestination) {
          sessionStorage.removeItem('oauthIntendedDestination');
          localStorage.removeItem('intendedDestination');
          navigate(intendedDestination);
        } else {
          navigate('/');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
      color: '#f4d090'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #c67a34',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p>Completing sign in...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}