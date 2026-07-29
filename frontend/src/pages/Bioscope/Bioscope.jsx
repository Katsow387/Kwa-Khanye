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
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('id, name')
          .ilike('name', `%${artistName}%`)
          .maybeSingle();

      if (cancelled) return;

      if (artistError || !artist) {
        console.warn(
          `[Bioscope] No artist found for slug "${artistSlug}". ` +
          'Biographer/Video/Album overlays will show empty-state messages ' +
          'instead of real content. Check that an artists row has ' +
          'bioscope_route set to this exact value.',
          artistError || ''
        );
        setArtistLookupDone(true);
        return;
      }

      setArtist(artist);
      setArtistId(artist.id);
      // Column name for the display name isn't confirmed — try the likely
      // candidates and fall back to deriving it from an album title below.
      setArtistName(artist.name || artist.artist_name || artist.stage_name || artist.full_name || '');

      const [videosRes, albumsRes] = await Promise.all([
        supabase
          .from('music_videos')
          .select('*')
          .eq('artist_id', artist.id)
          .order('featured', { ascending: false })
          .order('release_date', { ascending: false }),
        supabase
          .from('albums')
          .select('*')
          .eq('artist_id', artist.id)
          .order('featured', { ascending: false })
          .order('release_date', { ascending: false }),
      ]);

      if (cancelled) return;

      setVideos(videosRes.data || []);
      setAlbums(albumsRes.data || []);
      setArtistLookupDone(true);
    };

    loadArtistContent();
    return () => {
      cancelled = true;
    };
  }, [artistSlug]);

  const closeOverlay = () => {
    setOverlay(null);
    setSelectedVideo(null);
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
    setOverlay('video-player');
  };

  // Derives a display name for a track's "artist" field. Prefers the name
  // pulled from the artists table; falls back to parsing it out of the
  // album title, since your data uses "Artist Name - Album Title".
  const resolveArtistLabel = (album) => {
    if (artistName) return artistName;
    if (album?.title && album.title.includes(' - ')) {
      return album.title.split(' - ')[0];
    }
    return album?.title || '';
  };

  // Fetches an album's tracks and hands off to the existing Calabash
  // player at /now-playing, using the same { playlist, trackIndex, shuffle,
  // repeat } shape Music.jsx already passes — so albums played from the
  // Bioscope get shuffle/repeat/like for free instead of a separate player.
  const openAlbum = async (album) => {
    setOverlay('loading');
    const { data } = await supabase
      .from('album_tracks')
      .select('*')
      .eq('album_id', album.id)
      .order('track_number', { ascending: true });

    const tracks = data || [];
    if (tracks.length === 0) {
      // No tracks logged for this album yet — go back to the album list
      // rather than navigating away to somewhere unrelated.
      setOverlay('album-list');
      return;
    }

    const artistLabel = resolveArtistLabel(album);
    const playlist = tracks.map((t) => ({
      id: t.id,
      title: t.title,
      duration: t.duration,
      preview: t.preview_url,
      cover_small: album.cover_small || album.cover_medium || album.cover_image,
      artist: artistLabel,
    }));

    navigate('/now-playing', {
      state: {
        playlist,
        trackIndex: 0,
        shuffle: false,
        repeat: 'off',
      },
    });
  };

  // Column name for bio text isn't confirmed — try the likely candidates.
  const resolveBio = () => {
    if (!artist) return '';
    return (
      artist.bio ||
      artist.biography ||
      artist.about ||
      artist.description ||
      artist.artist_bio ||
      artist.story ||
      ''
    );
  };

  const handleHotspotClick = (spot) => {
    if (spot.kind === 'biographer') {
      // Always the overlay — never navigates on its own, so it can never
      // land you anywhere near Music by accident.
      setOverlay('biographer');
      return;
    }

    if (spot.kind === 'video') {
      // Always show the list — ItemGrid already renders an empty-state
      // message ("Nothing here yet.") if this artist has no videos, so
      // there's no silent redirect to somewhere else.
      setOverlay('video-list');
      return;
    }

    if (spot.kind === 'album') {
      setOverlay('album-list');
    }
  };

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