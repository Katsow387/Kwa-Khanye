// Bioscope.jsx — background image with invisible hotspots for Menu and Explore
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import bioscopeImage from '../../assets/images/Bioscope Kraal.png';

export default function Bioscope() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login', { replace: true });
    };
    checkAuth();
  }, [navigate]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      // Traditional pattern on sides (terracotta/gold zigzag)
      backgroundImage: `
        repeating-linear-gradient(45deg, #c87a3e 0px, #c87a3e 2px, #e8a84c 2px, #e8a84c 8px),
        repeating-linear-gradient(135deg, #5c2e1a 0px, #5c2e1a 4px, #8b4a18 4px, #8b4a18 12px)
      `,
      backgroundBlendMode: 'overlay',
      backgroundColor: '#2a1a0e',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundImage: `url(${bioscopeImage})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        
        {/* --- INVISIBLE HOTSPOT: MENU (top‑right area) --- */}
        <div
          onClick={() => navigate('/')}   // change to '/' for homepage, or '/menu' etc.
          style={{
            position: 'absolute',
            top: '5%',
            right: '5%',
            width: '15%',
            height: '10%',
            cursor: 'pointer',
            zIndex: 20,
            backgroundColor: 'transparent',
          }}
          aria-label="Menu"
        />

        {/* --- INVISIBLE HOTSPOT: EXPLORE (bottom‑center area) --- */}
        <div
          onClick={() => navigate('/music')}   // change to '/homevr' or '/bioscope' as needed
          style={{
            position: 'absolute',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '25%',
            height: '12%',
            cursor: 'pointer',
            zIndex: 20,
            backgroundColor: 'transparent',
          }}
          aria-label="Explore"
        />

      </div>
    </div>
  );
}