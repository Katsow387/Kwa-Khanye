import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

const S = {
  page: {
    minHeight: '100vh',
    background: '#0a0603',
    fontFamily: "'DM Sans', sans-serif",
    color: '#f4d090',
  },

  /* ── HEADER ── */
  header: {
    background: 'linear-gradient(135deg, #0f0804 0%, #1a0d06 50%, #0f0804 100%)',
    borderBottom: '1px solid rgba(198,122,52,0.3)',
    padding: '3rem 2rem 2.5rem',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '60vw', height: '200px',
    background: 'radial-gradient(ellipse, rgba(198,122,52,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  headerWatermark: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(4rem,12vw,10rem)',
    fontWeight: 700,
    color: '#f4d090',
    opacity: 0.04,
    whiteSpace: 'nowrap',
    letterSpacing: '0.15em',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(198,122,52,0.12)',
    border: '1px solid rgba(198,122,52,0.35)',
    borderRadius: '50px',
    padding: '0.3rem 1.1rem',
    fontSize: '0.72rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#c67a34',
    marginBottom: '1.25rem',
    position: 'relative',
    zIndex: 1,
  },
  h1: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(3rem, 8vw, 6rem)',
    fontWeight: 700,
    margin: '0 0 0.5rem',
    lineHeight: 1,
    background: 'linear-gradient(135deg, #f4d090 0%, #c67a34 50%, #f4d090 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    position: 'relative',
    zIndex: 1,
  },
  subtitle: {
    color: 'rgba(244,208,144,0.6)',
    fontSize: '1rem',
    fontWeight: 300,
    maxWidth: '480px',
    margin: '0 auto 2rem',
    lineHeight: 1.7,
    fontStyle: 'italic',
    position: 'relative',
    zIndex: 1,
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 1,
  },
  statBox: {
    textAlign: 'center',
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(198,122,52,0.2)',
    borderRadius: '12px',
    padding: '0.6rem 1.25rem',
  },
  statNum: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#c67a34',
    lineHeight: 1,
    display: 'block',
  },
  statLabel: {
    fontSize: '0.68rem',
    color: 'rgba(244,208,144,0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: '0.2rem',
    display: 'block',
  },

  /* ── CONTENT AREA ── */
  body: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem 5rem',
  },

  filterRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '2rem',
    alignItems: 'center',
  },
  filterBtn: (active) => ({
    background: active ? 'linear-gradient(135deg, #8B6914, #c67a34)' : 'rgba(20,10,6,0.7)',
    border: `1px solid ${active ? 'transparent' : 'rgba(198,122,52,0.3)'}`,
    borderRadius: '50px',
    padding: '0.45rem 1.1rem',
    color: active ? '#fff' : 'rgba(244,208,144,0.8)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backdropFilter: 'blur(4px)',
    letterSpacing: '0.03em',
  }),

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },

  card: (hovered) => ({
    background: 'rgba(16,8,4,0.9)',
    border: `1px solid ${hovered ? 'rgba(198,122,52,0.7)' : 'rgba(198,122,52,0.25)'}`,
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
    transform: hovered ? 'translateY(-6px)' : 'none',
    boxShadow: hovered
      ? '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(198,122,52,0.15)'
      : '0 4px 12px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
  }),

  cardThumb: (bg) => ({
    height: '200px',
    background: bg || 'linear-gradient(135deg, #1a0d06, #2a1508)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontSize: '4rem',
  }),
  badge: {
    position: 'absolute',
    top: '0.65rem', right: '0.65rem',
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(6px)',
    borderRadius: '50px',
    padding: '0.2rem 0.65rem',
    fontSize: '0.68rem',
    color: '#f4d090',
    letterSpacing: '0.04em',
    border: '1px solid rgba(198,122,52,0.3)',
  },
  cardBody: { padding: '1.25rem' },
  cardCategory: {
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#c67a34',
    display: 'block',
    marginBottom: '0.3rem',
  },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#f4d090',
    margin: '0 0 0.2rem',
    lineHeight: 1.2,
  },
  cardArtist: {
    fontSize: '0.78rem',
    color: 'rgba(244,208,144,0.6)',
    margin: '0 0 0.75rem',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#c67a34',
  },
  ctaBtn: {
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(198,122,52,0.45)',
    borderRadius: '50px',
    padding: '0.3rem 0.9rem',
    color: '#c67a34',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.76rem',
    cursor: 'pointer',
  },

  /* modal */
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.88)',
    backdropFilter: 'blur(14px)',
    zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  modal: {
    background: '#0f0804',
    border: '1px solid rgba(198,122,52,0.5)',
    borderRadius: '20px',
    width: '100%', maxWidth: '480px',
    overflow: 'hidden',
    position: 'relative',
  },
  modalHero: {
    height: '220px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '6rem',
  },
  modalBody: { padding: '1.75rem' },
  modalTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.9rem', fontWeight: 700,
    color: '#f4d090', margin: '0 0 0.3rem', lineHeight: 1.15,
  },
  modalArtist: { color: 'rgba(244,208,144,0.5)', fontSize: '0.85rem', margin: '0 0 0.75rem' },
  modalDesc: { color: 'rgba(244,208,144,0.65)', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 1.25rem' },
  modalPrice: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.6rem', fontWeight: 700, color: '#c67a34', display: 'block', marginBottom: '1.25rem',
  },
  modalAction: {
    display: 'block', width: '100%', border: 'none', borderRadius: '10px',
    padding: '0.9rem', background: 'linear-gradient(135deg, #8B6914, #c67a34)',
    color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem',
    fontWeight: 600, cursor: 'pointer', boxSizing: 'border-box',
  },
  closeBtn: {
    position: 'absolute', top: '1rem', right: '1rem',
    background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f4d090',
    width: '32px', height: '32px', borderRadius: '50%',
    cursor: 'pointer', fontSize: '1rem', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
};

