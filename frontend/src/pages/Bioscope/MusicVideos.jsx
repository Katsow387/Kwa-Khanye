// MusicVideos.jsx — gallery of music videos for the Bioscope experience
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import './Bioscope.css';

export default function MusicVideos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const artistName = searchParams.get('artist');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videos, setVideos] = useState([]);
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
      await fetchVideos();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, artistName]);

  const fetchVideos = async () => {
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

      let query = supabase.from('bioscope_content').select('*').eq('content_type', 'music_video');
      if (artistId) query = query.eq('artist_id', artistId);

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        if (fetchError.code === '42P01') {
          setVideos([]);
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

      setVideos(rows);
    } catch (err) {
      console.error('Error fetching music videos:', err);
      setError('Failed to load music videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return videos.filter(v => {
      const matchesTab = activeTab === 'all' || (activeTab === 'featured' && v.featured);
      const haystack = `${v.title || ''} ${v.artists?.name || ''}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [videos, search, activeTab]);

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
        <div className="bsc-hero-eyebrow">🎬 Music Videos</div>
        <h1>{artistName ? artistName : 'All Music Videos'}</h1>
        <p>Watch performances and visuals from artists across every tribe.</p>

        <div className="bsc-search-wrap">
          <span className="bsc-search-icon">🔍</span>
          <input
            className="bsc-search"
            placeholder="Search music videos or artists..."
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
            {tab === 'all' ? 'All Videos' : 'Featured'}
          </button>
        ))}
      </div>

      <div className="bsc-stats">
        <div className="bsc-stat">
          <div className="bsc-stat-num">{filtered.length}</div>
          <div className="bsc-stat-label">Videos</div>
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
          <div className="bsc-empty-icon">🎬</div>
          <p>No music videos found yet.</p>
        </div>
      )}

      {!error && filtered.length > 0 && (
        <div className="bsc-grid">
          {filtered.map(video => (
            <div key={video.id} className="bsc-card" onClick={() => setSelected(video)}>
              <div className="bsc-card-thumb" style={{ background: 'linear-gradient(135deg, #3a1f0f, #1c0f0a)' }}>
                {video.thumbnail_url ? (
                  <img className="bsc-thumb-img" src={video.thumbnail_url} alt={video.title} />
                ) : (
                  <span className="bsc-thumb-symbol">🎵</span>
                )}
                <div className="bsc-card-type-badge">🎬 Music Video</div>
              </div>
              <div className="bsc-card-body">
                <h3 className="bsc-card-title">{video.title || 'Untitled'}</h3>
                {video.artists?.name && <p className="bsc-card-artist">{video.artists.name}</p>}
                {video.description && <p className="bsc-card-desc">{video.description}</p>}
                <div className="bsc-card-footer">
                  <span className="bsc-card-year">
                    {video.year || (video.created_at ? new Date(video.created_at).getFullYear() : '')}
                  </span>
                  <span className="bsc-card-btn">▶ Watch</span>
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
                <span className="bsc-modal-symbol">🎵</span>
              )}
            </div>
            <div className="bsc-modal-body">
              <div className="bsc-modal-type">🎬 Music Video</div>
              <h2 className="bsc-modal-title">{selected.title || 'Untitled'}</h2>
              {selected.artists?.name && <p className="bsc-modal-artist">{selected.artists.name}</p>}
              {selected.description && <p className="bsc-modal-desc">{selected.description}</p>}
              {selected.media_url && (
                <a className="bsc-modal-action" href={selected.media_url} target="_blank" rel="noreferrer">
                  ▶ Watch Now
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}