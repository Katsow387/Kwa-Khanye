// HomeVR.jsx — full-screen background image, no header, only invisible clickable hotspots
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import homeVRImage from '../../assets/images/HomeVR.png';

export default function HomeVR() {
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
      backgroundImage: `url(${homeVRImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#0a0603',
    }}>
      {/* NFT FRAME HOTSPOT (left) — INVISIBLE */}
      <div
        onClick={() => navigate('/nft')}
        style={{
          position: 'absolute',
          left: '8.5%',
          top: '25.4%',
          width: '39.1%',
          height: '47.5%',
          zIndex: 20,
          cursor: 'pointer',
          background: 'transparent',
          borderRadius: '2px',
        }}
      />

      {/* ONLINE STORE FRAME HOTSPOT (right) — INVISIBLE */}
      <div
        onClick={() => navigate('/store')}
        style={{
          position: 'absolute',
          left: '54.7%',
          top: '25.4%',
          width: '30.9%',
          height: '47.5%',
          zIndex: 20,
          cursor: 'pointer',
          background: 'transparent',
          borderRadius: '2px',
        }}
      />
    </div>
  );
}