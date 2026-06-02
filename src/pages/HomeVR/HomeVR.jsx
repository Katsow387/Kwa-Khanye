import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

const TABS = ['All', 'Art Collection', 'NFTs', 'Museum', 'Online Store'];

const TYPE_MAP = {
  'Art Collection': 'art',
  'NFTs': 'nft',
  'Museum': 'museum',
  'Online Store': 'store',
};

const TYPE_META = {
  art: { label: 'Art Collection', symbol: '🎨', color: '#8B6914', grad: 'linear-gradient(135deg, #8B6914 0%, #C8732A 100%)' },
  nft: { label: 'NFT', symbol: '◈', color: '#6B2D8B', grad: 'linear-gradient(135deg, #3d1a5c 0%, #6B2D8B 100%)' },
  museum: { label: 'Museum', symbol: '🏛', color: '#1a4a6B', grad: 'linear-gradient(135deg, #0d2a40 0%, #1a4a6B 100%)' },
  store: { label: 'Store', symbol: '🛍', color: '#2d6B3a', grad: 'linear-gradient(135deg, #1a3d22 0%, #2d6B3a 100%)' },
};

const PLACEHOLDER = [
  { id: 'p1', title: 'Ancestral Voices', type: 'art', artist: 'Zanele Mokoena', price: null, edition: null, description: 'Mixed media exploration of ancestral connection through colour and form.', thumbnail: null, category: 'Painting' },
  { id: 'p2', title: 'Ubuntu #001', type: 'nft', artist: 'Digital Griot', price: '0.8 ETH', edition: '1 of 10', description: 'A generative piece born from African geometric patterns and digital soul.', thumbnail: null, category: 'Generative' },
  { id: 'p3', title: 'The Great Kraal', type: 'museum', artist: 'Kwa Khanye Archive', price: null, edition: null, description: 'An immersive virtual walk through a reconstructed 19th-century Nguni homestead.', thumbnail: null, category: 'Virtual Tour' },
  { id: 'p4', title: 'Isigqoko Print', type: 'store', artist: 'Kwa Khanye', price: 'R 450', edition: null, description: 'High-quality art print of the iconic Zulu hat series. Ships nationwide.', thumbnail: null, category: 'Print' },
  { id: 'p5', title: 'Fire & Clay', type: 'art', artist: 'Thabo Sithole', price: null, edition: null, description: 'Ceramic sculpture series celebrating the ancient craft of the Venda people.', thumbnail: null, category: 'Sculpture' },
  { id: 'p6', title: 'Ndebele Genesis #007', type: 'nft', artist: 'PixelNdlovu', price: '1.2 ETH', edition: '7 of 20', description: 'On-chain homage to the bold geometric language of Ndebele wall art.', thumbnail: null, category: 'Digital Art' },
  { id: 'p7', title: 'Mapungubwe Gold', type: 'museum', artist: 'Kwa Khanye Archive', price: null, edition: null, description: 'Explore the treasures of the Mapungubwe kingdom in an interactive 3D space.', thumbnail: null, category: 'Exhibition' },
  { id: 'p8', title: 'Kwa Khanye Tote', type: 'store', artist: 'Kwa Khanye', price: 'R 280', edition: null, description: 'Canvas tote featuring original Kwa Khanye artwork. Ethically produced.', thumbnail: null, category: 'Merchandise' },
];

const SECTION_ICONS = {
  art: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
  nft: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/>
      <line x1="12" y1="2" x2="12" y2="22"/>
      <line x1="2" y1="8.5" x2="22" y2="8.5"/>
      <line x1="2" y1="15.5" x2="22" y2="15.5"/>
    </svg>
  ),
  museum: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 22V11l9-9 9 9v11"/>
      <path d="M9 22V12h6v10"/>
    </svg>
  ),
  store: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
};

