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
    fontSize: '1.8rem', fontWeight: 700,
    color: '#c67a34', lineHeight: 1, display: 'block',
  },
  statLabel: {
    fontSize: '0.68rem', color: 'rgba(244,208,144,0.6)',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    marginTop: '0.2rem', display: 'block',
  },

  /* ── BODY ── */
  body: { maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' },

  /* cart badge */
  cartBar: {
    display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
    gap: '0.75rem', marginBottom: '2rem',
  },
  cartBtn: (count) => ({
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: count > 0 ? 'linear-gradient(135deg, #8B6914, #c67a34)' : 'rgba(20,10,6,0.7)',
    border: '1px solid rgba(198,122,52,0.4)',
    borderRadius: '50px', padding: '0.5rem 1.25rem',
    color: count > 0 ? '#fff' : 'rgba(244,208,144,0.8)',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem',
    cursor: 'pointer', transition: 'all 0.2s',
  }),

  filterRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' },
  filterBtn: (active) => ({
    background: active ? 'linear-gradient(135deg, #8B6914, #c67a34)' : 'rgba(20,10,6,0.7)',
    border: `1px solid ${active ? 'transparent' : 'rgba(198,122,52,0.3)'}`,
    borderRadius: '50px', padding: '0.45rem 1.1rem',
    color: active ? '#fff' : 'rgba(244,208,144,0.8)',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem',
    cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(4px)',
  }),

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.5rem' },

  card: (hovered) => ({
    background: 'rgba(16,8,4,0.9)',
    border: `1px solid ${hovered ? 'rgba(198,122,52,0.7)' : 'rgba(198,122,52,0.25)'}`,
    borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
    transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
    transform: hovered ? 'translateY(-6px)' : 'none',
    boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(198,122,52,0.15)' : '0 4px 12px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
  }),
  cardThumb: (bg) => ({
    height: '200px', background: bg || '#1a0d06',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', fontSize: '4rem',
  }),
  badge: {
    position: 'absolute', top: '0.65rem', right: '0.65rem',
    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
    borderRadius: '50px', padding: '0.2rem 0.65rem',
    fontSize: '0.68rem', color: '#f4d090', letterSpacing: '0.04em',
    border: '1px solid rgba(198,122,52,0.3)',
  },
  inStockDot: (inStock) => ({
    position: 'absolute', bottom: '0.65rem', left: '0.65rem',
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
    borderRadius: '50px', padding: '0.2rem 0.65rem',
    fontSize: '0.68rem', color: inStock ? '#6dbf8a' : '#e05252',
    border: `1px solid ${inStock ? 'rgba(109,191,138,0.3)' : 'rgba(224,82,82,0.3)'}`,
  }),
  cardBody: { padding: '1.25rem' },
  cardCategory: { fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c67a34', display: 'block', marginBottom: '0.3rem' },
  cardTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 700, color: '#f4d090', margin: '0 0 0.2rem', lineHeight: 1.2 },
  cardDesc: { fontSize: '0.8rem', color: 'rgba(244,208,144,0.6)', lineHeight: 1.55, margin: '0 0 0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' },
  price: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 700, color: '#c67a34' },
  addBtn: (added) => ({
    background: added ? 'linear-gradient(135deg, #8B6914, #c67a34)' : 'rgba(0,0,0,0.5)',
    border: `1px solid ${added ? 'transparent' : 'rgba(198,122,52,0.45)'}`,
    borderRadius: '50px', padding: '0.3rem 0.9rem',
    color: added ? '#fff' : '#c67a34',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.76rem',
    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
  }),

  /* modal */
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
    backdropFilter: 'blur(14px)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  },
  modal: {
    background: '#0f0804', border: '1px solid rgba(198,122,52,0.5)',
    borderRadius: '20px', width: '100%', maxWidth: '480px',
    overflow: 'hidden', position: 'relative',
  },
  modalHero: { height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' },
  modalBody: { padding: '1.75rem' },
  modalTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9rem', fontWeight: 700, color: '#f4d090', margin: '0 0 0.3rem', lineHeight: 1.15 },
  modalDesc: { color: 'rgba(244,208,144,0.65)', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 1.25rem' },
  modalPrice: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 700, color: '#c67a34', display: 'block', marginBottom: '1.25rem' },
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

const PRODUCTS = [
  { id:1, title:'Ubuntu T-Shirt', category:'Apparel', price:'R 450', emoji:'👕', bg:'linear-gradient(135deg,#0a1a2a,#153050)', inStock:true,  badge:'Bestseller', desc:'Premium heavyweight cotton tee with Ubuntu philosophy print. Available in S–XXL.' },
  { id:2, title:'Kraal Hoodie',   category:'Apparel', price:'R 850', emoji:'🧥', bg:'linear-gradient(135deg,#1a0a05,#2a1508)', inStock:true,  badge:'New',        desc:'Warm fleece-lined hoodie embroidered with the Kwa Khanye kraal symbol.' },
  { id:3, title:'Beadwork Cap',   category:'Accessories', price:'R 280', emoji:'🧢', bg:'linear-gradient(135deg,#0a0a1a,#15152a)', inStock:true,  badge:'',           desc:'Structured cap with traditional Zulu beadwork pattern stitching.' },
  { id:4, title:'Culture Tote',   category:'Accessories', price:'R 220', emoji:'👜', bg:'linear-gradient(135deg,#1a1a0a,#2a2a15)', inStock:false, badge:'',           desc:'Heavy-duty canvas tote printed with African proverbs.' },
  { id:5, title:'Khanye Mug',     category:'Lifestyle',   price:'R 180', emoji:'☕', bg:'linear-gradient(135deg,#1a0a1a,#2a1525)', inStock:true,  badge:'',           desc:'Double-walled ceramic mug with the Kwa Khanye fire emblem.' },
  { id:6, title:'Art Print — Ancestors', category:'Art', price:'R 650', emoji:'🎨', bg:'linear-gradient(135deg,#0a1a0a,#153015)', inStock:true,  badge:'Limited',    desc:'A3 fine-art print on acid-free paper. Signed and numbered edition of 50.' },
];

const FILTERS = ['All', 'Apparel', 'Accessories', 'Lifestyle', 'Art'];

export default function OnlineStore() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login', { replace: true });
    };
    checkAuth();
  }, [navigate]);

  const filtered = filter === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  const addToCart = (e, id) => { e.stopPropagation(); setCart(c => c.includes(id) ? c : [...c, id]); };

  return (
    <div style={S.page}>

      {/* ══ HEADER — separated from content ══ */}
      <header style={S.header}>
        <div style={S.headerGlow} />
        <div style={S.headerWatermark}>ONLINE STORE</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={S.eyebrow}>🛍️ &nbsp; Online Store</span>
          <h1 style={S.h1}>The Kraal Market</h1>
          <p style={S.subtitle}>
            Wear the culture, carry the spirit — authentic Kwa Khanye
            merchandise crafted with pride.
          </p>
          <div style={S.statsRow}>
            {[['32', 'Products'], ['Free', 'Shipping R1000+'], ['ZAR', 'Currency'], ['7d', 'Returns']].map(([n, l]) => (
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

        {/* Cart + filters row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <button style={S.cartBtn(cart.length)}>
            🛒 &nbsp; Cart &nbsp;
            {cart.length > 0 && (
              <span style={{ background: '#fff', color: '#c67a34', borderRadius: '50px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>{cart.length}</span>
            )}
          </button>
        </div>

        {/* Product Grid */}
        <div style={S.grid}>
          {filtered.map(p => (
            <div
              key={p.id}
              style={S.card(hovered === p.id)}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(p)}
            >
              <div style={S.cardThumb(p.bg)}>
                <span>{p.emoji}</span>
                {p.badge && <span style={S.badge}>{p.badge}</span>}
                <span style={S.inStockDot(p.inStock)}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.inStock ? '#6dbf8a' : '#e05252', display: 'inline-block' }} />
                  {p.inStock ? 'In Stock' : 'Sold Out'}
                </span>
              </div>
              <div style={S.cardBody}>
                <span style={S.cardCategory}>{p.category}</span>
                <h3 style={S.cardTitle}>{p.title}</h3>
                <p style={S.cardDesc}>{p.desc}</p>
                <div style={S.cardFooter}>
                  <span style={S.price}>{p.price}</span>
                  <button
                    style={S.addBtn(cart.includes(p.id))}
                    onClick={e => addToCart(e, p.id)}
                    disabled={!p.inStock}
                  >
                    {cart.includes(p.id) ? '✓ Added' : p.inStock ? 'Add to Cart' : 'Sold Out'}
                  </button>
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
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c67a34' }}>{selected.category}</span>
              <h2 style={S.modalTitle}>{selected.title}</h2>
              <p style={S.modalDesc}>{selected.desc}</p>
              <span style={S.modalPrice}>{selected.price}</span>
              <button
                style={{ ...S.modalAction, opacity: selected.inStock ? 1 : 0.5, cursor: selected.inStock ? 'pointer' : 'not-allowed' }}
                onClick={() => { if (selected.inStock) { setCart(c => c.includes(selected.id) ? c : [...c, selected.id]); setSelected(null); }}}
              >
                {selected.inStock ? '🛒  Add to Cart' : 'Currently Sold Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
