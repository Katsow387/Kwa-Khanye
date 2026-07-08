import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { COUNTRIES } from '../constants/countries';

// Background
import backgroundImage from '../assets/images/NowPlay.jpg';

const containerStyle = {
  minHeight: '100vh',
  width: '100%',
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundAttachment: 'fixed',
  backgroundColor: 'rgba(10, 6, 3, 0.85)',
  backgroundBlendMode: 'multiply',
};

const contentStyle = {
  maxWidth: '660px',
  margin: '0 auto',
  padding: '2rem 1rem 4rem',
};

export default function ArtistsPage() {
  const { countryId, cultureId } = useParams();
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const country = COUNTRIES.find(c => c.id === countryId);
  const culture = country?.cultures.find(c => c.id === cultureId);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      setError('');
      const { data, error: err } = await supabase
        .from('artists')
        .select('*')
        .eq('country_id', countryId)
        .eq('culture_id', cultureId)
        .order('name', { ascending: true });

      if (err) {
        setError('Could not load artists. Please try again.');
        console.error(err);
      } else {
        setArtists(data || []);
        setFilteredArtists(data || []);
      }
      setLoading(false);
    };
    fetchArtists();
  }, [countryId, cultureId]);

  // Filter artists when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredArtists(artists);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = artists.filter(a =>
        a.name.toLowerCase().includes(lower) ||
        (a.tagline && a.tagline.toLowerCase().includes(lower)) ||
        (a.genre && a.genre.toLowerCase().includes(lower))
      );
      setFilteredArtists(filtered);
    }
  }, [searchTerm, artists]);

  if (loading) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div className="loading-pulser-row">
          {[0,1,2].map(i => <div key={i} className="pulser-dot" style={{ animationDelay: `${i*0.2}s` }} />)}
        </div>
        <p className="loading-text">Loading artists…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f4d090', padding: '2rem', textAlign: 'center' }}>
        {error}
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 className="explore-card-heading">Artists coming soon</h2>
        <p className="explore-card-subheading">We're curating {culture?.name} artists right now — check back soon.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <button 
          onClick={() => navigate(`/country/${countryId}`)} 
          style={{ 
            marginBottom: '1.5rem', 
            background: 'none', 
            border: 'none', 
            color: '#e8a84c', 
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          ← Back to Cultures
        </button>
        
        <h2 className="explore-card-heading">Choose an Artist</h2>
        <p className="explore-card-subheading">Select an artist to explore their world — music, film, and VR experience.</p>

        {/* Search Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search artists by name, genre, or tagline…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              borderRadius: '50px',
              border: '1px solid rgba(232,168,76,0.3)',
              background: 'rgba(0,0,0,0.4)',
              color: '#f5e6d3',
              fontSize: '0.9rem',
              outline: 'none',
              backdropFilter: 'blur(4px)',
            }}
            className="artist-search-input"
          />
        </div>

        <div className="artist-selection-grid">
          {filteredArtists.map(artist => (
            <button 
              key={artist.id} 
              onClick={() => navigate(`/artist/${artist.id}`)} 
              className="artist-grid-card"
              style={{
                width: '100%',
                background: 'rgba(20,10,5,0.7)',
                border: '1px solid rgba(212,143,56,0.2)',
                borderRadius: '16px',
                padding: '0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                backdropFilter: 'blur(4px)',
                marginBottom: '1rem',
              }}
            >
              <div className="artist-img-frame" style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                {artist.photo_url
                  ? <img src={artist.photo_url} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', opacity: 0.4 }}>🎤</div>
                }
                <div className="artist-gradient-shading" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(10,6,3,0.9), transparent)' }} />
                {artist.genre && <div className="artist-genre-pill" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(212,143,56,0.9)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.7rem', color: '#fff', fontWeight: 600 }}>{artist.genre}</div>}
              </div>
              <div className="artist-card-body" style={{ padding: '1rem', textAlign: 'left' }}>
                <div className="artist-name-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f4d090', fontFamily: "'Cinzel', serif" }}>{artist.name}</div>
                {artist.tagline && <div className="artist-tagline-text" style={{ fontSize: '0.85rem', color: 'rgba(244,208,144,0.6)', marginTop: '0.3rem' }}>{artist.tagline}</div>}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {artist.has_music && <span className="feature-indicator-pill" style={{ background: 'rgba(212,143,56,0.2)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.7rem', color: '#f4d090' }}>🎵 Music</span>}
                  {artist.has_vr && <span className="feature-indicator-pill" style={{ background: 'rgba(212,143,56,0.2)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.7rem', color: '#f4d090' }}>🥽 VR</span>}
                  {artist.has_bioscope && <span className="feature-indicator-pill" style={{ background: 'rgba(212,143,56,0.2)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.7rem', color: '#f4d090' }}>🎬 Bioscope</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
        {filteredArtists.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(245,230,211,0.5)', marginTop: '2rem' }}>
            No artists match your search.
          </p>
        )}
      </div>
    </div>
  );
}