import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const TABS = ['All', 'Albums', 'Music Videos', 'Biographies'];

const TYPE_MAP = {
  'Albums': 'album',
  'Music Videos': 'music_video',
  'Biographies': 'biography',
};

const TYPE_LABELS = {
  album: 'Album',
  music_video: 'Music Video',
  biography: 'Biography',
};

const TYPE_ICONS = {
  album: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/>
    </svg>
  ),
  music_video: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="5,3 19,12 5,21"/></svg>
  ),
  biography: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
};

// Placeholder cards when no data
const PLACEHOLDER = [
  { id: 'p1', title: 'Roots & Rhythm', type: 'album', artist: 'Khanye Collective', year: '2024', description: 'A soulful journey through the sounds of the motherland.', thumbnail: null },
  { id: 'p2', title: 'Fire Dance', type: 'music_video', artist: 'Amara Soul', year: '2024', description: 'Visual poetry set against the backdrop of the Highveld sunset.', thumbnail: null },
  { id: 'p3', title: 'The Griot Speaks', type: 'biography', artist: 'Elder Nkosi', year: '2023', description: 'A living archive of stories passed down through generations.', thumbnail: null },
  { id: 'p4', title: 'Ubuntu Sessions', type: 'album', artist: 'Various Artists', year: '2025', description: 'Community, harmony, and the spirit of togetherness.', thumbnail: null },
  { id: 'p5', title: 'Nguni Moves', type: 'music_video', artist: 'Zulu Fusion', year: '2025', description: 'Where tradition meets contemporary movement.', thumbnail: null },
  { id: 'p6', title: 'Mama Africa', type: 'biography', artist: 'Thembi Dlamini', year: '2022', description: 'The untold story of a cultural icon.', thumbnail: null },
];

const TYPE_GRADIENTS = {
  album: 'linear-gradient(135deg, #8B6914 0%, #C8732A 100%)',
  music_video: 'linear-gradient(135deg, #6B2D0A 0%, #8B3A0F 100%)',
  biography: 'linear-gradient(135deg, #23140b 0%, #5C4208 100%)',
};

const TYPE_SYMBOLS = {
  album: '◉',
  music_video: '▶',
  biography: '📖',
};

