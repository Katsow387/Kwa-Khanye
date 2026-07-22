import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

// ── Import all 35 product images ──
import img1 from '../../assets/images/1784710712442.jpg';
import img2 from '../../assets/images/1784710719309.jpg';
import img3 from '../../assets/images/1784710723807.jpg';
import img4 from '../../assets/images/1784710861006.jpg';
import img5 from '../../assets/images/1784710876932.jpg';
import img6 from '../../assets/images/1784710886067.jpg';
import img7 from '../../assets/images/1784710896358.jpg';
import img8 from '../../assets/images/1784710900612.jpg';
import img9 from '../../assets/images/1784710907083.jpg';
import img10 from '../../assets/images/1784710920208.jpg';
import img11 from '../../assets/images/1784710939235.jpg';
import img12 from '../../assets/images/1784710943128.jpg';
import img13 from '../../assets/images/1784710952013.jpg';
import img14 from '../../assets/images/1784710958506.jpg';
import img15 from '../../assets/images/1784710964349.jpg';
import img16 from '../../assets/images/1784710971646.jpg';
import img17 from '../../assets/images/1784710981426.jpg';
import img18 from '../../assets/images/1784710990186.jpg';
import img19 from '../../assets/images/1784710997588.jpg';
import img20 from '../../assets/images/1784711001829.jpg';
import img21 from '../../assets/images/1784711013619.jpg';
import img22 from '../../assets/images/1784711023097.jpg';
import img23 from '../../assets/images/1784711028698.jpg';
import img24 from '../../assets/images/1784711035366.jpg';
import img25 from '../../assets/images/1784711044313.jpg';
import img26 from '../../assets/images/1784711062933.jpg';
import img27 from '../../assets/images/1784711065893.jpg';
import img28 from '../../assets/images/1784711092821.jpg';
import img29 from '../../assets/images/1784711103257.jpg';
import img30 from '../../assets/images/1784711111580.jpg';
import img31 from '../../assets/images/1784711118236.jpg';
import img32 from '../../assets/images/1784711124015.jpg';
import img33 from '../../assets/images/1784711140071.jpg';
import img34 from '../../assets/images/1784711148032.jpg';
import img35 from '../../assets/images/1784711152990.jpg';

// ── Map images to product data ──
// Only these three images are the customisable speaker (with Africa cutout and wooden legs)
const customisableImages = [img9, img19, img33];

const allImages = [
  img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
  img11, img12, img13, img14, img15, img16, img17, img18, img19, img20,
  img21, img22, img23, img24, img25, img26, img27, img28, img29, img30,
  img31, img32, img33, img34, img35
];

// ── Generate finish names for each product ──
const finishNames = [
  'Mahogany', 'Ebony', 'Ivory', 'Walnut', 'Ash', 'Natural',
  'Satin Black', 'Satin White', 'Rosewood', 'Maple', 'Cherry',
  'Oak', 'Teak', 'Bamboo', 'Cedar', 'Pine', 'Spruce', 'Birch',
  'Alder', 'Ash', 'Beech', 'Elm', 'Hickory', 'Mahogany', 'Maple',
  'Oak', 'Pine', 'Poplar', 'Redwood', 'Rosewood', 'Teak',
  'Walnut', 'Wenge', 'Zebrawood', 'Ebony'
];

const allProducts = allImages.map((img, index) => ({
  id: index + 1,
  name: `Ukhamba Sound – ${finishNames[index]}`,
  category: 'Speakers',
  price: 1899 + (index % 5) * 100,
  description: `Handcrafted 3D‑printed Bluetooth speaker${customisableImages.includes(img) ? ' with Africa cutout and wooden tripod legs' : ''} in ${finishNames[index]} finish. Rich, warm sound with a unique design.`,
  image: img,
  stock: true,
  customisable: customisableImages.includes(img),
}));

