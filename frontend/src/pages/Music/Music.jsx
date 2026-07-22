import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import './Music.css';
import musicBgImage from '../../assets/images/NowPlay.jpg';

const DEEZER_SEARCH_URL = 'https://kraal-backend.onrender.com/api/deezer/search?q=';
const DEFAULT_SEARCH = 'Afrobeats';

function Music() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTrackId, setCurrentTrackId] = useState(null);

  const searchTimeout = useRef(null);
  const searchInputRef = useRef(null);

  // ── Read artist param from URL ──
  // NOTE: this only sets searchQuery now. The debounced effect below
  // (keyed on searchQuery) is solely responsible for firing the search.
  // Previously this called performSearch() directly AND changed
  // searchQuery, which triggered the debounced effect too — causing
  // the same query to be fetched twice (or three times in React
  // StrictMode dev), which was hammering the Deezer proxy and
  // surfacing as 500s.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const artistParam = params.get('artist');
    if (artistParam) {
      setSearchQuery(artistParam);
    } else if (!searchQuery) {
      setSearchQuery(DEFAULT_SEARCH);
    }
  }, [location]);

  // ── Auth check ──
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login', { replace: true });
    };
    checkAuth();
  }, [navigate]);

  // ── Perform search function ──
  const performSearch = async (query) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${DEEZER_SEARCH_URL}${encodeURIComponent(query)}&limit=30`);
      const data = await response.json();
      if (data.data && data.data.length) {
        const tracks = data.data.map(track => ({
          id: track.id,
          title: track.title,
          duration: track.duration,
          preview: track.preview,
          cover_small: track.album.cover_small,
        }));
        setSearchResults(tracks);
      } else {
        setSearchResults([]);
        setError('No songs found. Try a different search.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to search. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Debounced search (single source of truth for firing searches) ──
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // ── Select track – navigate to NowPlaying ──
  const selectTrack = (track) => {
    const idx = searchResults.findIndex(t => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackId(track.id);
      navigate('/now-playing', {
        state: {
          playlist: searchResults, // full data
          trackIndex: idx,
          shuffle: false,
          repeat: 'off',
        },
      });
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const params = new URLSearchParams(location.search);
  const artistFromUrl = params.get('artist');

  return (
    <div className="music-page" style={{ backgroundImage: `url(${musicBgImage})` }}>
      <div className="music-overlay" />
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      <div className="music-content">
        <header className="music-header">
          <div className="header-inner">
            <div className="music-eyebrow">
              <span className="eyebrow-dot" />
              Kwa Khanye
            </div>
            <h1 className="music-title">
              {artistFromUrl ? `Songs by ${artistFromUrl}` : 'The Music Kraal'}
            </h1>
            <p className="music-subtitle">
              {artistFromUrl
                ? `Search within ${artistFromUrl}'s discography or type a new query`
                : 'Search any song in the world — play previews, shuffle, repeat, and more'}
            </p>
            <div className="music-search-wrap">
              <span className="music-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                className="music-search"
                placeholder={artistFromUrl ? `Search ${artistFromUrl}'s songs…` : "Search — Burna Boy, Tyla, Kabza De Small…"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"><span /><span /><span /></div>
            <p className="loading-text">Finding your sound…</p>
          </div>
        )}

        {!loading && (
          <div className="music-tracklist">
            {searchResults.length === 0 && searchQuery.trim() !== '' && (
              <div className="empty-state">
                <div className="empty-icon">🎧</div>
                <p className="empty-title">No results found</p>
                <p className="empty-sub">Try another song or artist name</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="tracklist-body">
                <div className="tracklist-meta">
                  <span className="tracklist-count">{searchResults.length} tracks</span>
                </div>
                {/* Simplified header: only #, Title, Duration */}
                <div className="tracklist-header-simple">
                  <span className="th-num">#</span>
                  <span className="th-title">Title</span>
                  <span className="th-dur">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                </div>
                <div className="tracklist-rows">
                  {searchResults.map((track, idx) => {
                    const isActive = currentTrackId === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`track-item-simple${isActive ? ' active' : ''}`}
                        onClick={() => selectTrack(track)}
                      >
                        <div className="track-num">
                          <span className="idx-num">{idx + 1}</span>
                        </div>
                        <div className="track-info-cell-simple">
                          {track.cover_small && <img className="track-thumb" src={track.cover_small} alt="" />}
                          <span className="track-title">{track.title}</span>
                        </div>
                        <div className="track-dur-cell">{formatTime(track.duration)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Music;
