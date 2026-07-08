// ArtistProfile.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

// Pot images for hub cards
import musicImg from '../assets/images/pot_music.png';
import homevrImg from '../assets/images/pot_homevr.png';
import bioscopeImg from '../assets/images/pot_bioscope.png';

// ── Import local artist images ──
import busiImage from '../assets/images/Busi.jpg';
import bhekumuziImage from '../assets/images/Bhekumuzi.jpg';
import gatsheniImage from '../assets/images/Gatsheni.jpg';
import igcokamaImage from '../assets/images/Igcokama.jpg';
import jabuKhanyileImage from '../assets/images/Jabu Khanyile.jpg';
import josephShabalalaImage from '../assets/images/Joseph Shabalala.jpg';
import khuzaniMpungoseImage from '../assets/images/Khuzani Mpungose.jpg';
import ladysmithImage from '../assets/images/Ladysmith.jpg';

// ── Image mapping by artist name ──
const artistImageMap = {
  'busi mhlongo': busiImage,
  'bhekumuzi luthuli': bhekumuziImage,
  'gatsheni': gatsheniImage,
  'igcokama': igcokamaImage,
  'igcokama elisha': igcokamaImage,  // 🔥 Added
  'mthandi': igcokamaImage,          // 🔥 Added
  'jabu khanyile': jabuKhanyileImage,
  'joseph shabalala': josephShabalalaImage,
  'khuzani mpungose': khuzaniMpungoseImage,
  'ladysmith black mambazo': ladysmithImage,
};

function getArtistImage(artistName) {
  if (!artistName) return null;
  const lowerName = artistName.toLowerCase().trim();
  return artistImageMap[lowerName] || null;
}

