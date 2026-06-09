import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import backgroundImage from '../assets/images/Background.png';
import potMusicImg from '../assets/images/pot_music.png';
import potHomeVrImg from '../assets/images/pot_homevr.png';
import potBioscopeImg from '../assets/images/pot_bioscope.png';

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

export default function HomePage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  const handleHomeVrClick = (e) => {
    e.preventDefault();
    if (doorOpen) return;
    setDoorOpen(true);
    setTimeout(() => {
      navigate('/homevr');
    }, 600);
  };

  return (
    <div className="homepage-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* Dark overlay */}
      <div className="homepage-overlay"></div>

      {/* ====== NAVBAR ====== */}
      <nav className="kk-navbar">
        <div className="kk-nav-logo">
          <RondavelLogo size={38} />
          <span className="kk-nav-brand">Kwa Khanye</span>
        </div>

        <ul className={`kk-nav-links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/music" onClick={() => setMenuOpen(false)}>Music</Link></li>
          <li><Link to="/homevr" onClick={() => setMenuOpen(false)}>Home VR</Link></li>
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

      {/* Door animation */}
      {doorOpen && (
        <div className="door-overlay">
          <div className="kraal-door">
            <div className="door-left">
              <div className="wood-plank"></div>
              <div className="wood-plank"></div>
              <div className="wood-plank"></div>
              <div className="iron-hinge"></div>
              <div className="iron-hinge"></div>
            </div>
            <div className="door-right">
              <div className="wood-plank"></div>
              <div className="wood-plank"></div>
              <div className="wood-plank"></div>
              <div className="iron-hinge"></div>
              <div className="iron-hinge"></div>
              <div className="door-handle"></div>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO CONTENT ── */}
      <div className="homepage-content">
        <h1 className="hp-hero-title">Everything Lives Here</h1>
        <p className="hp-hero-subtitle">Music, art, stories and more — gathered around one fire</p>

        {/* ── YARD PORTS (CIRCULAR GOLD FRAMES) ── */}
        <div className="yard-ports-container">
          {/* Music */}
          <Link to="/music" className="yard-port-item">
            <div className="circular-frame">
              <img src={potMusicImg} alt="Music" />
            </div>
            <h3 className="yard-port-title">MUSIC</h3>
            <span className="yard-port-subtitle">LISTEN</span>
          </Link>

          {/* Home VR (with door animation) */}
          <a href="/homevr" onClick={handleHomeVrClick} className="yard-port-item">
            <div className="circular-frame">
              <img src={potHomeVrImg} alt="Home VR" />
            </div>
            <h3 className="yard-port-title">HOME VR</h3>
            <span className="yard-port-subtitle">EXPERIENCE</span>
          </a>

          {/* Bioscope */}
          <Link to="/bioscope" className="yard-port-item">
            <div className="circular-frame">
              <img src={potBioscopeImg} alt="Bioscope" />
            </div>
            <h3 className="yard-port-title">BIOSCOPE</h3>
            <span className="yard-port-subtitle">WATCH</span>
          </Link>
        </div>

        {/* CTA Button */}
        <button className="hp-cta-btn" onClick={() => navigate('/homevr')}>
          Discover Our World
        </button>

        {/* Ubuntu Quote */}
        <div className="hp-quote">
          <p className="hp-quote-text">
            Umuntu ngumuntu ngabantu — A person is a person through other persons.<br />
            This is the spirit of Kwa Khanye.
          </p>
          <p className="hp-quote-author">UBUNTU — AFRICAN PHILOSOPHY</p>
        </div>
      </div>
    </div>
  );
}