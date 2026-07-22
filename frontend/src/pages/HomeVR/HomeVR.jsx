// HomeVR.jsx — full-screen background image, no header, only invisible clickable hotspots
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import homeVRImage from '../../assets/images/HomeVR.png';
import './HomeVR.css';

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
    <div className="vr-container">
      <div
        className="vr-image-container"
        style={{ backgroundImage: `url(${homeVRImage})` }}
      >
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
    </div>
  );
}