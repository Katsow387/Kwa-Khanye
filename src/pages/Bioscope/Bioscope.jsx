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
  const [hoveredFrame, setHoveredFrame] = useState(null);
  const [allArtists, setAllArtists] = useState([]);

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

      await fetchAllArtists();
      await fetchBioscopeContent();
    };
    init();
  }, [navigate, artistName]);

  // Fetch all artists for music videos and albums
  const fetchAllArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('id, name, country_id, culture_id')
        .order('name');

      if (error) throw error;
      setAllArtists(data || []);
    } catch (err) {
      console.error('Error fetching all artists:', err);
    }
  };

  const fetchBioscopeContent = async () => {
    try {
      setLoading(true);
      setError('');

      // If artistName is provided, find the artist first
      let artistId = null;
      if (artistName) {
        try {
          // Use .limit(1) instead of .maybeSingle() to avoid PGRST116 error
          const { data: artistData, error: artistError } = await supabase
            .from('artists')
            .select('id, name')
            .ilike('name', `%${artistName}%`)
            .limit(1);

          if (artistError) {
            console.error('Artist fetch error:', artistError);
            setError('Could not find this artist');
            setLoading(false);
            return;
          }

          // Check if we got any results
          if (!artistData || artistData.length === 0) {
            setError(`Artist "${artistName}" not found`);
            setLoading(false);
            return;
          }

          // Use the first result
          artistId = artistData[0].id;
          setArtist(artistData[0]);
        } catch (err) {
          console.error('Error fetching artist:', err);
          setError('Could not find this artist');
          setLoading(false);
          return;
        }
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

  // Handle Menu click
  const handleMenuClick = () => {
    if (artist) {
      navigate(`/bioscope-gallery?artist=${encodeURIComponent(artist.name)}`);
    } else {
      navigate('/bioscope-gallery');
    }
  };

  // Wall-picture hotspots — each frame goes straight to its own destination
  
  // 1st Frame: Biography - goes to the specific artist if one is selected
  const goToBiography = () => {
    if (artist?.id) navigate(`/artist/${artist.id}`);
    else if (artist?.name) navigate(`/artist?name=${encodeURIComponent(artist.name)}`);
    else navigate('/artists'); // Fallback to all artists
  };

  // 2nd Frame: Music Videos - shows music videos for ALL artists across all tribes
  const goToMusicVideo = () => {
    navigate(`/music?mode=all-videos`);
  };

  // 3rd Frame: Albums - shows albums for ALL artists across all tribes
  const goToAlbum = () => {
    navigate(`/music?mode=all-albums`);
  };

  // "Kwa Khanye" home sign — takes you back to the artist's page or home
  const goToArtistHome = () => {
    if (artist?.id) navigate(`/artist/${artist.id}`);
    else if (artist?.name) navigate(`/artist?name=${encodeURIComponent(artist.name)}`);
    else navigate('/');
  };

  // Handle Explore click
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

        {/* --- HOTSPOT: MENU — moved to match the real pill button (bottom-center-left) --- */}
        <div
          onClick={handleMenuClick}
          onMouseEnter={() => setHoverMenu(true)}
          onMouseLeave={() => setHoverMenu(false)}
          style={{
            position: 'absolute',
            left: '37%',
            top: '90%',
            width: '13%',
            height: '6%',
            cursor: 'pointer',
            zIndex: 25,
            background: hoverMenu
              ? 'radial-gradient(ellipse at center, rgba(232,168,76,0.25) 0%, rgba(198,122,52,0.1) 60%, transparent 100%)'
              : 'transparent',
            transition: 'background 0.3s ease',
            borderRadius: '50px',
          }}
          aria-label="Menu"
        >
          {/* Floating label for Menu */}
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            left: '50%',
            transform: hoverMenu ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(8px)',
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

        {/* --- HOTSPOT: EXPLORE — moved to match the real pill button (bottom-center-right) --- */}
        <div
          onClick={handleExploreClick}
          onMouseEnter={() => setHoverExplore(true)}
          onMouseLeave={() => setHoverExplore(false)}
          style={{
            position: 'absolute',
            left: '50%',
            top: '90%',
            width: '13%',
            height: '6%',
            cursor: 'pointer',
            zIndex: 25,
            background: hoverExplore
              ? 'radial-gradient(ellipse at center, rgba(232,168,76,0.25) 0%, rgba(198,122,52,0.1) 60%, transparent 100%)'
              : 'transparent',
            transition: 'background 0.3s ease',
            borderRadius: '50px',
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

        {/* --- WALL PICTURE HOTSPOTS: 1st = Biography, 2nd = Music Video (ALL ARTISTS), 3rd = Albums (ALL ARTISTS) --- */}
        {[
          { key: 'poster',   label: 'Biography',   onClick: goToBiography,  left: '15.5%', top: '17%', width: '19.5%', height: '25%' },
          { key: 'video',    label: 'Music Videos',  onClick: goToMusicVideo, left: '41%',   top: '17%', width: '20%',   height: '25%' },
          { key: 'arrivals', label: 'Albums',       onClick: goToAlbum,      left: '66%',   top: '15%', width: '22%',   height: '27%' },
        ].map(frame => (
          <div
            key={frame.key}
            onClick={frame.onClick}
            onMouseEnter={() => setHoveredFrame(frame.key)}
            onMouseLeave={() => setHoveredFrame(null)}
            style={{
              position: 'absolute',
              left: frame.left,
              top: frame.top,
              width: frame.width,
              height: frame.height,
              cursor: 'pointer',
              zIndex: 20,
              background: hoveredFrame === frame.key
                ? 'radial-gradient(ellipse at center, rgba(232,168,76,0.18) 0%, rgba(198,122,52,0.08) 60%, transparent 100%)'
                : 'transparent',
              boxShadow: hoveredFrame === frame.key
                ? 'inset 0 0 30px rgba(232,168,76,0.2), 0 0 40px rgba(198,122,52,0.15)'
                : 'none',
              transition: 'background 0.3s ease, box-shadow 0.3s ease',
              borderRadius: '4px',
            }}
            aria-label={frame.label}
          />
        ))}

        {/* --- HOTSPOT: HOME (the "Kwa Khanye" wooden sign) — back to the artist page --- */}
        <div
          onClick={goToArtistHome}
          onMouseEnter={() => setHoveredFrame('home')}
          onMouseLeave={() => setHoveredFrame(null)}
          style={{
            position: 'absolute',
            left: '38%',
            top: '41%',
            width: '26%',
            height: '7%',
            cursor: 'pointer',
            zIndex: 20,
            background: hoveredFrame === 'home'
              ? 'radial-gradient(ellipse at center, rgba(232,168,76,0.18) 0%, rgba(198,122,52,0.08) 60%, transparent 100%)'
              : 'transparent',
            boxShadow: hoveredFrame === 'home'
              ? 'inset 0 0 30px rgba(232,168,76,0.2), 0 0 40px rgba(198,122,52,0.15)'
              : 'none',
            transition: 'background 0.3s ease, box-shadow 0.3s ease',
            borderRadius: '8px',
          }}
          aria-label="Home"
        />

        {/* BOTTOM HINT */}
        <div style={{
          position: 'absolute',
          bottom: '2%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 15,
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

          {/* Show count of all artists for music videos and albums */}
          {!artist && allArtists.length > 0 && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.55rem',
              letterSpacing: '0.12em',
              color: 'rgba(198,122,52,0.4)',
              margin: '0.2rem 0 0',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}>
              {allArtists.length} artists across all tribes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}