// ── Styles (unchanged from previous version except new order modal styles) ──
const S = {
  page: {
    minHeight: '100vh',
    background: '#0F0D0B',
    fontFamily: "'Inter', sans-serif",
    color: '#E8DCC4',
  },
  header: {
    padding: '2rem 1.5rem 0',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  headerTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 700,
    color: '#F5EBE0',
    letterSpacing: '0.02em',
    marginBottom: '0.25rem',
  },
  headerSub: {
    color: '#A89274',
    fontSize: '0.95rem',
    fontWeight: 300,
    marginBottom: '1.5rem',
  },

  filterBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    padding: '1rem 1.5rem',
    background: 'rgba(15, 13, 11, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #2A231D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    overflowX: 'auto',
  },
  filterGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'nowrap',
  },
  filterBtn: (active) => ({
    padding: '0.4rem 1.2rem',
    borderRadius: '50px',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    border: '1px solid #3D3228',
    background: active ? '#D4AF37' : 'transparent',
    color: active ? '#0F0D0B' : '#A89274',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  }),
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  ordersBtn: {
    padding: '0.4rem 1.2rem',
    borderRadius: '50px',
    background: 'transparent',
    border: '1px solid #3D3228',
    color: '#A89274',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cartBtn: (count) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 1.2rem',
    borderRadius: '50px',
    background: '#D4AF37',
    color: '#0F0D0B',
    fontWeight: 600,
    fontSize: '0.8rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
    boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)',
  }),
  cartBadge: {
    background: '#0F0D0B',
    color: '#D4AF37',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '0.65rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  grid: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 1.5rem 4rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.5rem',
  },

  card: (hovered) => ({
    background: '#1A1612',
    border: `1px solid ${hovered ? '#D4AF37' : '#2D241E'}`,
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    transform: hovered ? 'translateY(-4px)' : 'none',
    boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(212,175,55,0.05)' : '0 4px 12px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
  }),
  cardImg: {
    width: '100%',
    aspectRatio: '4/3',
    objectFit: 'cover',
    background: '#120F0C',
    transition: 'transform 0.5s ease',
  },
  cardBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '0.2rem 0.7rem',
    borderRadius: '50px',
    backdropFilter: 'blur(8px)',
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#6EE7B7',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  cardBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardCategory: {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#A89274',
    marginBottom: '0.25rem',
  },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#F5EBE0',
    marginBottom: '0.3rem',
    transition: 'color 0.2s',
  },
  cardDesc: {
    fontSize: '0.8rem',
    color: '#A09385',
    lineHeight: 1.5,
    marginBottom: '0.75rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardFooter: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #2A231D',
    paddingTop: '0.75rem',
  },
  price: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#F5EBE0',
  },
  addBtn: {
    padding: '0.4rem 1rem',
    borderRadius: '12px',
    background: '#2A231D',
    border: '1px solid #3D3228',
    color: '#E8DCC4',
    fontSize: '0.7rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Cart Sidebar (same as before)
  cartOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
    zIndex: 500,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  cartSidebar: {
    width: '100%',
    maxWidth: '420px',
    background: '#1A1612',
    boxShadow: '-8px 0 30px rgba(0,0,0,0.8)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #2A231D',
    paddingBottom: '1rem',
    marginBottom: '1rem',
  },
  cartTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#F5EBE0',
  },
  closeCart: {
    background: 'none',
    border: 'none',
    color: '#A89274',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  cartItems: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '0.25rem',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid #2A231D',
  },
  cartItemImg: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: '0.9rem', fontWeight: 500, color: '#F5EBE0' },
  cartItemPrice: { fontSize: '0.8rem', color: '#D4AF37' },
  cartItemQty: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  qtyBtn: {
    background: 'rgba(212, 175, 55, 0.15)',
    border: 'none',
    color: '#E8DCC4',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNum: { fontSize: '0.9rem', color: '#F5EBE0', minWidth: '20px', textAlign: 'center' },
  removeItem: {
    background: 'none',
    border: 'none',
    color: '#DC2626',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  cartTotal: {
    borderTop: '1px solid #2A231D',
    paddingTop: '1rem',
    marginTop: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#F5EBE0',
  },
  checkoutBtn: {
    width: '100%',
    background: '#D4AF37',
    border: 'none',
    borderRadius: '12px',
    padding: '0.9rem',
    color: '#0F0D0B',
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'opacity 0.2s',
  },

  // Customisation Modal (same as before)
  customOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  customModal: {
    background: '#1A1612',
    border: '1px solid #D4AF37',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '560px',
    padding: '2rem',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  closeCustom: {
    position: 'absolute',
    top: '1rem', right: '1rem',
    background: 'none',
    border: 'none',
    color: '#A89274',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  customTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#F5EBE0',
    marginBottom: '0.5rem',
  },
  customSub: { color: '#A89274', fontSize: '0.9rem', marginBottom: '1.5rem' },
  formGroup: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.8rem', color: '#D4AF37', marginBottom: '0.3rem', letterSpacing: '0.05em' },
  input: {
    width: '100%',
    background: '#120F0C',
    border: '1px solid #3D3228',
    borderRadius: '8px',
    padding: '0.7rem 1rem',
    color: '#F5EBE0',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  colorOptions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: '0.3rem',
  },
  colorChip: (color, selected) => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: color,
    border: selected ? '2px solid #D4AF37' : '2px solid #3D3228',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  addToCartCustom: {
    width: '100%',
    background: '#D4AF37',
    border: 'none',
    borderRadius: '12px',
    padding: '0.9rem',
    color: '#0F0D0B',
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },

  // Checkout Modal (same as before)
  checkoutOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  checkoutModal: {
    background: '#1A1612',
    border: '1px solid #D4AF37',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '500px',
    padding: '2rem',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  closeCheckout: {
    position: 'absolute',
    top: '1rem', right: '1rem',
    background: 'none',
    border: 'none',
    color: '#A89274',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  checkoutTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#F5EBE0',
    marginBottom: '0.5rem',
  },
  checkoutSub: { color: '#A89274', fontSize: '0.9rem', marginBottom: '1.5rem' },
  formGroup: { marginBottom: '1.25rem' },
  labelForm: { display: 'block', fontSize: '0.8rem', color: '#D4AF37', marginBottom: '0.3rem', letterSpacing: '0.05em' },
  inputForm: {
    width: '100%',
    background: '#120F0C',
    border: '1px solid #3D3228',
    borderRadius: '8px',
    padding: '0.7rem 1rem',
    color: '#F5EBE0',
    fontSize: '0.9rem',
    outline: 'none',
  },
  payBtn: {
    width: '100%',
    background: '#D4AF37',
    border: 'none',
    borderRadius: '12px',
    padding: '0.9rem',
    color: '#0F0D0B',
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },

  // Order Confirmation (updated to show order number)
  orderConfirmation: {
    textAlign: 'center',
    padding: '2rem 0',
  },
  confirmIcon: { fontSize: '4rem', marginBottom: '1rem' },
  confirmTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: '#F5EBE0', marginBottom: '0.5rem' },
  confirmText: { color: '#A89274', fontSize: '0.95rem', lineHeight: 1.6 },
  confirmOrderNum: { color: '#D4AF37', fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem' },

  // Orders Modal (new)
  ordersOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  ordersModal: {
    background: '#1A1612',
    border: '1px solid #D4AF37',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '700px',
    padding: '2rem',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  closeOrders: {
    position: 'absolute',
    top: '1rem', right: '1rem',
    background: 'none',
    border: 'none',
    color: '#A89274',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  ordersTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#F5EBE0',
    marginBottom: '0.5rem',
  },
  ordersSub: { color: '#A89274', fontSize: '0.9rem', marginBottom: '1.5rem' },
  orderCard: {
    background: '#120F0C',
    border: '1px solid #2A231D',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  orderId: { color: '#D4AF37', fontWeight: 700 },
  orderDate: { color: '#A89274', fontSize: '0.8rem' },
  orderStatus: (status) => ({
    display: 'inline-block',
    padding: '0.2rem 0.8rem',
    borderRadius: '50px',
    fontSize: '0.7rem',
    fontWeight: 600,
    background:
      status === 'Processing' ? 'rgba(234, 179, 8, 0.2)' :
      status === 'Shipped' ? 'rgba(59, 130, 246, 0.2)' :
      status === 'Delivered' ? 'rgba(34, 197, 94, 0.2)' :
      'rgba(107, 114, 128, 0.2)',
    color:
      status === 'Processing' ? '#FBBF24' :
      status === 'Shipped' ? '#60A5FA' :
      status === 'Delivered' ? '#34D399' :
      '#9CA3AF',
    border: `1px solid ${status === 'Processing' ? '#FBBF24' : status === 'Shipped' ? '#60A5FA' : status === 'Delivered' ? '#34D399' : '#6B7280'}`,
  }),
  orderItems: {
    fontSize: '0.8rem',
    color: '#A89274',
    marginTop: '0.3rem',
  },
  orderTotal: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#F5EBE0',
    marginTop: '0.3rem',
  },
  trackBtn: {
    marginTop: '0.5rem',
    padding: '0.3rem 1rem',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px solid #D4AF37',
    color: '#D4AF37',
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.2s',
  },
  // Tracking modal
  trackingOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.9)',
    backdropFilter: 'blur(12px)',
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  trackingModal: {
    background: '#1A1612',
    border: '1px solid #D4AF37',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '500px',
    padding: '2rem',
    position: 'relative',
  },
  closeTracking: {
    position: 'absolute',
    top: '1rem', right: '1rem',
    background: 'none',
    border: 'none',
    color: '#A89274',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  trackingTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#F5EBE0',
    marginBottom: '1.5rem',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  timelineItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem',
    borderBottom: '1px solid #2A231D',
    opacity: active ? 1 : 0.4,
  }),
  timelineDot: (active) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: active ? '#D4AF37' : '#3D3228',
    flexShrink: 0,
  }),
  timelineLabel: { color: '#F5EBE0', fontSize: '0.9rem' },
  timelineDate: { color: '#A89274', fontSize: '0.7rem', marginLeft: 'auto' },
};