const NFTS = [
  { id:1, title:'Ubuntu Spirit', artist:'Kwa Khanye Studio', category:'Digital Art', price:'0.45 ETH', edition:'1 of 10', emoji:'🌍', bg:'linear-gradient(135deg,#1a2a0a,#2d4a15)', desc:'A celebration of African communal spirit rendered in vivid digital brushwork.' },
  { id:2, title:'The Kraal at Dawn', artist:'Nomvula Art', category:'Photography', price:'0.28 ETH', edition:'1 of 25', emoji:'🌅', bg:'linear-gradient(135deg,#2a1505,#4a2510)', desc:'Golden hour over a traditional Zulu homestead — captured and tokenised.' },
  { id:3, title:'Ancestors\' Flame', artist:'Kwa Khanye Studio', category:'Animation', price:'1.2 ETH', edition:'1 of 3', emoji:'🔥', bg:'linear-gradient(135deg,#2a0a05,#4a1808)', desc:'A living flame animation honouring those who came before us.' },
  { id:4, title:'Beadwork Genesis', artist:'iSiqalo Collective', category:'Generative', price:'0.15 ETH', edition:'Open', emoji:'📿', bg:'linear-gradient(135deg,#0a1a2a,#153050)', desc:'Algorithmically generated Zulu beadwork patterns, each one unique.' },
  { id:5, title:'Ndlovu Rising', artist:'Thabo M.', category:'3D Art', price:'0.65 ETH', edition:'1 of 5', emoji:'🐘', bg:'linear-gradient(135deg,#1a1a0a,#2a2a15)', desc:'A majestic 3D sculpt of the elephant — symbol of wisdom and power.' },
  { id:6, title:'Isangoma Vision', artist:'Kwa Khanye Studio', category:'Digital Art', price:'0.9 ETH', edition:'1 of 7', emoji:'👁️', bg:'linear-gradient(135deg,#1a0a2a,#2a1545)', desc:'The third eye of the healer — mystical and mesmerising digital art.' },
];

const FILTERS = ['All', 'Digital Art', 'Photography', 'Animation', 'Generative', '3D Art'];

export default function NFTs() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login', { replace: true });
    };
    checkAuth();
  }, [navigate]);

  const filtered = filter === 'All' ? NFTS : NFTS.filter(n => n.category === filter);

  return (
    <div style={S.page}>

      {/* ══ HEADER — separated from content ══ */}
      <header style={S.header}>
        <div style={S.headerGlow} />
        <div style={S.headerWatermark}>NFT GALLERY</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={S.eyebrow}>🖼️ &nbsp; NFT Gallery</span>
          <h1 style={S.h1}>The Digital Kraal</h1>
          <p style={S.subtitle}>
            Authentic African digital art, tokenised on the blockchain —
            own a piece of the culture forever.
          </p>
          <div style={S.statsRow}>
            {[['24', 'Works'], ['12', 'Artists'], ['3', 'Drops'], ['ETH', 'Currency']].map(([n, l]) => (
              <div key={l} style={S.statBox}>
                <span style={S.statNum}>{n}</span>
                <span style={S.statLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ══ CONTENT — below the header ══ */}
      <div style={S.body}>

        {/* Filter pills */}
        <div style={S.filterRow}>
          {FILTERS.map(f => (
            <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {/* NFT Grid */}
        <div style={S.grid}>
          {filtered.map(nft => (
            <div
              key={nft.id}
              style={S.card(hovered === nft.id)}
              onMouseEnter={() => setHovered(nft.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(nft)}
            >
              <div style={S.cardThumb(nft.bg)}>
                <span>{nft.emoji}</span>
                <span style={S.badge}>{nft.edition}</span>
              </div>
              <div style={S.cardBody}>
                <span style={S.cardCategory}>{nft.category}</span>
                <h3 style={S.cardTitle}>{nft.title}</h3>
                <p style={S.cardArtist}>{nft.artist}</p>
                <div style={S.cardFooter}>
                  <span style={S.price}>{nft.price}</span>
                  <button style={S.ctaBtn}>View NFT</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ MODAL ══ */}
      {selected && (
        <div style={S.overlay} onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <button style={S.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <div style={{ ...S.modalHero, background: selected.bg }}>{selected.emoji}</div>
            <div style={S.modalBody}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c67a34' }}>{selected.category} &nbsp;·&nbsp; {selected.edition}</span>
              <h2 style={S.modalTitle}>{selected.title}</h2>
              <p style={S.modalArtist}>by {selected.artist}</p>
              <p style={S.modalDesc}>{selected.desc}</p>
              <span style={S.modalPrice}>{selected.price}</span>
              <button style={S.modalAction}>Mint / Purchase NFT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
