import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { COUNTRIES } from '../constants/countries';

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

  if (loading) return (
    <div className="artist-loading-container">
      <div className="loading-pulser-row">
        {[0,1,2].map(i => <div key={i} className="pulser-dot" style={{ animationDelay: `${i*0.2}s` }} />)}
      </div>
      <p className="loading-text">Loading artists…</p>
    </div>
  );

  if (error) return <div className="artist-error-view">{error}</div>;

  if (artists.length === 0) return (
    <div style={{ padding: '4rem 1rem', maxWidth: '660px', margin: '0 auto', textAlign: 'center' }}>
      <h2 className="explore-card-heading">Artists coming soon</h2>
      <p className="explore-card-subheading">We're curating {culture?.name} artists right now — check back soon.</p>
    </div>
  );

  return (
    <div style={{ padding: '4rem 1rem', maxWidth: '660px', margin: '0 auto' }}>
      <button onClick={() => navigate(`/country/${countryId}`)} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', color: '#e8a84c', cursor: 'pointer' }}>
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
          <button key={artist.id} onClick={() => navigate(`/artist/${artist.id}`)} className="artist-grid-card">
            <div className="artist-img-frame">
              {artist.photo_url
                ? <img src={artist.photo_url} alt={artist.name} className="artist-photo" />
                : <span style={{ fontSize: '3.5rem', opacity: 0.4 }}>🎤</span>
              }
              <div className="artist-gradient-shading" />
              {artist.genre && <div className="artist-genre-pill">{artist.genre}</div>}
            </div>
            <div className="artist-card-body">
              <div className="artist-name-title">{artist.name}</div>
              {artist.tagline && <div className="artist-tagline-text">{artist.tagline}</div>}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {artist.has_music && <span className="feature-indicator-pill">🎵 Music</span>}
                {artist.has_vr    && <span className="feature-indicator-pill">🥽 VR</span>}
                {artist.has_bioscope && <span className="feature-indicator-pill">🎬 Bioscope</span>}
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
  );
}