// HomeVR.jsx — full-screen background image with hotspots and real data
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import homeVRImage from '../../assets/images/HomeVR.png';

export default function HomeVR() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoverNft, setHoverNft] = useState(false);
  const [hoverStore, setHoverStore] = useState(false);
  const [vrContent, setVrContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [artist, setArtist] = useState(null);

  // Get artist from URL params
  const searchParams = new URLSearchParams(location.search);
  const artistName = searchParams.get('artist');

  // Auth check and fetch data
  useEffect(() => {
    const init = async () => {
      // Auth check
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

      await fetchVRContent();
    };
    init();
  }, [navigate, artistName]);

  const fetchVRContent = async () => {
    try {
      setLoading(true);
      setError('');

      // If artistName is provided, find the artist first
      let artistId = null;
      if (artistName) {
        // No has_vr gate — every artist, from every tribe, can be browsed
        // here, the same way Music works for any artist searched.
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('id, name')
          .ilike('name', `%${artistName}%`)
          .maybeSingle();

        if (artistError) {
          console.error('Artist fetch error:', artistError);
          setError('Could not find this artist');
          setLoading(false);
          return;
        }

        if (!artistData) {
          setError(`Artist "${artistName}" not found`);
          setLoading(false);
          return;
        }

        artistId = artistData.id;
        setArtist(artistData);
      }

      // Fetch VR content - direct Supabase query
      let query = supabase
        .from('vr_content')
        .select('*, artists(name, country_id, culture_id)');

      if (artistId) {
        query = query.eq('artist_id', artistId);
      } else {
        query = query.eq('featured', true);
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .limit(12);

      if (fetchError) {
        console.error('VR content fetch error:', fetchError);
        // If table doesn't exist yet, show a friendly message
        if (fetchError.code === '42P01') { // relation does not exist
          setError('VR content is being set up. Check back soon!');
          setVrContent([]);
          setLoading(false);
          return;
        }
        throw fetchError;
      }

      setVrContent(data || []);
    } catch (err) {
      console.error('Error in fetchVRContent:', err);
      setError('Failed to load VR content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle NFT Gallery click
  const handleNFTClick = () => {
    if (artist) {
      navigate(`/vr-gallery?artist=${encodeURIComponent(artist.name)}`);
    } else {
      navigate('/vr-gallery');
    }
  };

  // Handle Store click
  const handleStoreClick = () => {
    if (artist) {
      navigate(`/vr-store?artist=${encodeURIComponent(artist.name)}`);
    } else {
      navigate('/vr-store');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0603',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#c67a34',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
            }} />
          ))}
        </div>
        <p style={{ 
          color: 'rgba(244,208,144,0.6)', 
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.9rem'
        }}>
          Loading VR experiences...
        </p>
        <style>{`
          @keyframes pulse {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0603',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '3rem', opacity: 0.4 }}>🥽</div>
        <h2 style={{ 
          color: '#f4d090', 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: '1.5rem',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          {error}
        </h2>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg, #8B6914, #c67a34)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          ← Back to Explore
        </button>
      </div>
    );
  }

  // Main render
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
      {/* NFT FRAME HOTSPOT (left) */}
      <div
        onClick={handleNFTClick}
        onMouseEnter={() => setHoverNft(true)}
        onMouseLeave={() => setHoverNft(false)}
        style={{
          position: 'absolute',
          left: '8.5%',
          top: '25.4%',
          width: '39.1%',
          height: '47.5%',
          zIndex: 20,
          cursor: 'pointer',
          background: hoverNft
            ? 'radial-gradient(ellipse at center, rgba(232,168,76,0.18) 0%, rgba(198,122,52,0.08) 60%, transparent 100%)'
            : 'transparent',
          boxShadow: hoverNft
            ? 'inset 0 0 40px rgba(232,168,76,0.25), 0 0 60px rgba(198,122,52,0.2)'
            : 'none',
          transition: 'background 0.4s ease, box-shadow 0.4s ease',
          borderRadius: '2px',
        }}
      >
        {/* Floating label */}
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 14px)',
          left: '50%',
          transform: hoverNft ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(8px)',
          opacity: hoverNft ? 1 : 0,
          transition: 'all 0.35s ease',
          pointerEvents: 'none',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            background: 'rgba(10,6,3,0.92)',
            border: '1px solid rgba(198,122,52,0.6)',
            borderRadius: '8px',
            padding: '0.5rem 1.25rem',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.1rem, 2vw, 1.6rem)',
              fontWeight: 700,
              color: '#f4d090',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              VR Gallery
            </div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              color: '#c67a34',
              textTransform: 'uppercase',
              marginTop: '0.1rem',
            }}>
              {vrContent.length} Experiences {artist ? `· ${artist.name}` : ''} → Click to Enter
            </div>
          </div>
          <div style={{
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid rgba(198,122,52,0.6)',
            margin: '0 auto',
          }} />
        </div>

        {/* Corner accents on hover */}
        {hoverNft && <>
          <div style={{ position:'absolute', top:8, left:8, width:20, height:20, borderTop:'2px solid #e8a84c', borderLeft:'2px solid #e8a84c', opacity:0.8 }} />
          <div style={{ position:'absolute', top:8, right:8, width:20, height:20, borderTop:'2px solid #e8a84c', borderRight:'2px solid #e8a84c', opacity:0.8 }} />
          <div style={{ position:'absolute', bottom:8, left:8, width:20, height:20, borderBottom:'2px solid #e8a84c', borderLeft:'2px solid #e8a84c', opacity:0.8 }} />
          <div style={{ position:'absolute', bottom:8, right:8, width:20, height:20, borderBottom:'2px solid #e8a84c', borderRight:'2px solid #e8a84c', opacity:0.8 }} />
        </>}
      </div>

      {/* ONLINE STORE FRAME HOTSPOT (right) */}
      <div
        onClick={handleStoreClick}
        onMouseEnter={() => setHoverStore(true)}
        onMouseLeave={() => setHoverStore(false)}
        style={{
          position: 'absolute',
          left: '54.7%',
          top: '25.4%',
          width: '30.9%',
          height: '47.5%',
          zIndex: 20,
          cursor: 'pointer',
          background: hoverStore
            ? 'radial-gradient(ellipse at center, rgba(232,168,76,0.18) 0%, rgba(198,122,52,0.08) 60%, transparent 100%)'
            : 'transparent',
          boxShadow: hoverStore
            ? 'inset 0 0 40px rgba(232,168,76,0.25), 0 0 60px rgba(198,122,52,0.2)'
            : 'none',
          transition: 'background 0.4s ease, box-shadow 0.4s ease',
          borderRadius: '2px',
        }}
      >
        {/* Floating label */}
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 14px)',
          left: '50%',
          transform: hoverStore ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(8px)',
          opacity: hoverStore ? 1 : 0,
          transition: 'all 0.35s ease',
          pointerEvents: 'none',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            background: 'rgba(10,6,3,0.92)',
            border: '1px solid rgba(198,122,52,0.6)',
            borderRadius: '8px',
            padding: '0.5rem 1.25rem',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.1rem, 2vw, 1.6rem)',
              fontWeight: 700,
              color: '#f4d090',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              VR Store
            </div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              color: '#c67a34',
              textTransform: 'uppercase',
              marginTop: '0.1rem',
            }}>
              Click to Enter →
            </div>
          </div>
          <div style={{
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid rgba(198,122,52,0.6)',
            margin: '0 auto',
          }} />
        </div>

        {/* Corner accents on hover */}
        {hoverStore && <>
          <div style={{ position:'absolute', top:8, left:8, width:20, height:20, borderTop:'2px solid #e8a84c', borderLeft:'2px solid #e8a84c', opacity:0.8 }} />
          <div style={{ position:'absolute', top:8, right:8, width:20, height:20, borderTop:'2px solid #e8a84c', borderRight:'2px solid #e8a84c', opacity:0.8 }} />
          <div style={{ position:'absolute', bottom:8, left:8, width:20, height:20, borderBottom:'2px solid #e8a84c', borderLeft:'2px solid #e8a84c', opacity:0.8 }} />
          <div style={{ position:'absolute', bottom:8, right:8, width:20, height:20, borderBottom:'2px solid #e8a84c', borderRight:'2px solid #e8a84c', opacity:0.8 }} />
        </>}
      </div>

      {/* BOTTOM HINT */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        textAlign: 'center',
        pointerEvents: 'none',
        animation: 'pulseHint 2.5s ease-in-out infinite',
      }}>
        <style>{`
          @keyframes pulseHint {
            0%, 100% { opacity: 0.5; transform: translateX(-50%) translateY(0); }
            50% { opacity: 1; transform: translateX(-50%) translateY(-4px); }
          }
        `}</style>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.72rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(244,208,144,0.8)',
          margin: 0,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}>
          Hover over a frame to explore
        </p>
        {artist && (
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            color: 'rgba(198,122,52,0.6)',
            margin: '0.3rem 0 0',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}>
            {vrContent.length} VR experiences • {artist.name}
          </p>
        )}
      </div>
    </div>
  );
}