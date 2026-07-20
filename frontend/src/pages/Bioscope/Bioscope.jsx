// Bioscope.jsx — background image with invisible hotspots for Biographer,
// Music Video, and Album (labelled "Traditional Storytelling" and
// "New Arrivals" on the artwork itself).
//
// Hotspots are positioned as PERCENTAGES OF THE IMAGE ITSELF (not the screen),
// so they line up correctly no matter what size/aspect ratio the viewport is,
// even though the image uses object-fit: contain (letterboxing).
//
// Three hotspots, three fixed behaviors — ALL self-contained overlays, none
// of them navigate away by default, so none of them can ever land you back
// on Music or anywhere else by accident:
//   - Biographer: opens an overlay showing that artist's bio, pulled
//     directly from the artists row. A "View full profile" link inside the
//     overlay is the only way it navigates anywhere, and only on click.
//   - Music Video: opens an overlay listing that artist's music videos (or
//     an empty-state message if they have none yet).
//   - Album: opens an overlay listing that artist's albums. Picking one
//     fetches its tracks and hands off to the existing Calabash player at
//     /now-playing (same playlist shape Music.jsx uses) — that's genuine
//     playback, not a fallback, so it's the one intentional exception.
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import bioscopeImage from '../../assets/images/Bioscope Kraal.png';
import pageBackgroundImage from '../../assets/images/NowPlay.jpg';

// ─── Per-artist Bioscope config ──────────────────────────────────────────────
// Keyed by the slug that appears in the URL, e.g. /bioscope/bhekumuzi-luthuli
// matches the entry with key 'bhekumuzi-luthuli'. Should match whatever is
// stored in artists.bioscope_route in Supabase (the part after "/bioscope/").
//
// To give a specific artist their own artwork later:
//   1. Import their image at the top of this file
//   2. Add an entry here, e.g.: 'bhekumuzi-luthuli': { image: bhekumuziImage },
// Until then, every artist falls back to the default image below — nothing
// changes visually right now.
const BIOSCOPE_CONFIG = {
  // 'bhekumuzi-luthuli': { image: bhekumuziBioscopeImage },
};

// Set to true temporarily if you want to see colored/labeled boxes over the
// three frames (useful if you ever change the artwork and need to re-measure).
const SHOW_DEBUG_OUTLINES = false;

const DEFAULT_CONFIG = {
  image: bioscopeImage,
};

function getBioscopeConfig(artistSlug) {
  const override = artistSlug ? BIOSCOPE_CONFIG[artistSlug] : undefined;
  return { ...DEFAULT_CONFIG, ...override };
}

// ─── Frame hotspots ───────────────────────────────────────────────────────
// Positions are % of the RENDERED IMAGE (not the screen), same as before.
// These were measured directly from the actual artwork (Mapantsula poster /
// Traditional Storytelling video / New Arrivals grid), so they should line
// up correctly out of the box.
function getHotspots() {
  return [
    {
      label: 'Biographer',
      kind: 'biographer',
      top: '16.5%',
      left: '16.4%',
      width: '18%',
      height: '25.3%',
    },
    {
      label: 'Music Video',
      kind: 'video',
      top: '19.8%',
      left: '42.3%',
      width: '16.8%',
      height: '22%',
    },
    {
      label: 'Album',
      kind: 'album',
      top: '18%',
      left: '67.2%',
      width: '18%',
      height: '23.8%',
    },
  ];
}

/**
 * Tracks the actual on-screen box occupied by an <img> that's rendered with
 * object-fit: contain inside a container that may be a different aspect
 * ratio (i.e. the letterboxed area). Returns {top, left, width, height} in
 * pixels relative to the container, or null until the image has loaded.
 */
function useContainedImageRect(imgRef, containerRef) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const compute = () => {
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      if (!naturalW || !naturalH) return;

      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const containerRatio = containerW / containerH;
      const imageRatio = naturalW / naturalH;

      let renderedW, renderedH, offsetX, offsetY;

      if (imageRatio > containerRatio) {
        // Image is relatively wider than container -> letterboxed top/bottom
        renderedW = containerW;
        renderedH = containerW / imageRatio;
        offsetX = 0;
        offsetY = (containerH - renderedH) / 2;
      } else {
        // Image is relatively taller than container -> letterboxed left/right
        renderedH = containerH;
        renderedW = containerH * imageRatio;
        offsetY = 0;
        offsetX = (containerW - renderedW) / 2;
      }

      setRect({ top: offsetY, left: offsetX, width: renderedW, height: renderedH });
    };

    if (img.complete) compute();
    img.addEventListener('load', compute);

    const resizeObserver = new ResizeObserver(compute);
    resizeObserver.observe(container);

    return () => {
      img.removeEventListener('load', compute);
      resizeObserver.disconnect();
    };
  }, [imgRef, containerRef]);

  return rect;
}

