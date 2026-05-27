import { useEffect, useState, useRef, useCallback } from 'react';
import './Music.css';

const DEEZER_SEARCH_URL = '/api/deezer/search?q=';
function Music() {
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
  const [repeat, setRepeat] = useState('off'); // 'off', 'one', 'all'
  const [shuffledIndices, setShuffledIndices] = useState([]);

  const audioRef = useRef(null);
  const searchTimeout = useRef(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
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

  // Generate shuffled indices
  const generateShuffledIndices = useCallback((playlist) => {
    const indices = playlist.map((_, idx) => idx);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, []);

  // Play a track by its index in the current playlist
  const playTrackAtIndex = (index) => {
    if (!currentPlaylist.length) return;
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setError('');
  };

  // Select track from search results
  const selectTrack = (track) => {
    setCurrentPlaylist(searchResults);
    const idx = searchResults.findIndex(t => t.id === track.id);
    if (idx !== -1) {
      if (shuffle) {
        const newShuffled = generateShuffledIndices(searchResults);
        setShuffledIndices(newShuffled);
        const shuffledIndex = newShuffled.findIndex(i => i === idx);
        setCurrentTrackIndex(shuffledIndex);
      } else {
        setCurrentTrackIndex(idx);
      }
      setIsPlaying(true);
    }
  };

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(e => console.error(e));
      } else if (repeat === 'all') {
        nextTrack();
      } else {
        nextTrack();
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setError('Playback error. The preview might be unavailable.');
      setIsPlaying(false);
    };

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

  // Load track into audio element when currentTrackIndex changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentTrackIndex < 0 || !currentPlaylist.length) return;

    let track;
    if (shuffle) {
      const realIndex = shuffledIndices[currentTrackIndex];
      track = currentPlaylist[realIndex];
    } else {
      track = currentPlaylist[currentTrackIndex];
    }
    if (track && track.preview) {
      audio.pause();
      audio.src = track.preview;
      audio.load();
      if (isPlaying) {
        audio.play().catch(err => {
          console.error(err);
          setError('Cannot play this track.');
          setIsPlaying(false);
        });
      }
    } else {
      setError('No preview available for this track.');
    }
  }, [currentTrackIndex, currentPlaylist, shuffle, shuffledIndices, isPlaying]);

  const nextTrack = () => {
    if (!currentPlaylist.length) return;
    let newIndex;
    if (shuffle) {
      newIndex = currentTrackIndex + 1;
      if (newIndex >= shuffledIndices.length) {
        if (repeat === 'all') newIndex = 0;
        else {
          setCurrentTrackIndex(-1);
          setIsPlaying(false);
          return;
        }
      }
    } else {
      newIndex = currentTrackIndex + 1;
      if (newIndex >= currentPlaylist.length) {
        if (repeat === 'all') newIndex = 0;
        else {
          setCurrentTrackIndex(-1);
          setIsPlaying(false);
          return;
        }
      }
    }
    setCurrentTrackIndex(newIndex);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (!currentPlaylist.length) return;
    let newIndex;
    if (shuffle) {
      newIndex = currentTrackIndex - 1;
      if (newIndex < 0) {
        if (repeat === 'all') newIndex = shuffledIndices.length - 1;
        else return;
      }
    } else {
      newIndex = currentTrackIndex - 1;
      if (newIndex < 0) {
        if (repeat === 'all') newIndex = currentPlaylist.length - 1;
        else return;
      }
    }
    setCurrentTrackIndex(newIndex);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || currentTrackIndex === -1) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error(err);
        setError('Playback failed.');
      });
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
    if (!currentPlaylist.length) return;
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    if (newShuffle) {
      const indices = generateShuffledIndices(currentPlaylist);
      setShuffledIndices(indices);
      let currentRealIndex;
      if (shuffle) {
        currentRealIndex = shuffledIndices[currentTrackIndex];
      } else {
        currentRealIndex = currentTrackIndex;
      }
      const newShuffledIndex = indices.findIndex(i => i === currentRealIndex);
      setCurrentTrackIndex(newShuffledIndex !== -1 ? newShuffledIndex : 0);
    } else {
      let realIndex;
      if (shuffle) {
        realIndex = shuffledIndices[currentTrackIndex];
      } else {
        realIndex = currentTrackIndex;
      }
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
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getCurrentTrack = () => {
    if (currentTrackIndex < 0 || !currentPlaylist.length) return null;
    if (shuffle) {
      const realIndex = shuffledIndices[currentTrackIndex];
      return currentPlaylist[realIndex];
    } else {
      return currentPlaylist[currentTrackIndex];
    }
  };

  const currentTrack = getCurrentTrack();

  return (
    <div className="music-page">
      <div className="music-header">
        <div className="music-eyebrow">🎵 Kwa Khanye</div>
        <h1>The Music Kraal</h1>
        <p>Search any song in the world – play previews, shuffle, repeat, and more</p>
        <div className="music-search-wrap">
          <span className="music-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="music-search"
            placeholder="Search for a song (e.g., 'Burna Boy', 'Tyla', 'Love Nwantiti')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
        </div>
      ) : (
        <div className="music-tracklist">
          {searchResults.length === 0 && searchQuery.trim() !== '' && !loading && (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎧</div>
              <p>No results. Try another song or artist.</p>
            </div>
          )}
          {searchResults.length > 0 && (
            <>
              <div className="tracklist-header">
                <span>#</span>
                <span>Title</span>
                <span>Artist</span>
                <span>Duration</span>
              </div>
              {searchResults.map((track, idx) => {
                const isActive = currentTrack && currentTrack.id === track.id;
                return (
                  <div
                    key={track.id}
                    className={`track-item ${isActive ? 'active' : ''}`}
                    onClick={() => selectTrack(track)}
                  >
                    <div className="track-number">
                      {isActive ? <span className="play-indicator">▶</span> : idx + 1}
                    </div>
                    <div className="track-info">
                      <span className="track-title">{track.title}</span>
                    </div>
                    <div className="track-artist">{track.artist}</div>
                    <div className="track-duration">{formatTime(track.duration)}</div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      <audio ref={audioRef} volume={volume} />

      {currentTrack && (
        <div className="now-playing-bar">
          <div className="player-container">
            <div className="player-track-info">
              <div className="player-cover">
                {currentTrack.cover_small ? (
                  <img src={currentTrack.cover_small} alt={currentTrack.title} />
                ) : (
                  <span>🎵</span>
                )}
              </div>
              <div className="player-track-text">
                <div className="player-track-title">{currentTrack.title}</div>
                <div className="player-track-artist">{currentTrack.artist}</div>
              </div>
            </div>

            <div className="player-controls">
              <div className="controls-buttons">
                <button
                  className={`ctrl-btn ${shuffle ? 'active' : ''}`}
                  onClick={toggleShuffle}
                  title="Shuffle"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 3 21 3 21 8" />
                    <line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                </button>
                <button className="ctrl-btn" onClick={prevTrack} title="Previous">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="19 20 9 12 19 4 19 20" />
                    <line x1="5" y1="19" x2="5" y2="5" />
                  </svg>
                </button>
                <button className="ctrl-btn play-pause" onClick={togglePlayPause} title="Play/Pause">
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>
                <button className="ctrl-btn" onClick={nextTrack} title="Next">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 4 15 12 5 20 5 4" />
                    <line x1="19" y1="5" x2="19" y2="19" />
                  </svg>
                </button>
                <button
                  className={`ctrl-btn ${repeat !== 'off' ? 'active' : ''}`}
                  onClick={toggleRepeat}
                  title={repeat === 'off' ? 'Repeat off' : repeat === 'one' ? 'Repeat one' : 'Repeat all'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 014-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 01-4 4H3" />
                  </svg>
                  {repeat === 'one' && <span style={{ fontSize: '10px', marginLeft: '2px' }}>1</span>}
                </button>
              </div>
              <div className="progress-area">
                <span className="time-current">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  className="progress-bar"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  step="0.1"
                />
                <span className="time-total">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="volume-control">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Music;