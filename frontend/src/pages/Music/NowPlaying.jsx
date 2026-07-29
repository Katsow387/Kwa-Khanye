import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NowPlaying.css';

// Optional background – if missing, the page will still work
import calabashImage from '../../assets/images/music_calabash.png';
import nowPlayingBg from '../../assets/images/NowPlay.jpg';

function NowPlaying() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    playlist,
    trackIndex,
    shuffle: initialShuffle = false,
    repeat: initialRepeat = 'off',
  } = location.state || {};

  const [currentPlaylist] = useState(playlist || []);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(trackIndex ?? -1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [shuffle, setShuffle] = useState(initialShuffle);
  const [repeat, setRepeat] = useState(initialRepeat);
  const [shuffledIndices, setShuffledIndices] = useState([]);
  const [liked, setLiked] = useState(false);

  const audioRef = useRef(null);

  const generateShuffledIndices = (arr) => {
    const indices = arr.map((_, idx) => idx);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  };

  useEffect(() => {
    if (shuffle && currentPlaylist.length) {
      setShuffledIndices(generateShuffledIndices(currentPlaylist));
    }
  }, [shuffle, currentPlaylist]);

  const getCurrentTrack = () => {
    if (currentTrackIndex < 0 || !currentPlaylist.length) return null;
    if (shuffle) return currentPlaylist[shuffledIndices[currentTrackIndex]];
    return currentPlaylist[currentTrackIndex];
  };

  const currentTrack = getCurrentTrack();

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        nextTrack();
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [repeat, shuffle, currentPlaylist, currentTrackIndex, shuffledIndices]);

  // Load and play track when index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentTrackIndex < 0 || !currentTrack) return;

    if (currentTrack.preview) {
      audio.pause();
      setIsPlaying(false);
      audio.src = currentTrack.preview;
      audio.load();
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex, currentTrack]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const nextTrack = () => {
    if (!currentPlaylist.length) return;
    setIsPlaying(false);
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
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(val)) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));

  const toggleShuffle = () => {
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    if (newShuffle && currentPlaylist.length) {
      const indices = generateShuffledIndices(currentPlaylist);
      setShuffledIndices(indices);
      const realIndex = shuffle ? shuffledIndices[currentTrackIndex] : currentTrackIndex;
      const newIdx = indices.findIndex(i => i === realIndex);
      setCurrentTrackIndex(newIdx !== -1 ? newIdx : 0);
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

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // If no track is selected, show a fallback
  if (!currentTrack) {
    return (
      <div
        className="np-page"
        style={{
          backgroundImage: `url(${nowPlayingBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#D4A855',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No track selected.</p>
          <button
            onClick={() => navigate('/music')}
            style={{
              background: 'none',
              border: '1px solid #D4A855',
              color: '#D4A855',
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Go back to Music
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="np-page"
      style={{
        backgroundImage: `url(${nowPlayingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="np-overlay" style={{ background: 'rgba(8, 4, 1, 0.85)' }} />
      <audio ref={audioRef} />

      {/* Top bar */}
      <div className="np-topbar">
        <button className="np-back-btn" onClick={() => navigate('/music')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="np-topbar-label">Kwa Khanye · Music</span>
        <div className="np-side-controls">
          <input
            type="range"
            className="np-volume-slider"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>

      {/* Calabash disc */}
      <div className="np-disc-area">
        <div className={`np-glow-ring${isPlaying ? ' spinning' : ''}`} />
        <div className={`np-gold-ring${isPlaying ? ' spinning' : ''}`}>
          <div className="np-disc-inner">
            <img src={calabashImage} alt="Calabash" className="np-disc-img" />
          </div>
        </div>
        {isPlaying && (
          <div className="np-steam">
            <span /><span /><span /><span /><span />
          </div>
        )}
        <div className="np-ring-deco" />
      </div>

      {/* Track info */}
      <div className="np-track-info">
        <div className="np-track-title">{currentTrack.title}</div>
        <div className="np-track-artist">{currentTrack.artist || 'Unknown Artist'}</div>
      </div>

      {/* Progress + heart */}
      <div className="np-progress-section">
        <div className="np-progress-wrap">
          <span className="np-time">{formatTime(currentTime)}</span>
          <div className="np-progress-track">
            <div className="np-progress-fill" style={{ width: `${progressPercent}%` }} />
            <input
              type="range"
              className="np-progress-input"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              step="0.1"
            />
          </div>
          <span className="np-time">{formatTime(duration)}</span>
        </div>
        <button className={`np-heart-btn${liked ? ' liked' : ''}`} onClick={() => setLiked(!liked)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Main controls */}
      <div className="np-controls">
        <button className={`np-ctrl-btn${shuffle ? ' active' : ''}`} onClick={toggleShuffle} title="Shuffle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
          </svg>
        </button>
        <button className="np-ctrl-btn" onClick={prevTrack}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>
        <button className="np-play-btn" onClick={togglePlayPause}>
          {isPlaying
            ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          }
        </button>
        <button className="np-ctrl-btn" onClick={nextTrack}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
        <button className={`np-ctrl-btn${repeat !== 'off' ? ' active' : ''}`} onClick={toggleRepeat} title="Repeat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
            <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
          </svg>
          {repeat === 'one' && <span className="np-repeat-badge">1</span>}
        </button>
      </div>

      {/* Add/Remove row */}
      <div className="np-action-row">
        <button className="np-action-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add</span>
        </button>
        <button className="np-action-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Remove</span>
        </button>
      </div>

      {/* Bottom nav */}
      <nav className="np-bottom-nav">
        <button className="np-nav-btn" onClick={() => navigate('/')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </button>
        <button className="np-nav-btn" onClick={() => navigate('/homevr')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <span>VR</span>
        </button>
        <button className="np-nav-btn np-nav-btn--active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          <span>Music</span>
        </button>
        <button className="np-nav-btn" onClick={() => navigate('/bioscope')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
          </svg>
          <span>Bioscope</span>
        </button>
      </nav>
    </div>
  );
}

export default NowPlaying;