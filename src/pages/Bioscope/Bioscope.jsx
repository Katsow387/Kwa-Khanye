// Bioscope.jsx — background image with hotspots and real data
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import bioscopeImage from '../../assets/images/Bioscope Kraal.png';

export default function Bioscope() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoverMenu, setHoverMenu] = useState(false);
  const [hoverExplore, setHoverExplore] = useState(false);
  const [bioscopeContent, setBioscopeContent] = useState([]);
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

      await fetchBioscopeContent();
    };
    init();
  }, [navigate, artistName]);

  const fetchBioscopeContent = async () => {
    try {
      setLoading(true);
      setError('');

      // If artistName is provided, find the artist first
      let artistId = null;
      if (artistName) {
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('id, name, has_bioscope')
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

        if (!artistData.has_bioscope) {
          setError(`${artistData.name} doesn't have Bioscope content available yet`);
          setLoading(false);
          return;
        }

        artistId = artistData.id;
        setArtist(artistData);
      }

      // Fetch Bioscope content - direct Supabase query
      let query = supabase
        .from('bioscope_content')
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
        console.error('Bioscope content fetch error:', fetchError);
        if (fetchError.code === '42P01') {
          setError('Bioscope content is being set up. Check back soon!');
          setBioscopeContent([]);
          setLoading(false);
          return;
        }
        throw fetchError;
      }

      setBioscopeContent(data || []);
    } catch (err) {
      console.error('Error in fetchBioscopeContent:', err);
      setError('Failed to load Bioscope content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Menu click (top right)
  const handleMenuClick = () => {
    if (artist) {
      navigate(`/bioscope-gallery?artist=${encodeURIComponent(artist.name)}`);
    } else {
      navigate('/bioscope-gallery');
    }
  };

  // Handle Explore click (bottom center)
  const handleExploreClick = () => {
    if (artist) {
      navigate(`/bioscope-gallery?artist=${encodeURIComponent(artist.name)}&explore=true`);
    } else {
      navigate('/bioscope-gallery');
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
          Loading Bioscope content...
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
        <div style={{ fontSize: '3rem', opacity: 0.4 }}>🎬</div>
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
        
        {/* --- HOTSPOT: MENU (top‑right area) --- */}
        <div
          onClick={handleMenuClick}
          onMouseEnter={() => setHoverMenu(true)}
          onMouseLeave={() => setHoverMenu(false)}
          style={{
            position: 'absolute',
            top: '5%',
            right: '5%',
            width: '15%',
            height: '10%',
            cursor: 'pointer',
            zIndex: 20,
            background: hoverMenu
              ? 'radial-gradient(ellipse at center, rgba(232,168,76,0.18) 0%, rgba(198,122,52,0.08) 60%, transparent 100%)'
              : 'transparent',
            transition: 'background 0.4s ease',
            borderRadius: '8px',
          }}
          aria-label="Menu"
        >
          {/* Floating label for Menu */}
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            right: '0',
            transform: hoverMenu ? 'translateY(0)' : 'translateY(8px)',
            opacity: hoverMenu ? 1 : 0,
            transition: 'all 0.35s ease',
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(10,6,3,0.92)',
              border: '1px solid rgba(198,122,52,0.6)',
              borderRadius: '8px',
              padding: '0.4rem 1rem',
              backdropFilter: 'blur(8px)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(0.8rem, 1.2vw, 1.2rem)',
                fontWeight: 700,
                color: '#f4d090',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Bioscope Gallery
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: '#c67a34',
                textTransform: 'uppercase',
              }}>
                {bioscopeContent.length} Films Available
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
        </div>

        {/* --- HOTSPOT: EXPLORE (bottom‑center area) --- */}
        <div
          onClick={handleExploreClick}
          onMouseEnter={() => setHoverExplore(true)}
          onMouseLeave={() => setHoverExplore(false)}
          style={{
            position: 'absolute',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '25%',
            height: '12%',
            cursor: 'pointer',
            zIndex: 20,
            background: hoverExplore
              ? 'radial-gradient(ellipse at center, rgba(232,168,76,0.18) 0%, rgba(198,122,52,0.08) 60%, transparent 100%)'
              : 'transparent',
            transition: 'background 0.4s ease',
            borderRadius: '8px',
          }}
          aria-label="Explore"
        >
          {/* Floating label for Explore */}
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            left: '50%',
            transform: hoverExplore ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(8px)',
            opacity: hoverExplore ? 1 : 0,
            transition: 'all 0.35s ease',
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(10,6,3,0.92)',
              border: '1px solid rgba(198,122,52,0.6)',
              borderRadius: '8px',
              padding: '0.4rem 1rem',
              backdropFilter: 'blur(8px)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(0.8rem, 1.2vw, 1.2rem)',
                fontWeight: 700,
                color: '#f4d090',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Explore Films
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: '#c67a34',
                textTransform: 'uppercase',
              }}>
                {artist ? `· ${artist.name}` : 'Featured Content'}
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
        </div>

        {/* BOTTOM HINT */}
        <div style={{
          position: 'absolute',
          bottom: '2%',
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
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(244,208,144,0.7)',
            margin: 0,
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}>
            Hover over a hotspot to explore
          </p>
          {artist && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.55rem',
              letterSpacing: '0.12em',
              color: 'rgba(198,122,52,0.5)',
              margin: '0.2rem 0 0',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}>
              {bioscopeContent.length} films • {artist.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}