function FeaturedBanner({ item }) {
  if (!item) return null;
  const meta = TYPE_META[item.type];
  return (
    <div className="vr-featured" style={{ background: meta.grad }}>
      <div className="vr-featured-inner">
        <div className="vr-featured-text">
          <span className="vr-featured-eyebrow">{meta.label} · Featured</span>
          <h2 className="vr-featured-title">{item.title}</h2>
          <p className="vr-featured-artist">{item.artist}</p>
          <p className="vr-featured-desc">{item.description}</p>
          <div className="vr-featured-actions">
            <button className="vr-featured-btn primary">
              {item.type === 'store' ? `Buy · ${item.price}` : item.type === 'nft' ? `Collect · ${item.price}` : 'Explore'}
            </button>
          </div>
        </div>
        <div className="vr-featured-art">
          {item.thumbnail
            ? <img src={item.thumbnail} alt={item.title} />
            : <span className="vr-featured-symbol">{meta.symbol}</span>
          }
        </div>
      </div>
    </div>
  );
}

function VRCard({ item, onClick }) {
  const meta = TYPE_META[item.type];
  return (
    <div className="vr-card" onClick={() => onClick(item)}>
      <div className="vr-card-thumb" style={{ background: meta.grad }}>
        {item.thumbnail
          ? <img src={item.thumbnail} alt={item.title} className="vr-thumb-img" />
          : <span className="vr-thumb-symbol">{meta.symbol}</span>
        }
        {item.edition && <div className="vr-edition-badge">{item.edition}</div>}
        <div className="vr-card-type-tag">
          {SECTION_ICONS[item.type]}
          <span>{meta.label}</span>
        </div>
      </div>
      <div className="vr-card-body">
        {item.category && <span className="vr-card-category">{item.category}</span>}
        <h3 className="vr-card-title">{item.title}</h3>
        <p className="vr-card-artist">{item.artist}</p>
        <p className="vr-card-desc">{item.description}</p>
        <div className="vr-card-footer">
          {item.price
            ? <span className="vr-card-price">{item.price}</span>
            : <span className="vr-card-free">Free Access</span>
          }
          <button className="vr-card-cta">
            {item.type === 'store' ? 'Add to Cart' : item.type === 'nft' ? 'Collect' : item.type === 'museum' ? 'Enter' : 'View'}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12,5 19,12 12,19"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Modal({ item, onClose }) {
  if (!item) return null;
  const meta = TYPE_META[item.type];
  return (
    <div className="vr-overlay" onClick={onClose}>
      <div className="vr-modal" onClick={e => e.stopPropagation()}>
        <button className="vr-modal-close" onClick={onClose}>✕</button>
        <div className="vr-modal-hero" style={{ background: meta.grad }}>
          {item.thumbnail
            ? <img src={item.thumbnail} alt={item.title} className="vr-modal-img" />
            : <span className="vr-modal-symbol">{meta.symbol}</span>
          }
        </div>
        <div className="vr-modal-body">
          <div className="vr-modal-meta">
            <span className="vr-modal-type-label" style={{ color: meta.color }}>{meta.label}</span>
            {item.edition && <span className="vr-modal-edition">{item.edition}</span>}
          </div>
          <h2 className="vr-modal-title">{item.title}</h2>
          <p className="vr-modal-artist">{item.artist} {item.category && `· ${item.category}`}</p>
          <p className="vr-modal-desc">{item.description}</p>
          {item.price && (
            <div className="vr-modal-price-row">
              <span className="vr-modal-price">{item.price}</span>
            </div>
          )}
          <button className="vr-modal-action" style={{ background: meta.grad }}>
            {item.type === 'store' ? '🛍 Add to Cart' : item.type === 'nft' ? '◈ Collect NFT' : item.type === 'museum' ? '🏛 Enter Exhibition' : '🎨 View Artwork'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionStrip({ title, icon, items, onSelect }) {
  if (items.length === 0) return null;
  return (
    <div className="vr-strip">
      <div className="vr-strip-header">
        <span className="vr-strip-icon">{icon}</span>
        <h3 className="vr-strip-title">{title}</h3>
        <span className="vr-strip-count">{items.length}</span>
      </div>
      <div className="vr-strip-scroll">
        {items.map(item => <VRCard key={item.id} item={item} onClick={onSelect} />)}
      </div>
    </div>
  );
}

function HomeVR() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  // ✅ AUTH CHECK – redirect to login if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchArt = async () => {
      const { data, error } = await supabase.from('vr_art').select('*');
      if (error) {
        console.error(error);
        setItems(PLACEHOLDER);
      } else {
        setItems(data && data.length > 0 ? data : PLACEHOLDER);
      }
      setLoading(false);
    };
    fetchArt();
  }, []);

  const filtered = items.filter(item => {
    const matchTab = activeTab === 'All' || item.type === TYPE_MAP[activeTab];
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.artist?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const byType = type => filtered.filter(i => i.type === type);
  const showSections = activeTab === 'All' && !search;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .vr-root {
          min-height: 100vh;
          background: radial-gradient(ellipse at top left, #1a0d07 0%, #0d0704 50%, #05030a 100%);
          font-family: 'DM Sans', sans-serif;
          color: #f4d090;
          padding-bottom: 5rem;
        }

        .vr-hero {
          position: relative;
          padding: 4rem 2rem 2.5rem;
          text-align: center;
          overflow: hidden;
        }
        .vr-hero::before {
          content: 'VIRTUAL KRAAL';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 10vw, 9rem);
          font-weight: 700;
          color: #f4d090;
          opacity: 0.025;
          white-space: nowrap;
          pointer-events: none;
          letter-spacing: 0.15em;
        }
        .vr-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(198,122,52,0.1);
          border: 1px solid rgba(198,122,52,0.25);
          border-radius: 50px;
          padding: 0.3rem 1rem;
          font-size: 0.73rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c67a34;
          margin-bottom: 1.25rem;
        }
        .vr-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.4rem, 7vw, 4.5rem);
          font-weight: 700;
          margin: 0 0 0.75rem;
          line-height: 1.05;
          background: linear-gradient(135deg, #f4d090 0%, #c67a34 60%, #f4d090 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .vr-hero p {
          color: rgba(244,208,144,0.5);
          font-size: 1rem;
          font-weight: 300;
          max-width: 500px;
          margin: 0 auto 2rem;
          line-height: 1.7;
        }

        .vr-section-pills {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        .vr-section-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(20,10,6,0.7);
          border: 1px solid rgba(198,122,52,0.2);
          border-radius: 12px;
          padding: 0.6rem 1.1rem;
          color: rgba(244,208,144,0.6);
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .vr-section-pill:hover, .vr-section-pill.active {
          border-color: rgba(198,122,52,0.5);
          color: #f4d090;
          background: rgba(198,122,52,0.1);
        }
        .vr-section-pill.active { border-color: #c67a34; }

        .vr-search-wrap {
          max-width: 440px;
          margin: 0 auto 0;
          position: relative;
        }
        .vr-search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(244,208,144,0.3);
        }
        .vr-search {
          width: 100%;
          background: rgba(20,10,6,0.7);
          border: 1px solid rgba(198,122,52,0.25);
          border-radius: 50px;
          padding: 0.7rem 1rem 0.7rem 2.75rem;
          color: #f4d090;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .vr-search::placeholder { color: rgba(244,208,144,0.25); }
        .vr-search:focus {
          border-color: rgba(198,122,52,0.6);
          box-shadow: 0 0 0 3px rgba(198,122,52,0.08);
        }

        .vr-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          padding: 2.5rem 1rem 0;
          flex-wrap: wrap;
        }
        .vr-stat { text-align: center; }
        .vr-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          font-weight: 700;
          color: #c67a34;
          line-height: 1;
        }
        .vr-stat-label {
          font-size: 0.72rem;
          color: rgba(244,208,144,0.35);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.3rem;
        }

        .vr-featured {
          margin: 2.5rem 1.5rem 0;
          border-radius: 20px;
          overflow: hidden;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          margin-top: 2.5rem;
        }
        .vr-featured-inner {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 2.5rem;
          flex-wrap: wrap;
        }
        .vr-featured-text { flex: 1; min-width: 240px; }
        .vr-featured-eyebrow {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.6);
          margin-bottom: 0.75rem;
          display: block;
        }
        .vr-featured-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.35rem;
          line-height: 1.15;
        }
        .vr-featured-artist {
          color: rgba(255,255,255,0.6);
          font-size: 0.85rem;
          margin: 0 0 0.75rem;
        }
        .vr-featured-desc {
          color: rgba(255,255,255,0.7);
          font-size: 0.88rem;
          line-height: 1.65;
          margin: 0 0 1.5rem;
          max-width: 380px;
        }
        .vr-featured-btn {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 8px;
          padding: 0.7rem 1.5rem;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: background 0.2s;
        }
        .vr-featured-btn:hover { background: rgba(255,255,255,0.25); }
        .vr-featured-art {
          width: 160px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.08);
          border-radius: 16px;
          flex-shrink: 0;
        }
        .vr-featured-art img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; }
        .vr-featured-symbol { font-size: 5rem; }

        .vr-strip { margin-top: 3rem; }
        .vr-strip-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 1.5rem;
          margin-bottom: 1.25rem;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .vr-strip-icon { color: #c67a34; display: flex; }
        .vr-strip-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #f4d090;
          margin: 0;
          flex: 1;
        }
        .vr-strip-count {
          background: rgba(198,122,52,0.15);
          border: 1px solid rgba(198,122,52,0.25);
          border-radius: 50px;
          padding: 0.15rem 0.6rem;
          font-size: 0.75rem;
          color: #c67a34;
        }
        .vr-strip-scroll {
          display: flex;
          gap: 1.25rem;
          overflow-x: auto;
          padding: 0.25rem 1.5rem 1rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
          max-width: 1200px;
          margin: 0 auto;
        }
        .vr-strip-scroll::-webkit-scrollbar { display: none; }

        .vr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 2rem auto 0;
          padding: 0 1.5rem;
        }

        .vr-card {
          background: rgba(16,8,4,0.85);
          border: 1px solid rgba(198,122,52,0.18);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          width: 260px;
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .vr-grid .vr-card { width: auto; }
        .vr-card:hover {
          transform: translateY(-5px);
          border-color: rgba(198,122,52,0.45);
          box-shadow: 0 16px 36px rgba(0,0,0,0.45), 0 0 16px rgba(198,122,52,0.07);
        }
        .vr-card-thumb {
          height: 170px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .vr-thumb-img { width: 100%; height: 100%; object-fit: cover; }
        .vr-thumb-symbol { font-size: 3.5rem; opacity: 0.45; }
        .vr-edition-badge {
          position: absolute;
          top: 0.65rem;
          right: 0.65rem;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
          border-radius: 50px;
          padding: 0.2rem 0.6rem;
          font-size: 0.68rem;
          color: #f4d090;
          letter-spacing: 0.04em;
        }
        .vr-card-type-tag {
          position: absolute;
          bottom: 0.65rem;
          left: 0.65rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          border-radius: 50px;
          padding: 0.2rem 0.6rem;
          font-size: 0.68rem;
          color: #f4d090;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .vr-card-body { padding: 1.1rem; }
        .vr-card-category {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #c67a34;
          display: block;
          margin-bottom: 0.3rem;
        }
        .vr-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #f4d090;
          margin: 0 0 0.2rem;
          line-height: 1.25;
        }
        .vr-card-artist {
          font-size: 0.78rem;
          color: rgba(244,208,144,0.5);
          margin: 0 0 0.5rem;
        }
        .vr-card-desc {
          font-size: 0.8rem;
          color: rgba(244,208,144,0.45);
          line-height: 1.55;
          margin: 0 0 0.9rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .vr-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .vr-card-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-weight: 600;
          color: #c67a34;
        }
        .vr-card-free {
          font-size: 0.75rem;
          color: rgba(244,208,144,0.3);
        }
        .vr-card-cta {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: transparent;
          border: 1px solid rgba(198,122,52,0.35);
          border-radius: 50px;
          padding: 0.28rem 0.8rem;
          color: #c67a34;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.76rem;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .vr-card-cta:hover {
          background: rgba(198,122,52,0.12);
          border-color: #c67a34;
        }

        .vr-empty {
          text-align: center;
          padding: 5rem 2rem;
          color: rgba(244,208,144,0.3);
        }
        .vr-empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .vr-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 40vh;
          gap: 0.6rem;
        }
        .vr-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #c67a34;
          animation: vrPulse 1.2s ease-in-out infinite;
        }
        .vr-dot:nth-child(2) { animation-delay: 0.2s; }
        .vr-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes vrPulse {
          0%,80%,100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }

        .vr-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.82);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: vrFadeIn 0.2s ease;
        }
        @keyframes vrFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .vr-modal {
          background: #0f0804;
          border: 1px solid rgba(198,122,52,0.3);
          border-radius: 20px;
          width: 100%;
          max-width: 460px;
          overflow: hidden;
          position: relative;
          animation: vrSlideUp 0.25s ease;
        }
        @keyframes vrSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .vr-modal-close {
          position: absolute;
          top: 1rem; right: 1rem;
          background: rgba(0,0,0,0.5);
          border: none;
          color: #f4d090;
          width: 32px; height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.85rem;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vr-modal-hero {
          height: 210px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vr-modal-img { width: 100%; height: 100%; object-fit: cover; }
        .vr-modal-symbol { font-size: 5rem; opacity: 0.4; }
        .vr-modal-body { padding: 1.75rem; }
        .vr-modal-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .vr-modal-type-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
        }
        .vr-modal-edition {
          font-size: 0.72rem;
          background: rgba(198,122,52,0.12);
          border: 1px solid rgba(198,122,52,0.25);
          border-radius: 50px;
          padding: 0.15rem 0.6rem;
          color: rgba(244,208,144,0.6);
        }
        .vr-modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #f4d090;
          margin: 0 0 0.35rem;
          line-height: 1.15;
        }
        .vr-modal-artist {
          color: rgba(244,208,144,0.45);
          font-size: 0.83rem;
          margin: 0 0 1rem;
        }
        .vr-modal-desc {
          color: rgba(244,208,144,0.6);
          font-size: 0.88rem;
          line-height: 1.7;
          margin: 0 0 1.25rem;
        }
        .vr-modal-price-row { margin-bottom: 1.25rem; }
        .vr-modal-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #c67a34;
        }
        .vr-modal-action {
          display: block;
          width: 100%;
          border: none;
          border-radius: 10px;
          padding: 0.85rem;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          box-sizing: border-box;
          text-align: center;
        }
        .vr-modal-action:hover { opacity: 0.85; }

        .vr-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 1200px;
          margin: 3rem auto 0;
          padding: 0 1.5rem;
          color: rgba(244,208,144,0.2);
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .vr-divider::before, .vr-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(198,122,52,0.12);
        }
      `}</style>

      <div className="vr-root">
        <div className="vr-hero">
          <div className="vr-eyebrow">🏛 Kwa Khanye</div>
          <h1>The Virtual Kraal</h1>
          <p>Art collections, NFTs, museum exhibitions & the online store — all in one place</p>

          <div className="vr-section-pills">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`vr-section-pill ${activeTab === tab ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab); setSearch(''); }}
              >
                {tab === 'Art Collection' && SECTION_ICONS.art}
                {tab === 'NFTs' && SECTION_ICONS.nft}
                {tab === 'Museum' && SECTION_ICONS.museum}
                {tab === 'Online Store' && SECTION_ICONS.store}
                {tab}
              </button>
            ))}
          </div>

          <div className="vr-search-wrap">
            <span className="vr-search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              className="vr-search"
              placeholder="Search artworks, artists..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="vr-stats">
          {[
            { key: 'art', label: 'Artworks' },
            { key: 'nft', label: 'NFTs' },
            { key: 'museum', label: 'Exhibitions' },
            { key: 'store', label: 'Store Items' },
          ].map(({ key, label }) => (
            <div className="vr-stat" key={key}>
              <div className="vr-stat-num">{items.filter(i => i.type === key).length}</div>
              <div className="vr-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="vr-loading">
            <div className="vr-dot"/><div className="vr-dot"/><div className="vr-dot"/>
          </div>
        ) : showSections ? (
          <>
            <FeaturedBanner item={items[0]} />
            {[
              { type: 'art', title: 'Art Collection' },
              { type: 'nft', title: 'NFTs' },
              { type: 'museum', title: 'Museum & Exhibitions' },
              { type: 'store', title: 'Online Store' },
            ].map(({ type, title }) => byType(type).length > 0 && (
              <div key={type}>
                <div className="vr-divider">{title}</div>
                <SectionStrip
                  title={title}
                  icon={SECTION_ICONS[type]}
                  items={byType(type)}
                  onSelect={setSelected}
                />
              </div>
            ))}
          </>
        ) : filtered.length === 0 ? (
          <div className="vr-empty">
            <div className="vr-empty-icon">🎭</div>
            <p>Nothing found. Try a different search or section.</p>
          </div>
        ) : (
          <div className="vr-grid">
            {filtered.map(item => <VRCard key={item.id} item={item} onClick={setSelected} />)}
          </div>
        )}

        <Modal item={selected} onClose={() => setSelected(null)} />
      </div>
    </>
  );
}

export default HomeVR;