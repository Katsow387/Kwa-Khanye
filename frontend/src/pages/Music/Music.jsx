import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import './Music.css';
import musicBgImage from '../../assets/images/Music Back.jpg';

// 🔥 FIX: Use CORS proxy for mobile compatibility
const DEEZER_SEARCH_URL = 'https://api.allorigins.win/raw?url=https://api.deezer.com/search?q=';
function Music() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Player state
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off');
  const [shuffledIndices, setShuffledIndices] = useState([]);
  const [liked, setLiked] = useState(false);

  const audioRef = useRef(null);
  const searchTimeout = useRef(null);
  const searchInputRef = useRef(null);

  // ── Read artist param from URL ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const artistParam = params.get('artist');
    if (artistParam) {
      setSearchQuery(artistParam);
    }
  }, [location]);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login', { replace: true });
    };
    checkAuth();
  }, [navigate]);

  // ── Debounced search ──
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${DEEZER_SEARCH_URL}${encodeURIComponent(searchQuery)}&limit=30`);
        const data = await response.json();
        if (data.data && data.data.length) {
          const tracks = data.data.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.artist.name,
            album: track.album.title,
            duration: track.duration,
            preview: track.preview,
            cover_small: track.album.cover_small,
            cover_medium: track.album.cover_medium,
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
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // ── Player functions ──
  const generateShuffledIndices = useCallback((playlist) => {
    const indices = playlist.map((_, idx) => idx);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, []);

  const selectTrack = (track) => {
    setCurrentPlaylist(searchResults);
    const idx = searchResults.findIndex(t => t.id === track.id);
    if (idx !== -1) {
      if (audioRef.current) audioRef.current.pause();
      navigate('/now-playing', {
        state: {
          playlist: searchResults,
          trackIndex: idx,
          shuffle: shuffle,
          repeat: repeat,
        },
      });
    }
  };

  // ── Audio event listeners ──
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeat === 'one') { audio.currentTime = 0; audio.play().catch(console.error); }
      else nextTrack();
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => { setError('Playback error.'); setIsPlaying(false); };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [repeat, shuffle, currentPlaylist, currentTrackIndex]);

  // ── Load and play track (with spinning fix) ──
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentTrackIndex < 0 || !currentPlaylist.length) return;
    const track = shuffle ? currentPlaylist[shuffledIndices[currentTrackIndex]] : currentPlaylist[currentTrackIndex];
    if (track && track.preview) {
      audio.pause();
      setIsPlaying(false);                     // stop spinning while loading
      audio.src = track.preview;
      audio.load();
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => { setIsPlaying(false); setError('Cannot play this track.'); });
    } else {
      setError('No preview available.');
    }
  }, [currentTrackIndex, currentPlaylist, shuffle, shuffledIndices]);

  const nextTrack = () => {
    if (!currentPlaylist.length) return;
    setIsPlaying(false);                       // stop spinning before transitioning
    let newIndex = currentTrackIndex + 1;
    const len = shuffle ? shuffledIndices.length : currentPlaylist.length;
    if (newIndex >= len) {
      if (repeat === 'all') newIndex = 0;
      else { setCurrentTrackIndex(-1); return; }
    }
    setCurrentTrackIndex(newIndex);
    setLiked(false);
  };

  const prevTrack = () => {
    if (!currentPlaylist.length) return;
    setIsPlaying(false);
    let newIndex = currentTrackIndex - 1;
    const len = shuffle ? shuffledIndices.length : currentPlaylist.length;
    if (newIndex < 0) {
      if (repeat === 'all') newIndex = len - 1;
      else return;
    }
    setCurrentTrackIndex(newIndex);
    setLiked(false);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || currentTrackIndex === -1) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);                     // stop spinning immediately
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setError('Playback failed.'));
    }
  };

  const handleSeek = (e) => {
    const seekTo = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(seekTo)) {
      audioRef.current.currentTime = seekTo;
      setCurrentTime(seekTo);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  const toggleShuffle = () => {
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    if (newShuffle && currentPlaylist.length) {
      const indices = generateShuffledIndices(currentPlaylist);
      setShuffledIndices(indices);
      const realIndex = shuffle ? shuffledIndices[currentTrackIndex] : currentTrackIndex;
      const newShuffledIndex = indices.findIndex(i => i === realIndex);
      setCurrentTrackIndex(newShuffledIndex !== -1 ? newShuffledIndex : 0);
    } else {
      const realIndex = shuffle ? shuffledIndices[currentTrackIndex] : currentTrackIndex;
      setCurrentTrackIndex(realIndex);
    }
  };

  const toggleRepeat = () => {
    if (repeat === 'off') setRepeat('one');
    else if (repeat === 'one') setRepeat('all');
    else setRepeat('off');
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getCurrentTrack = () => {
    if (currentTrackIndex < 0 || !currentPlaylist.length) return null;
    return shuffle ? currentPlaylist[shuffledIndices[currentTrackIndex]] : currentPlaylist[currentTrackIndex];
  };

  const currentTrack = getCurrentTrack();
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

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

            {searchResults.length === 0 && searchQuery.trim() === '' && (
              <div className="welcome-state">
                <div className="welcome-grid">
                  {['Afrobeats', 'Amapiano', 'Afro Soul', 'Hip Hop', 'R&B', 'Gospel'].map(genre => (
                    <button key={genre} className="genre-pill" onClick={() => setSearchQuery(genre)}>
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="tracklist-body">
                <div className="tracklist-meta">
                  <span className="tracklist-count">{searchResults.length} tracks</span>
                </div>
                <div className="tracklist-header">
                  <span className="th-num">#</span>
                  <span className="th-title">Title</span>
                  <span className="th-artist">Artist</span>
                  <span className="th-album">Album</span>
                  <span className="th-dur">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                </div>
                <div className="tracklist-rows">
                  {searchResults.map((track, idx) => {
                    const isActive = currentTrack && currentTrack.id === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`track-item${isActive ? ' active' : ''}`}
                        onClick={() => selectTrack(track)}
                      >
                        <div className="track-num">
                          {isActive
                            ? <span className={`play-indicator${isPlaying ? ' pulsing' : ''}`}>
                                {isPlaying
                                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                  : <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                }
                              </span>
                            : <span className="idx-num">{idx + 1}</span>
                          }
                        </div>
                        <div className="track-info-cell">
                          {track.cover_small && <img className="track-thumb" src={track.cover_small} alt="" />}
                          <span className="track-title">{track.title}</span>
                        </div>
                        <div className="track-artist-cell">{track.artist}</div>
                        <div className="track-album-cell">{track.album}</div>
                        <div className="track-dur-cell">{formatTime(track.duration)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <audio ref={audioRef} />
      </div>

      {/* Mini player bar */}
      {currentTrack && (
        <div
          className={`now-playing-bar${isPlaying ? ' is-playing' : ''}`}
          onClick={() => {
            navigate('/now-playing', {
              state: {
                playlist: currentPlaylist,
                trackIndex: shuffle ? shuffledIndices[currentTrackIndex] : currentTrackIndex,
                shuffle: shuffle,
                repeat: repeat,
              },
            });
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="ndebele-border" />
          <div className="player-container">
            <div className="player-track-info">
              <div className={`player-cover${isPlaying ? ' spinning' : ''}`}>
                {currentTrack.cover_small
                  ? <img src={currentTrack.cover_small} alt={currentTrack.title} />
                  : <span className="cover-fallback">♪</span>
                }
              </div>
              <div className="player-track-text">
                <div className="player-track-title">{currentTrack.title}</div>
                <div className="player-track-artist">{currentTrack.artist}</div>
              </div>
            </div>
            <div className="player-controls">
              <div className="controls-buttons" onClick={e => e.stopPropagation()}>
                <button className={`ctrl-btn${shuffle ? ' active' : ''}`} onClick={toggleShuffle} title="Shuffle">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                </button>
                <button className="ctrl-btn" onClick={prevTrack} title="Previous">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
                  </svg>
                </button>
                <button className="ctrl-btn play-pause" onClick={togglePlayPause} title="Play/Pause">
                  {isPlaying
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  }
                </button>
                <button className="ctrl-btn" onClick={nextTrack} title="Next">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
                  </svg>
                </button>
                <button className={`ctrl-btn repeat-btn${repeat !== 'off' ? ' active' : ''}`} onClick={toggleRepeat} title="Repeat">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
                    <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                  </svg>
                  {repeat === 'one' && <span className="repeat-badge">1</span>}
                </button>
              </div>
              <div className="progress-area">
                <span className="time-label">{formatTime(currentTime)}</span>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                  <input type="range" className="progress-bar" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} step="0.1" onClick={e => e.stopPropagation()} />
                </div>
                <span className="time-label">{formatTime(duration)}</span>
              </div>
            </div>
            <div className="volume-control" onClick={e => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                {volume > 0.5
                  ? <><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></>
                  : volume > 0
                    ? <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    : <><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>
                }
              </svg>
              <input type="range" className="volume-slider" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Music;