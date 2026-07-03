import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import './Music.css';
import musicBgImage from '../../assets/images/Music Back.jpg';

const DEEZER_SEARCH_URL = '/api/deezer/search?q=';

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
  
  // State for all artists mode
  const [allArtistsMode, setAllArtistsMode] = useState(false);
  const [modeType, setModeType] = useState(''); // 'videos' or 'albums'

  const audioRef = useRef(null);
  const searchTimeout = useRef(null);
  const searchInputRef = useRef(null);

  // ── Read artist param and mode from URL ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const artistParam = params.get('artist');
    const modeParam = params.get('mode');
    
    // Check if we're in all-artists mode
    if (modeParam === 'all-videos' || modeParam === 'all-albums') {
      setAllArtistsMode(true);
      setModeType(modeParam === 'all-videos' ? 'videos' : 'albums');
      setSearchQuery(modeParam === 'all-videos' ? 'All Music Videos' : 'All Albums');
      fetchAllArtistsContent(modeParam);
    } else if (artistParam) {
      setAllArtistsMode(false);
      setSearchQuery(artistParam);
    } else {
      setAllArtistsMode(false);
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

  // ── Fetch all artists content for videos or albums ──
  const fetchAllArtistsContent = async (mode) => {
    setLoading(true);
    setError('');
    try {
      let tracks = [];
      
      if (mode === 'all-videos') {
        // Fetch music videos from your table
        const { data: videos, error: videosError } = await supabase
          .from('music_videos')
          .select(`
            *,
            artists (
              id,
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(30);

        if (videosError) {
          console.error('Videos fetch error:', videosError);
          throw videosError;
        }
        
        // Transform to match track format
        if (videos && videos.length > 0) {
          tracks = videos.map(video => ({
            id: video.id,
            title: video.title || 'Untitled Video',
            artist: video.artists?.name || 'Unknown Artist',
            artist_id: video.artist_id,
            album: 'Music Video',
            duration: video.duration || 180,
            preview: video.video_url || '',
            cover_small: video.thumbnail_url || 'https://via.placeholder.com/150x150/8B6914/f4d090?text=' + encodeURIComponent(video.title || 'Video'),
            cover_medium: video.thumbnail_url || 'https://via.placeholder.com/300x300/8B6914/f4d090?text=' + encodeURIComponent(video.title || 'Video'),
            isVideo: true,
            videoUrl: video.video_url,
            views: video.views || 0,
            featured: video.featured || false,
            release_date: video.release_date,
            description: video.description,
          }));
        }
      } else if (mode === 'all-albums') {
        // Try to get from bioscope_content as albums fallback
        const { data: bioscopeData, error: bioscopeError } = await supabase
          .from('bioscope_content')
          .select(`
            *,
            artists (
              id,
              name
            )
          `)
          .eq('content_type', 'album')
          .order('created_at', { ascending: false })
          .limit(30);

        if (!bioscopeError && bioscopeData && bioscopeData.length > 0) {
          tracks = bioscopeData.map(item => ({
            id: item.id,
            title: item.title || 'Untitled Album',
            artist: item.artists?.name || item.artist_name || 'Unknown Artist',
            artist_id: item.artist_id,
            album: item.title || 'Album',
            duration: 0,
            preview: item.preview_url || '',
            cover_small: item.cover_url || item.thumbnail_url || 'https://via.placeholder.com/150x150/8B6914/f4d090?text=Album',
            cover_medium: item.cover_url || item.thumbnail_url || 'https://via.placeholder.com/300x300/8B6914/f4d090?text=Album',
            isAlbum: true,
            albumId: item.id,
            releaseYear: item.release_year || null,
          }));
        } else {
          // Try to get albums from artists as fallback
          const { data: artistsData, error: artistsError } = await supabase
            .from('artists')
            .select('id, name, profile_image')
            .order('name')
            .limit(20);

          if (!artistsError && artistsData && artistsData.length > 0) {
            tracks = artistsData.map(artist => ({
              id: `artist-album-${artist.id}`,
              title: `${artist.name} - Album Collection`,
              artist: artist.name,
              artist_id: artist.id,
              album: 'Album Collection',
              duration: 0,
              preview: '',
              cover_small: artist.profile_image || 'https://via.placeholder.com/150x150/8B6914/f4d090?text=' + encodeURIComponent(artist.name),
              cover_medium: artist.profile_image || 'https://via.placeholder.com/300x300/8B6914/f4d090?text=' + encodeURIComponent(artist.name),
              isAlbum: true,
              albumId: `album-${artist.id}`,
              releaseYear: null,
              isPlaceholder: true,
            }));
          }
        }
      }

      setSearchResults(tracks);
      if (tracks.length === 0) {
        setError(`No ${mode === 'all-videos' ? 'music videos' : 'albums'} found from any artists.`);
      }
    } catch (err) {
      console.error('Error fetching all artists content:', err);
      let errorMessage = 'Failed to load content. Please try again.';
      if (err.message) {
        if (err.message.includes('permission denied')) {
          errorMessage = 'You do not have permission to view this content.';
        } else if (err.message.includes('does not exist')) {
          errorMessage = 'The content table is not set up yet. Please check back soon!';
        }
      }
      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Debounced search ──
  useEffect(() => {
    // Don't run search if we're in all-artists mode
    if (allArtistsMode) return;
    
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
            isVideo: false,
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
  }, [searchQuery, allArtistsMode]);

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
      
      // If it's a video, navigate to video player
      if (track.isVideo && track.videoUrl) {
        navigate('/video-player', {
          state: {
            videoUrl: track.videoUrl,
            title: track.title,
            artist: track.artist,
            description: track.description,
            views: track.views,
            release_date: track.release_date,
          },
        });
        return;
      }
      
      // If it's an album, navigate to album view
      if (track.isAlbum && track.albumId) {
        navigate(`/album/${track.albumId}`);
        return;
      }
      
      // Regular track - go to now playing
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
    } else if (track && track.isVideo && track.videoUrl) {
      // For videos, navigate to video player (handled in selectTrack)
      // This is a fallback
    } else if (track && track.isAlbum) {
      // For albums, navigate to album view (handled in selectTrack)
    } else {
      setError('No preview available.');
    }
  }, [currentTrackIndex, currentPlaylist, shuffle, shuffledIndices, navigate]);

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
  const modeFromUrl = params.get('mode');

  // Determine header text based on mode
  const getHeaderText = () => {
    if (modeFromUrl === 'all-videos') return 'All Music Videos';
    if (modeFromUrl === 'all-albums') return 'All Albums';
    if (artistFromUrl) return `Songs by ${artistFromUrl}`;
    return 'The Music Kraal';
  };

  const getSubtitleText = () => {
    if (modeFromUrl === 'all-videos') return 'Music videos from all artists across all tribes';
    if (modeFromUrl === 'all-albums') return 'Albums from all artists across all tribes';
    if (artistFromUrl) return `Search within ${artistFromUrl}'s discography or type a new query`;
    return 'Search any song in the world — play previews, shuffle, repeat, and more';
  };

  const getPlaceholderText = () => {
    if (modeFromUrl === 'all-videos') return 'Search within all music videos...';
    if (modeFromUrl === 'all-albums') return 'Search within all albums...';
    if (artistFromUrl) return `Search ${artistFromUrl}'s songs…`;
    return 'Search — Burna Boy, Tyla, Kabza De Small…';
  };

  // Check if track is playable (has preview)
  const isTrackPlayable = (track) => {
    return track.preview && track.preview.length > 0;
  };

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
              {getHeaderText()}
            </h1>
            <p className="music-subtitle">
              {getSubtitleText()}
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
                placeholder={getPlaceholderText()}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (allArtistsMode) {
                    // Exit all-artists mode when user types
                    setAllArtistsMode(false);
                    setModeType('');
                  }
                }}
              />
              {searchQuery && !allArtistsMode && (
                <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              {allArtistsMode && (
                <button 
                  className="search-clear" 
                  onClick={() => {
                    setAllArtistsMode(false);
                    setModeType('');
                    setSearchQuery('');
                    setSearchResults([]);
                    navigate('/music');
                  }} 
                  aria-label="Clear search"
                >
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

            {searchResults.length === 0 && searchQuery.trim() === '' && !allArtistsMode && (
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
                  <span className="tracklist-count">
                    {searchResults.length} {modeType === 'videos' ? 'videos' : modeType === 'albums' ? 'albums' : 'tracks'}
                  </span>
                  {allArtistsMode && (
                    <span className="tracklist-mode-badge">
                      {modeType === 'videos' ? '🎬 All Music Videos' : '💿 All Albums'}
                    </span>
                  )}
                </div>
                <div className="tracklist-header">
                  <span className="th-num">#</span>
                  <span className="th-title">Title</span>
                  <span className="th-artist">Artist</span>
                  <span className="th-album">{modeType === 'albums' ? 'Release Year' : 'Album'}</span>
                  <span className="th-dur">
                    {modeType === 'videos' ? '👁️' : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    )}
                  </span>
                </div>
                <div className="tracklist-rows">
                  {searchResults.map((track, idx) => {
                    const isActive = currentTrack && currentTrack.id === track.id;
                    const isPlayable = isTrackPlayable(track);
                    return (
                      <div
                        key={track.id || idx}
                        className={`track-item${isActive ? ' active' : ''}${!isPlayable && !track.isVideo && !track.isAlbum ? ' unplayable' : ''}`}
                        onClick={() => {
                          if (isPlayable || track.isVideo || track.isAlbum) {
                            selectTrack(track);
                          } else {
                            setError('This content is not available for preview.');
                          }
                        }}
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
                          <span className="track-title">
                            {track.title}
                            {track.isVideo && <span className="track-badge video">📹</span>}
                            {track.isAlbum && <span className="track-badge album">💿</span>}
                            {track.featured && <span className="track-badge featured">⭐</span>}
                          </span>
                        </div>
                        <div className="track-artist-cell">{track.artist}</div>
                        <div className="track-album-cell">
                          {modeType === 'albums' ? (track.releaseYear || '—') : track.album}
                        </div>
                        <div className="track-dur-cell">
                          {modeType === 'albums' ? 'Album' : 
                           modeType === 'videos' ? (track.views ? `${(track.views / 1000).toFixed(1)}K` : '—') : 
                           formatTime(track.duration)}
                        </div>
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