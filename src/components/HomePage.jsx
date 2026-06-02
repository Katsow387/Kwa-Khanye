import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import logoWatermark from '../assets/images/kwa_khanye_logo.png';
import backgroundImage from '../assets/images/Background.png';

const RondavelLogo = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <polygon points="50,8 8,48 92,48" fill="#8B6914" />
    <rect x="7" y="46" width="86" height="5" rx="2" fill="#5C4208" />
    <ellipse cx="50" cy="70" rx="34" ry="24" fill="#D4895A" />
    <polyline
      points="16,48 22,40 28,48 34,40 40,48 46,40 52,48 58,40 64,48 70,40 76,48 82,40 88,48"
      fill="none" stroke="#8B3A0F" strokeWidth="2.5"
    />
    <rect x="42" y="60" width="16" height="22" rx="8" fill="#6B2D0A" />
    <circle cx="50" cy="8" r="5" fill="#e8a84c" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8a84c" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const categories = [
  {
    id: 'music',
    label: 'Listen',
    title: 'Music',
    icon: '🎵',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
    items: ['The story of the album', 'Exclusive releases', 'Live sessions'],
    to: '/music',
  },
  {
    id: 'homevr',
    label: 'Experience',
    title: 'Home VR',
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800&auto=format&fit=crop&q=80',
    imagePosition: 'center 30%',
    items: ['Art collection & NFTs', 'Virtual Museum', 'Online Store'],
    to: '/homevr',
  },
  {
    id: 'bioscope',
    label: 'Watch',
    title: 'Bioscope',
    icon: '🎬',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    items: ['Building the album', 'Biographer', 'Music videos'],
    to: '/bioscope',
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="kk-page">
      {/* Logo Watermark – fixed behind everything */}
      <div
        className="kk-watermark-logo"
        style={{ backgroundImage: `url(${logoWatermark})` }}
      />

      {/* ====== HERO ====== */}
      <section className="kk-hero">
        <div className="kk-hero-bg" style={{ backgroundImage: `url(${backgroundImage})` }} />
        <div className="kk-hero-overlay" />
        <div className="kk-dust" />

        {/* Artificial rondavels and trees have been removed */}

        <nav className="kk-navbar">
          <div className="kk-nav-logo">
            <RondavelLogo size={38} />
            <span className="kk-nav-brand">Kwa Khanye</span>
          </div>

          <ul className={`kk-nav-links ${menuOpen ? 'open' : ''}`}>
            <li><Link to="/music"   onClick={() => setMenuOpen(false)}>Music</Link></li>
            <li><Link to="/homevr"  onClick={() => setMenuOpen(false)}>Home VR</Link></li>
            <li><Link to="/bioscope" onClick={() => setMenuOpen(false)}>Bioscope</Link></li>
           
          </ul>

          <Link to="/login" className="kk-nav-btn">Enter the Kraal</Link>

          <button
            className={`kk-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </nav>

        <div className="kk-hero-content">
          <div className="kk-eyebrow">
            <div className="kk-eyebrow-dot" />
            Home of Culture &mdash; Izindlu Zamasiko
            <div className="kk-eyebrow-dot" />
          </div>

          <h1 className="kk-hero-title">
            Kwa
            <span className="kk-title-accent">Khanye</span>
          </h1>

          <p className="kk-hero-tagline">
            Where the fire never goes cold and the stories live forever
          </p>

          <div className="kk-hero-divider">
            <div className="kk-divider-line" />
            <div className="kk-divider-diamond" />
            <div className="kk-divider-line" />
          </div>

          <div className="kk-cta-group">
            <Link to="/signup" className="kk-btn-primary">Enter the Kraal</Link>
            <Link to="/music"  className="kk-btn-ghost">Discover Our World</Link>
          </div>
        </div>

        <div className="kk-scroll-hint">
          <span>Scroll</span>
          <div className="kk-scroll-arrow" />
        </div>
      </section>

      <div className="kk-geo-border" />

      <section className="kk-categories">
        <div className="kk-watermark">UBUNTU</div>

        <div className="kk-section-label">
          <div className="kk-label-line" />
          <span>Explore the Kraal</span>
          <div className="kk-label-line" />
        </div>

        <h2 className="kk-section-title">Everything Lives Here</h2>
        <p className="kk-section-sub">
          Music, art, stories and more — gathered around one fire
        </p>

        <div className="kk-pots-grid">
          {categories.map((cat) => (
            <Link to={cat.to} key={cat.id} className="kk-pot-card">
              <div
                className="kk-pot-card-img"
                style={{
                  backgroundImage: `url('${cat.image}')`,
                  backgroundPosition: cat.imagePosition || 'center',
                }}
              />
              <div className="kk-pot-card-overlay" />
              <div className="kk-pot-card-arrow"><ArrowIcon /></div>
              <div className="kk-pot-card-content">
                <div className="kk-pot-card-icon">{cat.icon}</div>
                <div className="kk-pot-card-category">{cat.label}</div>
                <div className="kk-pot-card-title">{cat.title}</div>
                <ul className="kk-pot-card-items">
                  {cat.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="kk-texture-band">
        <img
          className="kk-texture-img"
          src="https://images.unsplash.com/photo-1569763430887-71ff5eb42d7b?w=1400&auto=format&fit=crop&q=60"
          alt=""
          aria-hidden="true"
        />
        <div className="kk-texture-overlay">
          <div className="kk-pattern-row">
            {['◆', '◇', '◆', '◇', '◆'].map((sym, i) => (
              <React.Fragment key={i}>
                <div className="kk-pattern-line" />
                <span className="kk-pattern-symbol">{sym}</span>
              </React.Fragment>
            ))}
            <div className="kk-pattern-line" />
          </div>
        </div>
      </div>

      <section className="kk-quote">
        <span className="kk-quote-mark">&ldquo;</span>
        <p className="kk-quote-text">
          Umuntu ngumuntu ngabantu — A person is a person through other persons.
          This is the spirit of Kwa Khanye.
        </p>
        <div className="kk-quote-attr">Ubuntu &mdash; African Philosophy</div>
      </section>

      <footer className="kk-footer">
        <div>
          <div className="kk-footer-brand">Kwa Khanye</div>
          <div className="kk-footer-tagline">Home of Culture</div>
        </div>

        <ul className="kk-footer-links">
          <li><Link to="/music">Music</Link></li>
          <li><Link to="/homevr">Home VR</Link></li>
          <li><Link to="/bioscope">Bioscope</Link></li>
        </ul>

        <div className="kk-footer-copy">&copy; 2026 Kwa Khanye</div>
      </footer>
    </div>
  );
}