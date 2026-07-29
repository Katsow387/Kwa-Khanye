// Albums.jsx — gallery of albums for the Bioscope experience
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import './Bioscope.css';

export default function Albums() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const artistName = searchParams.get('artist');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [albums, setAlbums] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }
      await fetchAlbums();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, artistName]);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError('');

      let artistId = null;
      if (artistName) {
        const { data: artistData, error: artistErr } = await supabase
          .from('artists')
          .select('id, name')
          .ilike('name', `%${artistName}%`)
          .maybeSingle();
        if (artistErr) console.error('Artist lookup error:', artistErr);
        artistId = artistData?.id || null;
      }

      let query = supabase.from('bioscope_content').select('*').eq('content_type', 'album');
      if (artistId) query = query.eq('artist_id', artistId);

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        if (fetchError.code === '42P01') {
          setAlbums([]);
          setLoading(false);
          return;
        }
        throw fetchError;
      }

      let rows = data || [];
      if (rows.length > 0) {
        const artistIds = [...new Set(rows.map(r => r.artist_id).filter(Boolean))];
        if (artistIds.length > 0) {
          const { data: artistsData } = await supabase
            .from('artists')
            .select('id, name')
            .in('id', artistIds);
          const byId = Object.fromEntries((artistsData || []).map(a => [a.id, a]));
          rows = rows.map(r => ({ ...r, artists: byId[r.artist_id] || null }));
        }
      }

      setAlbums(rows);
    } catch (err) {
      console.error('Error fetching albums:', err);
      setError('Failed to load albums. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return albums.filter(a => {
      const matchesTab = activeTab === 'all' || (activeTab === 'featured' && a.featured);
      const haystack = `${a.title || ''} ${a.artists?.name || ''}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [albums, search, activeTab]);

  if (loading) {
    return (
      <div className="bsc-root" style={{ background: '#140a05' }}>
        <div className="bsc-loading">
          <div className="bsc-dot" />
          <div className="bsc-dot" />
          <div className="bsc-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className="bsc-root" style={{ background: '#140a05' }}>
      <div className="bsc-hero">
        <div className="bsc-hero-eyebrow">💿 Albums</div>
        <h1>{artistName ? artistName : 'All Albums'}</h1>
        <p>Discover full-length releases from artists across every tribe.</p>

        <div className="bsc-search-wrap">
          <span className="bsc-search-icon">🔍</span>
          <input
            className="bsc-search"
            placeholder="Search albums or artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bsc-tabs">
        {['all', 'featured'].map(tab => (
          <button
            key={tab}
            className={`bsc-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' ? 'All Albums' : 'Featured'}
          </button>
        ))}
      </div>

      <div className="bsc-stats">
        <div className="bsc-stat">
          <div className="bsc-stat-num">{filtered.length}</div>
          <div className="bsc-stat-label">Albums</div>
        </div>
      </div>

      {error && (
        <div className="bsc-empty">
          <div className="bsc-empty-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {!error && filtered.length === 0 && (
        <div className="bsc-empty">
          <div className="bsc-empty-icon">💿</div>
          <p>No albums found yet.</p>
        </div>
      )}

      {!error && filtered.length > 0 && (
        <div className="bsc-grid">
          {filtered.map(album => (
            <div key={album.id} className="bsc-card" onClick={() => setSelected(album)}>
              <div className="bsc-card-thumb" style={{ background: 'linear-gradient(135deg, #3a1f0f, #1c0f0a)' }}>
                {album.thumbnail_url ? (
                  <img className="bsc-thumb-img" src={album.thumbnail_url} alt={album.title} />
                ) : (
                  <span className="bsc-thumb-symbol">💿</span>
                )}
                <div className="bsc-card-type-badge">💿 Album</div>
              </div>
              <div className="bsc-card-body">
                <h3 className="bsc-card-title">{album.title || 'Untitled'}</h3>
                {album.artists?.name && <p className="bsc-card-artist">{album.artists.name}</p>}
                {album.description && <p className="bsc-card-desc">{album.description}</p>}
                <div className="bsc-card-footer">
                  <span className="bsc-card-year">
                    {album.year || (album.created_at ? new Date(album.created_at).getFullYear() : '')}
                  </span>
                  <span className="bsc-card-btn">▶ Listen</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="bsc-modal-overlay" onClick={() => setSelected(null)}>
          <div className="bsc-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bsc-modal-close" onClick={() => setSelected(null)}>✕</button>
            <div className="bsc-modal-hero" style={{ background: 'linear-gradient(135deg, #3a1f0f, #1c0f0a)' }}>
              {selected.thumbnail_url ? (
                <img className="bsc-modal-img" src={selected.thumbnail_url} alt={selected.title} />
              ) : (
                <span className="bsc-modal-symbol">💿</span>
              )}
            </div>
            <div className="bsc-modal-body">
              <div className="bsc-modal-type">💿 Album</div>
              <h2 className="bsc-modal-title">{selected.title || 'Untitled'}</h2>
              {selected.artists?.name && <p className="bsc-modal-artist">{selected.artists.name}</p>}
              {selected.description && <p className="bsc-modal-desc">{selected.description}</p>}
              {selected.media_url && (
                <a className="bsc-modal-action" href={selected.media_url} target="_blank" rel="noreferrer">
                  ▶ Listen Now
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}