// ── Categories ──
const CATEGORIES = ['All', 'Speakers'];

export default function OnlineStore() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customOptions, setCustomOptions] = useState({ engraving: '', colour: 'Mahogany' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState('');
  const [hovered, setHovered] = useState(null);

  // Order tracking states
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);

  // Shipping form
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', postal: '', country: 'South Africa' });
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvc: '' });

  // Load orders from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ukhamma_orders');
    if (stored) {
      try { setOrders(JSON.parse(stored)); } catch(e) {}
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ukhamma_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login', { replace: true });
    };
    checkAuth();
  }, [navigate]);

  const filtered = filter === 'All' ? allProducts : allProducts.filter(p => p.category === filter);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const addCustomToCart = () => {
    if (!selectedProduct) return;
    const customised = {
      ...selectedProduct,
      name: selectedProduct.name + (customOptions.engraving ? ` (Engraved: "${customOptions.engraving}")` : ''),
      engraving: customOptions.engraving,
      colour: customOptions.colour,
    };
    addToCart(customised);
    setShowCustom(false);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = item.qty + delta;
      if (newQty <= 0) return null;
      return { ...item, qty: newQty };
    }).filter(Boolean));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const openCustom = (product) => {
    setSelectedProduct(product);
    const colourMatch = product.name.match(/– (.+)$/);
    setCustomOptions({ engraving: '', colour: colourMatch ? colourMatch[1] : 'Mahogany' });
    setShowCustom(true);
  };

  // Place order (called from checkout)
  const placeOrder = (e) => {
    e.preventDefault();
    // Generate order number
    const orderNum = 'UKH' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
    const newOrder = {
      id: orderNum,
      date: new Date().toISOString(),
      items: cart.map(item => ({ ...item })),
      total: totalPrice,
      status: 'Processing',
      shipping: { ...shipping },
      updatedAt: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setLastOrderNumber(orderNum);
    setOrderPlaced(true);
    // Reset form after a delay
    setTimeout(() => {
      setShowCheckout(false);
      setOrderPlaced(false);
      setShipping({ name: '', address: '', city: '', postal: '', country: 'South Africa' });
      setPayment({ cardNumber: '', expiry: '', cvc: '' });
    }, 3000);
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
    setOrderPlaced(false);
  };

  // Simulate order status update (for demo)
  const simulateStatusUpdate = (orderId) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      let newStatus = order.status;
      if (order.status === 'Processing') newStatus = 'Shipped';
      else if (order.status === 'Shipped') newStatus = 'Delivered';
      else return order;
      return { ...order, status: newStatus, updatedAt: new Date().toISOString() };
    }));
    // If we're tracking this order, update the tracking view
    if (trackingOrder && trackingOrder.id === orderId) {
      const updated = orders.find(o => o.id === orderId);
      if (updated) setTrackingOrder(updated);
    }
  };

  const openTracking = (order) => {
    setTrackingOrder(order);
    setShowTracking(true);
  };

  const colourPalette = ['#5C3A1A', '#1A1A1A', '#F5E6D3', '#6B4226', '#B8A28C', '#D4A373'];

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={S.header}>
        <h1 style={S.headerTitle}>Ukhamba Home Sound</h1>
        <p style={S.headerSub}>Handcrafted 3D‑printed Bluetooth speakers – each one a unique piece of art.</p>
      </div>

      {/* ── Filter Bar ── */}
      <div style={S.filterBar}>
        <div style={S.filterGroup}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              style={S.filterBtn(filter === cat)}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={S.actionButtons}>
          <button style={S.ordersBtn} onClick={() => setShowOrders(true)}>
            📦 Orders
          </button>
          <button style={S.cartBtn(totalItems)} onClick={() => setShowCart(true)}>
            <span>Cart</span>
            {totalItems > 0 && <span style={S.cartBadge}>{totalItems}</span>}
          </button>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div style={S.grid}>
        {filtered.map(product => {
          const isCustomisable = product.customisable;
          return (
            <div
              key={product.id}
              style={S.card(hovered === product.id)}
              onMouseEnter={() => setHovered(product.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    ...S.cardImg,
                    transform: hovered === product.id ? 'scale(1.05)' : 'scale(1)',
                  }}
                />
                <span style={S.cardBadge}>In Stock</span>
              </div>
              <div style={S.cardBody}>
                <span style={S.cardCategory}>Speakers</span>
                <h3 style={{
                  ...S.cardTitle,
                  color: hovered === product.id ? '#D4AF37' : '#F5EBE0',
                }}>{product.name}</h3>
                <p style={S.cardDesc}>{product.description}</p>
                <div style={S.cardFooter}>
                  <span style={S.price}>R {product.price.toFixed(2)}</span>
                  {isCustomisable ? (
                    <button
                      style={S.addBtn}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#D4AF37';
                        e.currentTarget.style.color = '#0F0D0B';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2A231D';
                        e.currentTarget.style.color = '#E8DCC4';
                      }}
                      onClick={() => openCustom(product)}
                    >
                      Customise & Add
                    </button>
                  ) : (
                    <button
                      style={S.addBtn}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#D4AF37';
                        e.currentTarget.style.color = '#0F0D0B';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2A231D';
                        e.currentTarget.style.color = '#E8DCC4';
                      }}
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Cart Sidebar ── (unchanged) ── */}
      {showCart && (
        <div style={S.cartOverlay} onClick={() => setShowCart(false)}>
          <div style={S.cartSidebar} onClick={e => e.stopPropagation()}>
            <div style={S.cartHeader}>
              <span style={S.cartTitle}>Your Cart</span>
              <button style={S.closeCart} onClick={() => setShowCart(false)}>✕</button>
            </div>
            <div style={S.cartItems}>
              {cart.length === 0 ? (
                <p style={{ color: '#A89274', textAlign: 'center', padding: '2rem 0' }}>Your cart is empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={S.cartItem}>
                    <img src={item.image} alt={item.name} style={S.cartItemImg} />
                    <div style={S.cartItemInfo}>
                      <div style={S.cartItemName}>{item.name}</div>
                      <div style={S.cartItemPrice}>R {item.price.toFixed(2)}</div>
                      {item.engraving && <div style={{ fontSize: '0.7rem', color: '#A89274' }}>Engraving: "{item.engraving}"</div>}
                    </div>
                    <div style={S.cartItemQty}>
                      <button style={S.qtyBtn} onClick={() => updateQty(item.id, -1)}>−</button>
                      <span style={S.qtyNum}>{item.qty}</span>
                      <button style={S.qtyBtn} onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <button style={S.removeItem} onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <>
                <div style={S.cartTotal}>
                  <span>Total</span>
                  <span>R {totalPrice.toFixed(2)}</span>
                </div>
                <button style={S.checkoutBtn} onClick={handleCheckout}>Proceed to Checkout</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Customisation Modal ── (unchanged) ── */}
      {showCustom && selectedProduct && (
        <div style={S.customOverlay} onClick={() => setShowCustom(false)}>
          <div style={S.customModal} onClick={e => e.stopPropagation()}>
            <button style={S.closeCustom} onClick={() => setShowCustom(false)}>✕</button>
            <h2 style={S.customTitle}>Customise Your Speaker</h2>
            <p style={S.customSub}>Choose a colour and add personal engraving.</p>
            <div style={S.formGroup}>
              <label style={S.label}>Colour</label>
              <div style={S.colorOptions}>
                {['Mahogany', 'Ebony', 'Ivory', 'Walnut', 'Ash', 'Natural'].map((col, idx) => (
                  <div
                    key={col}
                    style={{
                      ...S.colorChip(colourPalette[idx], customOptions.colour === col),
                    }}
                    onClick={() => setCustomOptions({ ...customOptions, colour: col })}
                    title={col}
                  />
                ))}
              </div>
              <div style={{ color: '#A89274', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                Selected: {customOptions.colour}
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Engraving Text (optional)</label>
              <input
                style={S.input}
                type="text"
                placeholder="e.g., 'Ubuntu' or your name"
                value={customOptions.engraving}
                onChange={e => setCustomOptions({ ...customOptions, engraving: e.target.value })}
                maxLength={20}
              />
              <span style={{ fontSize: '0.7rem', color: '#A89274' }}>Max 20 characters</span>
            </div>
            <button style={S.addToCartCustom} onClick={addCustomToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* ── Checkout Modal ── (updated to use placeOrder) ── */}
      {showCheckout && (
        <div style={S.checkoutOverlay} onClick={() => { if (!orderPlaced) setShowCheckout(false); }}>
          <div style={S.checkoutModal} onClick={e => e.stopPropagation()}>
            <button style={S.closeCheckout} onClick={() => { if (!orderPlaced) setShowCheckout(false); }}>✕</button>

            {orderPlaced ? (
              <div style={S.orderConfirmation}>
                <div style={S.confirmIcon}>✅</div>
                <h2 style={S.confirmTitle}>Order Placed!</h2>
                <p style={S.confirmText}>
                  Thank you for your purchase. Your Ukhamba products will be crafted and shipped soon.
                </p>
                <div style={S.confirmOrderNum}>Order #{lastOrderNumber}</div>
                <p style={{ color: '#A89274', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  You can track your order in the "Orders" section.
                </p>
              </div>
            ) : (
              <>
                <h2 style={S.checkoutTitle}>Checkout</h2>
                <p style={S.checkoutSub}>Enter your shipping details.</p>
                <form onSubmit={placeOrder}>
                  <div style={S.formGroup}>
                    <label style={S.labelForm}>Full Name</label>
                    <input style={S.inputForm} type="text" value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} required />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.labelForm}>Address</label>
                    <input style={S.inputForm} type="text" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={S.formGroup}>
                      <label style={S.labelForm}>City</label>
                      <input style={S.inputForm} type="text" value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} required />
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.labelForm}>Postal Code</label>
                      <input style={S.inputForm} type="text" value={shipping.postal} onChange={e => setShipping({ ...shipping, postal: e.target.value })} required />
                    </div>
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.labelForm}>Country</label>
                    <input style={S.inputForm} type="text" value={shipping.country} onChange={e => setShipping({ ...shipping, country: e.target.value })} required />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.labelForm}>Card Number</label>
                    <input style={S.inputForm} type="text" placeholder="4242 4242 4242 4242" value={payment.cardNumber} onChange={e => setPayment({ ...payment, cardNumber: e.target.value })} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={S.formGroup}>
                      <label style={S.labelForm}>Expiry</label>
                      <input style={S.inputForm} type="text" placeholder="MM/YY" value={payment.expiry} onChange={e => setPayment({ ...payment, expiry: e.target.value })} required />
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.labelForm}>CVC</label>
                      <input style={S.inputForm} type="text" placeholder="123" value={payment.cvc} onChange={e => setPayment({ ...payment, cvc: e.target.value })} required />
                    </div>
                  </div>
                  <button type="submit" style={S.payBtn}>Pay R {totalPrice.toFixed(2)}</button>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(244,208,144,0.3)', textAlign: 'center', marginTop: '0.5rem' }}>
                    🔒 Test payment – no real charges will be made.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Orders Modal ── */}
      {showOrders && (
        <div style={S.ordersOverlay} onClick={() => setShowOrders(false)}>
          <div style={S.ordersModal} onClick={e => e.stopPropagation()}>
            <button style={S.closeOrders} onClick={() => setShowOrders(false)}>✕</button>
            <h2 style={S.ordersTitle}>Your Orders</h2>
            <p style={S.ordersSub}>Track your recent purchases.</p>
            {orders.length === 0 ? (
              <p style={{ color: '#A89274', textAlign: 'center', padding: '2rem 0' }}>No orders yet.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} style={S.orderCard}>
                  <div style={S.orderHeader}>
                    <span style={S.orderId}>Order #{order.id}</span>
                    <span style={S.orderDate}>{new Date(order.date).toLocaleDateString()}</span>
                    <span style={S.orderStatus(order.status)}>{order.status}</span>
                  </div>
                  <div style={S.orderItems}>
                    {order.items.map(item => `${item.name} (x${item.qty})`).join(', ')}
                  </div>
                  <div style={S.orderTotal}>Total: R {order.total.toFixed(2)}</div>
                  <button style={S.trackBtn} onClick={() => openTracking(order)}>Track Order</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Tracking Modal ── */}
      {showTracking && trackingOrder && (
        <div style={S.trackingOverlay} onClick={() => setShowTracking(false)}>
          <div style={S.trackingModal} onClick={e => e.stopPropagation()}>
            <button style={S.closeTracking} onClick={() => setShowTracking(false)}>✕</button>
            <h2 style={S.trackingTitle}>Tracking – {trackingOrder.id}</h2>
            <div style={S.timeline}>
              {['Processing', 'Shipped', 'Delivered'].map((status, idx) => {
                const isActive = idx <= ['Processing', 'Shipped', 'Delivered'].indexOf(trackingOrder.status);
                return (
                  <div key={status} style={S.timelineItem(isActive)}>
                    <div style={S.timelineDot(isActive)} />
                    <span style={S.timelineLabel}>{status}</span>
                    {isActive && status === trackingOrder.status && (
                      <span style={S.timelineDate}>Current</span>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              style={{ ...S.trackBtn, marginTop: '1.5rem', width: '100%', background: '#D4AF37', color: '#0F0D0B' }}
              onClick={() => simulateStatusUpdate(trackingOrder.id)}
            >
              Simulate Next Status (Demo)
            </button>
            <p style={{ fontSize: '0.7rem', color: '#A89274', marginTop: '0.5rem', textAlign: 'center' }}>
              Click to advance order status for demonstration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}