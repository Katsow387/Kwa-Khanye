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
  const [cultureFilter, setCultureFilter] = useState(cultureId || 'all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const country = COUNTRIES.find(c => c.id === countryId);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      setError('');

      // supabase-js recovers/refreshes a persisted session asynchronously on
      // client init. Without waiting for it, a query fired immediately on
      // mount can go out with the old, already-expired access token attached.
      // Awaiting getSession() ensures that refresh has resolved first.
      await supabase.auth.getSession();

      const runQuery = () =>
        supabase
          .from('artists')
          .select('*')
          .eq('country_id', countryId)
          .order('name', { ascending: true });

      // Show artists from every tribe/culture in this country, not just one.
      let { data, error: err } = await runQuery();

      // If the access token expired (e.g. tab was idle), refresh once and retry
      // rather than surfacing an error for what should be a routine refresh.
      if (err && err.code === 'PGRST303') {
        const { error: refreshErr } = await supabase.auth.refreshSession();
        if (!refreshErr) {
          ({ data, error: err } = await runQuery());
        }
      }

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
  }, [countryId]);

  // Filter artists when search term or culture filter changes
  useEffect(() => {
    let result = artists;

    if (cultureFilter !== 'all') {
      result = result.filter(a => a.culture_id === cultureFilter);
    }

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(lower) ||
        (a.tagline && a.tagline.toLowerCase().includes(lower)) ||
        (a.genre && a.genre.toLowerCase().includes(lower)) ||
        (a.culture_name && a.culture_name.toLowerCase().includes(lower))
      );
    }

    setFilteredArtists(result);
  }, [searchTerm, cultureFilter, artists]);

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
      <p className="explore-card-subheading">We're curating {country?.name || 'this country'}'s artists right now — check back soon.</p>
    </div>
  );

  // Unique cultures present among the fetched artists, for the filter pills
  const availableCultures = Array.from(
    new Map(
      artists
        .filter(a => a.culture_id)
        .map(a => [a.culture_id, { id: a.culture_id, name: a.culture_name || a.culture_id }])
    ).values()
  );

  return (
    <div style={{ padding: '4rem 1rem', maxWidth: '660px', margin: '0 auto' }}>
      <button onClick={() => navigate(`/country/${countryId}`)} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', color: '#e8a84c', cursor: 'pointer' }}>
        ← Back to Cultures
      </button>
      <h2 className="explore-card-heading">Choose an Artist</h2>
      <p className="explore-card-subheading">Select an artist to explore their world — music, film, and VR experience.</p>

      {/* Culture / Tribe filter pills */}
      {availableCultures.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setCultureFilter('all')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '50px',
              border: '1px solid rgba(232,168,76,0.4)',
              background: cultureFilter === 'all' ? '#e8a84c' : 'rgba(0,0,0,0.4)',
              color: cultureFilter === 'all' ? '#1a0d06' : '#f5e6d3',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            All Tribes
          </button>
          {availableCultures.map(c => (
            <button
              key={c.id}
              onClick={() => setCultureFilter(c.id)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '50px',
                border: '1px solid rgba(232,168,76,0.4)',
                background: cultureFilter === c.id ? '#e8a84c' : 'rgba(0,0,0,0.4)',
                color: cultureFilter === c.id ? '#1a0d06' : '#f5e6d3',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

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
              {artist.culture_name && (
                <div style={{ fontSize: '0.7rem', color: '#e8a84c', opacity: 0.7, marginBottom: '0.2rem' }}>
                  {artist.culture_name}
                </div>
              )}
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