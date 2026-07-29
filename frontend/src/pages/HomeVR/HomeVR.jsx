// HomeVR.jsx — full-screen background image with invisible clickable hotspots
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
      <div className="vr-image-container">
        <img 
          src={homeVRImage} 
          alt="Virtual Kraal" 
          className="vr-image" 
        />
        {/* NFT FRAME HOTSPOT (left) — INVISIBLE */}
        <div
          onClick={() => navigate('/nft')}
          className="vr-hotspot vr-hotspot-left"
        />
        {/* ONLINE STORE FRAME HOTSPOT (right) — INVISIBLE */}
        <div
          onClick={() => navigate('/store')}
          className="vr-hotspot vr-hotspot-right"
        />
      </div>
    </div>
  );
}