function BioscopeCard({ item, onClick }) {
  return (
    <div className="bsc-card" onClick={() => onClick(item)}>
      <div className="bsc-card-thumb" style={{ background: TYPE_GRADIENTS[item.type] }}>
        {item.thumbnail
          ? <img src={item.thumbnail} alt={item.title} className="bsc-thumb-img" />
          : <span className="bsc-thumb-symbol">{TYPE_SYMBOLS[item.type]}</span>
        }
        <div className="bsc-card-type-badge">
          {TYPE_ICONS[item.type]}
          <span>{TYPE_LABELS[item.type]}</span>
        </div>
      </div>
      <div className="bsc-card-body">
        <h3 className="bsc-card-title">{item.title}</h3>
        <p className="bsc-card-artist">{item.artist}</p>
        <p className="bsc-card-desc">{item.description}</p>
        <div className="bsc-card-footer">
          <span className="bsc-card-year">{item.year}</span>
          <button className="bsc-card-btn">
            {item.type === 'album' ? 'Listen' : item.type === 'music_video' ? 'Watch' : 'Read'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Modal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="bsc-modal-overlay" onClick={onClose}>
      <div className="bsc-modal" onClick={e => e.stopPropagation()}>
        <button className="bsc-modal-close" onClick={onClose}>✕</button>
        <div className="bsc-modal-hero" style={{ background: TYPE_GRADIENTS[item.type] }}>
          {item.thumbnail
            ? <img src={item.thumbnail} alt={item.title} className="bsc-modal-img" />
            : <span className="bsc-modal-symbol">{TYPE_SYMBOLS[item.type]}</span>
          }
        </div>
        <div className="bsc-modal-body">
          <div className="bsc-modal-type">
            {TYPE_ICONS[item.type]}<span>{TYPE_LABELS[item.type]}</span>
          </div>
          <h2 className="bsc-modal-title">{item.title}</h2>
          <p className="bsc-modal-artist">{item.artist} · {item.year}</p>
          <p className="bsc-modal-desc">{item.description}</p>
          {item.url && (
            <a href={item.url} target="_blank" rel="noreferrer" className="bsc-modal-action">
              {item.type === 'album' ? '🎵 Open Album' : item.type === 'music_video' ? '▶ Watch Now' : '📖 Read Story'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Bioscope() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchFilms = async () => {
      const { data, error } = await supabase.from('bioscope').select('*');
      if (error) {
        console.error(error);
        setItems(PLACEHOLDER);
      } else {
        setItems(data && data.length > 0 ? data : PLACEHOLDER);
      }
      setLoading(false);
    };
    fetchFilms();
  }, []);

  const filtered = items.filter(item => {
    const matchTab = activeTab === 'All' || item.type === TYPE_MAP[activeTab];
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.artist?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .bsc-root {
          min-height: 100vh;
          background: radial-gradient(ellipse at top, #1a0d07 0%, #0d0704 60%, #080402 100%);
          font-family: 'DM Sans', sans-serif;
          color: #f4d090;
          padding-bottom: 4rem;
        }

        /* ---- HERO ---- */
        .bsc-hero {
          position: relative;
          padding: 4rem 2rem 3rem;
          text-align: center;
          overflow: hidden;
        }
        .bsc-hero::before {
          content: 'BIOSCOPE';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Playfair Display', serif;
          font-size: clamp(5rem, 15vw, 12rem);
          font-weight: 700;
          color: #f4d090;
          opacity: 0.03;
          white-space: nowrap;
          pointer-events: none;
          letter-spacing: 0.2em;
        }
        .bsc-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(198,122,52,0.12);
          border: 1px solid rgba(198,122,52,0.3);
          border-radius: 50px;
          padding: 0.3rem 1rem;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c67a34;
          margin-bottom: 1.25rem;
        }
        .bsc-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 6vw, 4rem);
          font-weight: 700;
          margin: 0 0 0.75rem;
          line-height: 1.1;
          background: linear-gradient(135deg, #f4d090 0%, #c67a34 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .bsc-hero p {
          color: rgba(244,208,144,0.55);
          font-size: 1rem;
          font-weight: 300;
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ---- SEARCH ---- */
        .bsc-search-wrap {
          max-width: 480px;
          margin: 2rem auto 0;
          position: relative;
        }
        .bsc-search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(244,208,144,0.35);
        }
        .bsc-search {
          width: 100%;
          background: rgba(28,15,10,0.7);
          border: 1px solid rgba(198,122,52,0.3);
          border-radius: 50px;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          color: #f4d090;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .bsc-search::placeholder { color: rgba(244,208,144,0.3); }
        .bsc-search:focus {
          border-color: rgba(198,122,52,0.7);
          box-shadow: 0 0 0 3px rgba(198,122,52,0.1);
        }

        /* ---- TABS ---- */
        .bsc-tabs {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          padding: 2rem 1rem 0;
          flex-wrap: wrap;
        }
        .bsc-tab {
          background: transparent;
          border: 1px solid rgba(198,122,52,0.2);
          border-radius: 50px;
          padding: 0.45rem 1.25rem;
          color: rgba(244,208,144,0.5);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.03em;
        }
        .bsc-tab:hover {
          border-color: rgba(198,122,52,0.5);
          color: #f4d090;
        }
        .bsc-tab.active {
          background: linear-gradient(135deg, #8B6914, #c67a34);
          border-color: transparent;
          color: #fff;
          font-weight: 500;
        }

        /* ---- STATS ---- */
        .bsc-stats {
          display: flex;
          justify-content: center;
          gap: 2.5rem;
          padding: 2rem 1rem 0;
          flex-wrap: wrap;
        }
        .bsc-stat {
          text-align: center;
        }
        .bsc-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #c67a34;
          line-height: 1;
        }
        .bsc-stat-label {
          font-size: 0.75rem;
          color: rgba(244,208,144,0.4);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.25rem;
        }

        /* ---- GRID ---- */
        .bsc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 2.5rem auto 0;
          padding: 0 1.5rem;
        }

        /* ---- CARD ---- */
        .bsc-card {
          background: rgba(20,10,6,0.8);
          border: 1px solid rgba(198,122,52,0.2);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .bsc-card:hover {
          transform: translateY(-6px);
          border-color: rgba(198,122,52,0.5);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(198,122,52,0.08);
        }
        .bsc-card-thumb {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .bsc-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .bsc-thumb-symbol {
          font-size: 3.5rem;
          opacity: 0.5;
        }
        .bsc-card-type-badge {
          position: absolute;
          bottom: 0.75rem;
          left: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          border-radius: 50px;
          padding: 0.25rem 0.65rem;
          font-size: 0.72rem;
          color: #f4d090;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .bsc-card-body {
          padding: 1.25rem;
        }
        .bsc-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 600;
          margin: 0 0 0.25rem;
          color: #f4d090;
          line-height: 1.3;
        }
        .bsc-card-artist {
          font-size: 0.82rem;
          color: #c67a34;
          margin: 0 0 0.6rem;
          font-weight: 500;
        }
        .bsc-card-desc {
          font-size: 0.83rem;
          color: rgba(244,208,144,0.5);
          line-height: 1.6;
          margin: 0 0 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bsc-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bsc-card-year {
          font-size: 0.78rem;
          color: rgba(244,208,144,0.3);
          letter-spacing: 0.05em;
        }
        .bsc-card-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: transparent;
          border: 1px solid rgba(198,122,52,0.4);
          border-radius: 50px;
          padding: 0.3rem 0.85rem;
          color: #c67a34;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .bsc-card-btn:hover {
          background: rgba(198,122,52,0.15);
          border-color: #c67a34;
        }

        /* ---- EMPTY STATE ---- */
        .bsc-empty {
          text-align: center;
          padding: 5rem 2rem;
          color: rgba(244,208,144,0.3);
        }
        .bsc-empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .bsc-empty p { font-size: 0.9rem; }

        /* ---- LOADING ---- */
        .bsc-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 40vh;
          gap: 0.6rem;
        }
        .bsc-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #c67a34;
          animation: bscPulse 1.2s ease-in-out infinite;
        }
        .bsc-dot:nth-child(2) { animation-delay: 0.2s; }
        .bsc-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bscPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* ---- MODAL ---- */
        .bsc-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(6px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: bscFadeIn 0.2s ease;
        }
        @keyframes bscFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .bsc-modal {
          background: #140a05;
          border: 1px solid rgba(198,122,52,0.35);
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          overflow: hidden;
          position: relative;
          animation: bscSlideUp 0.25s ease;
        }
        @keyframes bscSlideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .bsc-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.5);
          border: none;
          color: #f4d090;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.85rem;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bsc-modal-hero {
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bsc-modal-img { width: 100%; height: 100%; object-fit: cover; }
        .bsc-modal-symbol { font-size: 5rem; opacity: 0.4; }
        .bsc-modal-body { padding: 1.75rem; }
        .bsc-modal-type {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #c67a34;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
        }
        .bsc-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #f4d090;
          margin: 0 0 0.35rem;
          line-height: 1.2;
        }
        .bsc-modal-artist {
          color: rgba(244,208,144,0.5);
          font-size: 0.85rem;
          margin: 0 0 1rem;
        }
        .bsc-modal-desc {
          color: rgba(244,208,144,0.65);
          font-size: 0.9rem;
          line-height: 1.7;
          margin: 0 0 1.5rem;
        }
        .bsc-modal-action {
          display: inline-block;
          background: linear-gradient(135deg, #8B6914, #c67a34);
          color: #fff;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .bsc-modal-action:hover { opacity: 0.85; }

        /* ---- DIVIDER ---- */
        .bsc-section-label {
          max-width: 1200px;
          margin: 2.5rem auto 0;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: rgba(244,208,144,0.35);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .bsc-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(198,122,52,0.15);
        }
      `}</style>

      <div className="bsc-root">
        {/* Hero */}
        <div className="bsc-hero">
          <div className="bsc-hero-eyebrow">
            🎬 Kwa Khanye
          </div>
          <h1>The Bioscope</h1>
          <p>Albums, music videos & biographies — a living archive of African culture</p>

          {/* Search */}
          <div className="bsc-search-wrap">
            <span className="bsc-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              className="bsc-search"
              type="text"
              placeholder="Search titles, artists..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bsc-stats">
          <div className="bsc-stat">
            <div className="bsc-stat-num">{items.filter(i => i.type === 'album').length}</div>
            <div className="bsc-stat-label">Albums</div>
          </div>
          <div className="bsc-stat">
            <div className="bsc-stat-num">{items.filter(i => i.type === 'music_video').length}</div>
            <div className="bsc-stat-label">Music Videos</div>
          </div>
          <div className="bsc-stat">
            <div className="bsc-stat-num">{items.filter(i => i.type === 'biography').length}</div>
            <div className="bsc-stat-label">Biographies</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bsc-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`bsc-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Section label */}
        <div className="bsc-section-label">
          {filtered.length} {activeTab === 'All' ? 'items' : activeTab.toLowerCase()}
        </div>

        {/* Content */}
        {loading ? (
          <div className="bsc-loading">
            <div className="bsc-dot"/><div className="bsc-dot"/><div className="bsc-dot"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bsc-empty">
            <div className="bsc-empty-icon">🎭</div>
            <p>Nothing found. Try a different search or tab.</p>
          </div>
        ) : (
          <div className="bsc-grid">
            {filtered.map(item => (
              <BioscopeCard key={item.id} item={item} onClick={setSelected} />
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal item={selected} onClose={() => setSelected(null)} />
      </div>
    </>
  );
}

export default Bioscope;