export default function Bioscope() {
  const navigate = useNavigate();
  const { artistSlug } = useParams();
  const config = getBioscopeConfig(artistSlug);
  const hotspots = getHotspots();
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const imageRect = useContainedImageRect(imgRef, containerRef);

  // ─── Artist + content lookups ──────────────────────────────────────────
  const [artist, setArtist] = useState(null); // full row, for bio fields
  const [artistId, setArtistId] = useState(null);
  const [artistName, setArtistName] = useState('');
  const [artistLookupDone, setArtistLookupDone] = useState(false);
  const [videos, setVideos] = useState([]);
  const [albums, setAlbums] = useState([]);

  // ─── Overlay state ──────────────────────────────────────────────────────
  // overlay: null | 'biographer' | 'video-list' | 'video-player' |
  //          'album-list' | 'loading'
  // ('loading' is a brief spinner shown while we fetch an album's tracks
  // before handing off to /now-playing, so the click never feels dead.)
  const [overlay, setOverlay] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login', { replace: true });
    };
    checkAuth();
  }, [navigate]);

  // Resolve the artist row for this slug, then pull their videos + albums.
  useEffect(() => {
    let cancelled = false;

    const loadArtistContent = async () => {
      if (!artistSlug) {
        // Generic /bioscope with no artist context — nothing to look up.
        setArtistLookupDone(true);
        return;
      }

      const { data: artist, error: artistError } = await supabase
        .from('artists')
        .select('*')
        .eq('bioscope_route', artistSlug)
        .maybeSingle();

      if (cancelled) return;

      if (artistError || !artist) {
        console.warn(
          `[Bioscope] No artist found for slug "${artistSlug}". ` +
          'Biographer/Video/Album overlays will show empty-state messages ' +
          'instead of real content. Check that an artists row has ' +
          'bioscope_route set to this exact value.',
          artistError || ''
        );
        setArtistLookupDone(true);
        return;
      }

      setArtist(artist);
      setArtistId(artist.id);
      // Column name for the display name isn't confirmed — try the likely
      // candidates and fall back to deriving it from an album title below.
      setArtistName(artist.name || artist.artist_name || artist.stage_name || artist.full_name || '');

      const [videosRes, albumsRes] = await Promise.all([
        supabase
          .from('music_videos')
          .select('*')
          .eq('artist_id', artist.id)
          .order('featured', { ascending: false })
          .order('release_date', { ascending: false }),
        supabase
          .from('albums')
          .select('*')
          .eq('artist_id', artist.id)
          .order('featured', { ascending: false })
          .order('release_date', { ascending: false }),
      ]);

      if (cancelled) return;

      setVideos(videosRes.data || []);
      setAlbums(albumsRes.data || []);
      setArtistLookupDone(true);
    };

    loadArtistContent();
    return () => {
      cancelled = true;
    };
  }, [artistSlug]);

  const closeOverlay = () => {
    setOverlay(null);
    setSelectedVideo(null);
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
    setOverlay('video-player');
  };

  // Derives a display name for a track's "artist" field. Prefers the name
  // pulled from the artists table; falls back to parsing it out of the
  // album title, since your data uses "Artist Name - Album Title".
  const resolveArtistLabel = (album) => {
    if (artistName) return artistName;
    if (album?.title && album.title.includes(' - ')) {
      return album.title.split(' - ')[0];
    }
    return album?.title || '';
  };

  // Fetches an album's tracks and hands off to the existing Calabash
  // player at /now-playing, using the same { playlist, trackIndex, shuffle,
  // repeat } shape Music.jsx already passes — so albums played from the
  // Bioscope get shuffle/repeat/like for free instead of a separate player.
  const openAlbum = async (album) => {
    setOverlay('loading');
    const { data } = await supabase
      .from('album_tracks')
      .select('*')
      .eq('album_id', album.id)
      .order('track_number', { ascending: true });

    const tracks = data || [];
    if (tracks.length === 0) {
      // No tracks logged for this album yet — go back to the album list
      // rather than navigating away to somewhere unrelated.
      setOverlay('album-list');
      return;
    }

    const artistLabel = resolveArtistLabel(album);
    const playlist = tracks.map((t) => ({
      id: t.id,
      title: t.title,
      duration: t.duration,
      preview: t.preview_url,
      cover_small: album.cover_small || album.cover_medium || album.cover_image,
      artist: artistLabel,
    }));

    navigate('/now-playing', {
      state: {
        playlist,
        trackIndex: 0,
        shuffle: false,
        repeat: 'off',
      },
    });
  };

  // Column name for bio text isn't confirmed — try the likely candidates.
  const resolveBio = () => {
    if (!artist) return '';
    return (
      artist.bio ||
      artist.biography ||
      artist.about ||
      artist.description ||
      artist.artist_bio ||
      artist.story ||
      ''
    );
  };

  const handleHotspotClick = (spot) => {
    if (spot.kind === 'biographer') {
      // Always the overlay — never navigates on its own, so it can never
      // land you anywhere near Music by accident.
      setOverlay('biographer');
      return;
    }

    if (spot.kind === 'video') {
      // Always show the list — ItemGrid already renders an empty-state
      // message ("Nothing here yet.") if this artist has no videos, so
      // there's no silent redirect to somewhere else.
      setOverlay('video-list');
      return;
    }

    if (spot.kind === 'album') {
      setOverlay('album-list');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `url(${pageBackgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed',
      backgroundColor: 'rgba(10, 6, 3, 0.85)',
      backgroundBlendMode: 'multiply',
    }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <img
          ref={imgRef}
          src={config.image}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            pointerEvents: 'none', // clicks pass through to hotspots below
            userSelect: 'none',
          }}
        />

        {/* Hotspots only render once we know the actual image bounds,
            so they never briefly appear in the wrong place.

            DEBUG MODE IS ON: each frame is outlined and labeled so you can
            see where it currently sits. Once the three boxes line up with
            the actual frames in your artwork, set SHOW_DEBUG_OUTLINES to
            false below to make them invisible again. */}
        {imageRect && artistLookupDone && hotspots.map((spot, i) => {
          const debugColors = ['rgba(255,0,0,0.25)', 'rgba(0,200,0,0.25)', 'rgba(0,120,255,0.25)'];
          const style = {
            position: 'absolute',
            top: spot.top !== undefined
              ? `${imageRect.top + parsePercent(spot.top) * imageRect.height}px`
              : undefined,
            bottom: spot.bottom !== undefined
              ? `${imageRect.top + imageRect.height - parsePercent(spot.bottom) * imageRect.height - parsePercent(spot.height) * imageRect.height}px`
              : undefined,
            left: spot.left !== undefined
              ? `${imageRect.left + parsePercent(spot.left) * imageRect.width}px`
              : undefined,
            right: spot.right !== undefined
              ? `${imageRect.left + imageRect.width - parsePercent(spot.right) * imageRect.width - parsePercent(spot.width) * imageRect.width}px`
              : undefined,
            width: `${parsePercent(spot.width) * imageRect.width}px`,
            height: `${parsePercent(spot.height) * imageRect.height}px`,
            transform: spot.centered ? 'translateX(-50%)' : undefined,
            cursor: 'pointer',
            zIndex: 20,
            backgroundColor: SHOW_DEBUG_OUTLINES ? debugColors[i % debugColors.length] : 'transparent',
            border: SHOW_DEBUG_OUTLINES ? '2px dashed rgba(255,255,255,0.8)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'sans-serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          };

          return (
            <div
              key={spot.label}
              onClick={() => handleHotspotClick(spot)}
              style={style}
              aria-label={spot.label}
              role="button"
            >
              {SHOW_DEBUG_OUTLINES ? spot.label : null}
            </div>
          );
        })}

        {overlay && (
          <BioscopeOverlay
            overlay={overlay}
            artistId={artistId}
            artistName={artistName}
            bio={resolveBio()}
            videos={videos}
            albums={albums}
            selectedVideo={selectedVideo}
            onSelectVideo={openVideo}
            onSelectAlbum={openAlbum}
            onViewProfile={() => navigate(`/artist/${artistId}`)}
            onClose={closeOverlay}
          />
        )}
      </div>
    </div>
  );
}

function parsePercent(value) {
  return parseFloat(value) / 100;
}

// ─── Overlay UI ─────────────────────────────────────────────────────────────
// Handles the overlay states rendered directly in the Bioscope: picking a
// video, playing a video, picking an album (selecting an album itself
// navigates away to /now-playing, handled in the parent), and the brief
// loading spinner shown while an album's tracks are being fetched.
function BioscopeOverlay({
  overlay,
  artistId,
  artistName,
  bio,
  videos,
  albums,
  selectedVideo,
  onSelectVideo,
  onSelectAlbum,
  onViewProfile,
  onClose,
}) {
  // The 'loading' state is a brief, dismissible spinner shown while an
  // album's tracks are being fetched before we navigate to /now-playing.
  const isDismissable = overlay !== 'loading';

  return (
    <div
      onClick={isDismissable ? onClose : undefined}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(10, 6, 3, 0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5%',
      }}
    >
      {overlay === 'loading' ? (
        <div style={{ color: '#f4d090', fontFamily: 'sans-serif', opacity: 0.85 }}>
          Loading album…
        </div>
      ) : (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(640px, 100%)',
          maxHeight: '85%',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #241207, #140a04)',
          border: '1px solid rgba(244,208,144,0.25)',
          borderRadius: '12px',
          padding: '24px',
          color: '#f4d090',
          fontFamily: 'sans-serif',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: '#f4d090',
            fontSize: '1.4rem',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {overlay === 'biographer' && (
          <>
            <h2 style={heading}>{artistName || 'Biographer'}</h2>
            {bio ? (
              <p style={{ lineHeight: 1.6, opacity: 0.92, whiteSpace: 'pre-line' }}>{bio}</p>
            ) : (
              <p style={{ opacity: 0.7 }}>
                No biography on file for this artist yet.
              </p>
            )}
            {artistId && (
              <button style={backButton} onClick={onViewProfile}>
                View full profile &rarr;
              </button>
            )}
          </>
        )}

        {overlay === 'video-list' && (
          <>
            <h2 style={heading}>Music Videos</h2>
            <ItemGrid
              items={videos}
              getKey={(v) => v.id}
              getImg={(v) => v.thumbnail_url}
              getTitle={(v) => v.title}
              getSubtitle={(v) => v.release_date && new Date(v.release_date).getFullYear()}
              onSelect={onSelectVideo}
            />
          </>
        )}

        {overlay === 'video-player' && selectedVideo && (
          <>
            <h2 style={heading}>{selectedVideo.title}</h2>
            {selectedVideo.video_url ? (
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                style={{ width: '100%', borderRadius: '8px', background: '#000' }}
              />
            ) : (
              <div style={placeholderBox}>
                {selectedVideo.thumbnail_url && (
                  <img
                    src={selectedVideo.thumbnail_url}
                    alt=""
                    style={{ width: '100%', borderRadius: '8px', marginBottom: '12px' }}
                  />
                )}
                <p style={{ margin: 0, opacity: 0.8 }}>Video coming soon.</p>
              </div>
            )}
            {selectedVideo.description && (
              <p style={{ marginTop: '14px', opacity: 0.85, fontSize: '0.9rem' }}>
                {selectedVideo.description}
              </p>
            )}
            {videos.length > 1 && (
              <button style={backButton} onClick={() => onSelectVideo(null) || null}>
                &larr; Back to videos
              </button>
            )}
          </>
        )}

        {overlay === 'album-list' && (
          <>
            <h2 style={heading}>Albums</h2>
            <ItemGrid
              items={albums}
              getKey={(a) => a.id}
              getImg={(a) => a.cover_medium || a.cover_image || a.cover_url}
              getTitle={(a) => a.title}
              getSubtitle={(a) => a.release_date && new Date(a.release_date).getFullYear()}
              onSelect={onSelectAlbum}
            />
          </>
        )}

      </div>
      )}
    </div>
  );
}

function ItemGrid({ items, getKey, getImg, getTitle, getSubtitle, onSelect }) {
  if (items.length === 0) {
    return <p style={{ opacity: 0.7 }}>Nothing here yet.</p>;
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '14px',
      }}
    >
      {items.map((item) => (
        <button
          key={getKey(item)}
          onClick={() => onSelect(item)}
          style={{
            background: 'rgba(244,208,144,0.06)',
            border: '1px solid rgba(244,208,144,0.18)',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: '#f4d090',
            textAlign: 'left',
          }}
        >
          {getImg(item) && (
            <img
              src={getImg(item)}
              alt=""
              style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }}
            />
          )}
          <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>{getTitle(item)}</div>
          {getSubtitle(item) && (
            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{getSubtitle(item)}</div>
          )}
        </button>
      ))}
    </div>
  );
}

const heading = {
  margin: '0 0 16px 0',
  fontSize: '1.2rem',
  fontWeight: 700,
  paddingRight: '24px',
};

const placeholderBox = {
  background: 'rgba(0,0,0,0.3)',
  borderRadius: '8px',
  padding: '16px',
};

const backButton = {
  marginTop: '16px',
  background: 'transparent',
  border: '1px solid rgba(244,208,144,0.35)',
  borderRadius: '6px',
  padding: '8px 14px',
  color: '#f4d090',
  cursor: 'pointer',
  fontSize: '0.85rem',
};