// Background
import backgroundImage from '../assets/images/NowPlay.jpg';

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    height: '100vh',
    fontFamily: "'DM Sans', sans-serif",
    color: '#f4d090',
    position: 'relative',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundAttachment: 'fixed',
    backgroundColor: 'rgba(10, 6, 3, 0.85)',
    backgroundBlendMode: 'multiply',
    overflowY: 'auto',
  },

  backBtn: {
    position: 'fixed',
    top: '1rem',
    left: '1.25rem',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(10,6,3,0.88)',
    border: '1px solid rgba(198,122,52,0.35)',
    borderRadius: '50px',
    padding: '0.45rem 1rem',
    color: '#f4d090',
    fontSize: '0.8rem',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    letterSpacing: '0.05em',
    transition: 'border-color 0.2s',
  },

  hero: {
    position: 'relative',
    height: 'clamp(400px, 60vh, 700px)',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(10,6,3,0.1) 0%, rgba(10,6,3,0.9) 100%)',
  },
  heroImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center 30%',
  },
  heroFallback: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a0d06 0%, #2a1508 60%, #140a04 100%)',
    fontSize: '8rem',
    opacity: 0.3,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    padding: '0 1.75rem 3rem',
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },

  culturePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(198,122,52,0.15)',
    border: '1px solid rgba(198,122,52,0.4)',
    borderRadius: '50px',
    padding: '0.25rem 0.85rem',
    fontSize: '0.7rem',
    color: '#c67a34',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  },

  heroName: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
    fontWeight: 700,
    color: '#f4d090',
    margin: '0 0 0.35rem',
    lineHeight: 1.1,
    textShadow: '0 2px 20px rgba(0,0,0,0.8)',
    letterSpacing: '0.03em',
  },

  heroGenre: {
    fontSize: '0.88rem',
    color: '#c67a34',
    margin: '0 0 0.65rem',
    fontWeight: 500,
  },

  heroTagline: {
    color: 'rgba(244,208,144,0.65)',
    fontSize: '0.92rem',
    fontWeight: 300,
    fontStyle: 'italic',
    maxWidth: '480px',
    lineHeight: 1.6,
  },

  body: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem 5rem',
  },

  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem',
    color: 'rgba(244,208,144,0.3)',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
  sectionLabelLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(198,122,52,0.15)',
  },

  bioWrapper: {
    position: 'relative',
    marginBottom: '2.5rem',
    paddingLeft: '1.5rem',
    borderLeft: '3px solid #d48f38',
  },
  bioQuoteWatermark: {
    position: 'absolute',
    top: '-0.5rem',
    left: '-0.8rem',
    fontSize: '4rem',
    color: 'rgba(212, 143, 56, 0.08)',
    fontFamily: "'Cormorant Garamond', serif",
    pointerEvents: 'none',
    userSelect: 'none',
    lineHeight: 1,
  },
  bioCard: {
    background: 'rgba(20,10,5,0.7)',
    borderRadius: '16px',
    padding: '1.5rem',
    backdropFilter: 'blur(8px)',
    lineHeight: 1.75,
    color: 'rgba(244,208,144,0.75)',
    fontSize: '0.92rem',
    position: 'relative',
    zIndex: 1,
  },

  socialRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '2rem',
  },
  socialBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(212, 143, 56, 0.1)',
    border: '1px solid #d48f38',
    borderRadius: '50px',
    padding: '0.4rem 1rem',
    color: '#f4d090',
    fontSize: '0.78rem',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  socialBtnHover: {
    background: '#d48f38',
    color: '#1a0f0a',
  },

  hubGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginBottom: '3rem',
    textAlign: 'center',
  },

  hubCard: (disabled) => ({
    background: 'rgba(20, 10, 5, 0.7)',
    border: '1px solid rgba(212, 143, 56, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(4px)',
  }),
  hubCardHover: {
    transform: 'translateY(-5px)',
    borderColor: 'rgba(212, 143, 56, 0.6)',
    boxShadow: '0 8px 30px rgba(212, 143, 56, 0.15), 0 0 20px rgba(212, 143, 56, 0.05)',
  },

  hubPot: {
    width: '100%',
    maxWidth: '120px',
    aspectRatio: '1/1',
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 12px rgba(198,122,52,0.2))',
    transition: 'transform 0.3s ease',
  },

  hubTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: '#f4d090',
    textTransform: 'uppercase',
    margin: 0,
  },

  hubCta: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.7rem',
    fontWeight: 500,
    color: '#c67a34',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(198,122,52,0.3)',
    paddingBottom: '0.2rem',
    transition: 'color 0.2s, border-color 0.2s',
  },

  proverbSection: {
    marginTop: '4rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(198,122,52,0.15)',
    textAlign: 'center',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  proverbText: {
    fontSize: '0.95rem',
    lineHeight: 1.6,
    color: 'rgba(244,208,144,0.5)',
    fontStyle: 'italic',
    fontFamily: "'Cormorant Garamond', serif",
    marginBottom: '0.3rem',
  },
  proverbAttr: {
    fontSize: '0.7rem',
    color: 'rgba(198,122,52,0.3)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },

  center: {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    color: 'rgba(244,208,144,0.6)',
    padding: '2rem',
    textAlign: 'center',
  },
};

// ─── Hub Card Component ──────────────────────────────────────────────────────
function HubCard({ icon, title, ctaLabel, onClick, disabled, comingSoon }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...S.hubCard(disabled),
        ...(hovered && !disabled ? S.hubCardHover : {}),
      }}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img src={icon} alt={title} style={S.hubPot} />
      <div style={S.hubTitle}>{title}</div>
      <div style={S.hubCta}>{comingSoon ? 'Coming Soon' : 'Enter →'}</div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ArtistProfile() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Auth guard
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login', { replace: true });
    };
    checkAuth();
  }, [navigate]);

  // Fetch artist
  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('artists')
        .select('*')
        .eq('id', artistId)
        .single();

      if (err || !data) {
        setError('Artist not found.');
      } else {
        setArtist(data);
      }
      setLoading(false);
    };
    fetchArtist();
  }, [artistId]);

  // Loading & error states
  if (loading) {
    return (
      <div style={{ ...S.page, ...S.center }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%', background: '#c67a34',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes pulse{0%,80%,100%{transform:scale(0.6);opacity:0.3}40%{transform:scale(1);opacity:1}}`}</style>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div style={{ ...S.page, ...S.center }}>
        <div style={{ fontSize: '3rem' }}>🎤</div>
        <h2 style={{ fontFamily: "'Cinzel', serif", color: '#e8a84c', fontSize: '1.5rem' }}>Artist not found</h2>
        <p style={{ color: 'rgba(244,208,144,0.5)', maxWidth: '320px' }}>
          This artist profile doesn't exist or hasn't been set up yet.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg, #8B6914, #c67a34)',
            border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem',
            color: '#fff', fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
          }}
        >← Back to Explore</button>
      </div>
    );
  }

  // ── Hero image: prefer local mapping, fallback to photo_url ──
  const localImage = getArtistImage(artist.name);
  const heroImage = localImage || artist.photo_url || null;

  // ─── HUB DATA ──────────────────────────────────────────────────────────────
  const hubs = [
    {
      icon: musicImg,
      title: 'Music',
      disabled: !artist.has_music,
      comingSoon: !artist.has_music,
      onClick: () => navigate(`/music?artist=${encodeURIComponent(artist.name)}`),
    },
    {
      icon: homevrImg,
      title: 'Home VR',
      disabled: !artist.has_vr,
      comingSoon: !artist.has_vr,
      onClick: () => navigate(artist.vr_route || '/homevr'),
    },
    {
      icon: bioscopeImg,
      title: 'Bioscope',
      disabled: !artist.has_bioscope,
      comingSoon: !artist.has_bioscope,
      onClick: () => navigate(artist.bioscope_route || '/bioscope'),
    },
  ];

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Back button */}
      <button
        style={S.backBtn}
        onClick={() => navigate(-1)}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(198,122,52,0.75)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(198,122,52,0.35)'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* Hero */}
      <div style={S.hero}>
        {heroImage ? (
          <img src={heroImage} alt={artist.name} style={S.heroImg} />
        ) : (
          <div style={S.heroFallback}>🎤</div>
        )}
        <div style={S.heroOverlay} />
        <div style={S.heroContent}>
          {artist.culture_name && (
            <div style={S.culturePill}>
              {artist.culture_symbol || '🎶'} &nbsp; {artist.culture_name}
            </div>
          )}
          <h1 style={S.heroName}>{artist.name}</h1>
          {artist.genre && <p style={S.heroGenre}>{artist.genre}</p>}
          {artist.tagline && <p style={S.heroTagline}>"{artist.tagline}"</p>}
        </div>
      </div>

      {/* Body (same as before) */}
      <div style={S.body}>
        {/* Social Connect buttons */}
        {(artist.instagram || artist.spotify_url || artist.youtube_url) && (
          <>
            <div style={S.sectionLabel}>
              <span>Connect</span>
              <div style={S.sectionLabelLine} />
            </div>
            <div style={S.socialRow}>
              {artist.instagram && (
                <a
                  href={`https://instagram.com/${artist.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={S.socialBtn}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#d48f38';
                    e.currentTarget.style.color = '#1a0f0a';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(212, 143, 56, 0.1)';
                    e.currentTarget.style.color = '#f4d090';
                  }}
                >
                  📸 @{artist.instagram}
                </a>
              )}
              {artist.spotify_url && (
                <a
                  href={artist.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={S.socialBtn}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#d48f38';
                    e.currentTarget.style.color = '#1a0f0a';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(212, 143, 56, 0.1)';
                    e.currentTarget.style.color = '#f4d090';
                  }}
                >
                  🎧 Spotify
                </a>
              )}
              {artist.youtube_url && (
                <a
                  href={artist.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={S.socialBtn}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#d48f38';
                    e.currentTarget.style.color = '#1a0f0a';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(212, 143, 56, 0.1)';
                    e.currentTarget.style.color = '#f4d090';
                  }}
                >
                  ▶ YouTube
                </a>
              )}
            </div>
          </>
        )}

        {/* About section */}
        {artist.bio && (
          <>
            <div style={S.sectionLabel}>
              <span>About</span>
              <div style={S.sectionLabelLine} />
            </div>
            <div style={S.bioWrapper}>
              <span style={S.bioQuoteWatermark}>“</span>
              <div style={S.bioCard}>{artist.bio}</div>
            </div>
          </>
        )}

        {/* Explore the World – hub cards */}
        <div style={S.sectionLabel}>
          <span>Explore {artist.name}'s World</span>
          <div style={S.sectionLabelLine} />
        </div>
        <div style={S.hubGrid}>
          {hubs.map(hub => (
            <HubCard key={hub.title} {...hub} />
          ))}
        </div>

        {/* Ubuntu proverb */}
        <div style={S.proverbSection}>
          <p style={S.proverbText}>
            “Umuntu ngumuntu ngabantu — A person is a person through other persons.”
            <br />
            This is the spirit of Kwa Khanye.
          </p>
          <p style={S.proverbAttr}>UBUNTU — AFRICAN PHILOSOPHY</p>
        </div>

        <p style={{
          textAlign: 'center', fontSize: '0.7rem',
          color: 'rgba(244,208,144,0.15)', letterSpacing: '0.06em',
          marginTop: '2rem',
        }}>
          AUTHENTIC AFRICAN EXPERIENCES
        </p>
      </div>
    </div>
  );
}